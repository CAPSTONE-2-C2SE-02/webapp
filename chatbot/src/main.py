import json
import sys
from os import path
from openai import OpenAI
from config import API_KEY
import re
from fuzzywuzzy import fuzz, process

sys.path.append(path.abspath(path.join(path.dirname(__file__), "..")))
from src.pineconeClient import query_pinecone

client = OpenAI(api_key=API_KEY)

# State để lưu context cuộc hội thoại
conversation_context = {
    "history": [],
    "current_tours": [],
    "last_query": ""
}

def normalize_text(text):
    """Chuẩn hóa text để so sánh (loại bỏ dấu, viết thường)"""
    if not text:
        return ""
    
    # Chuyển về viết thường
    text = text.lower()
    
    # Loại bỏ dấu tiếng Việt
    replacements = {
        'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        'đ': 'd'
    }
    
    for accented, plain in replacements.items():
        text = text.replace(accented, plain)
    
    return text

def extract_location_from_tours(tours):
    """Trích xuất danh sách địa danh từ dữ liệu tours có sẵn"""
    locations = set()
    for tour in tours:
        destination = tour.get('destination', '')
        title = tour.get('title', '')
        
        # Tách từ destination và title
        if destination:
            locations.add(destination.strip())
        
        # Trích xuất tên địa danh từ title
        title_words = re.findall(r'\b[A-ZÀ-Ỹ][a-zà-ỹ]*(?:\s+[A-ZÀ-Ỹ][a-zà-ỹ]*)*\b', title)
        for word in title_words:
            if len(word) > 2:  # Loại bỏ từ quá ngắn
                locations.add(word.strip())
    
    return list(locations)

def find_location_matches(user_query, available_locations, threshold=70):
    """Sử dụng fuzzy matching để tìm địa danh phù hợp"""
    query_normalized = normalize_text(user_query)
    
    # Tìm các từ có thể là địa danh trong query
    potential_locations = []
    words = query_normalized.split()
    
    for word in words:
        if len(word) > 2:  # Bỏ qua từ quá ngắn
            # Tìm match tốt nhất cho từ này
            best_match = process.extractOne(
                word, 
                available_locations, 
                scorer=fuzz.ratio,
                score_cutoff=threshold
            )
            
            if best_match:
                potential_locations.append({
                    'query_term': word,
                    'matched_location': best_match[0],
                    'confidence': best_match[1] / 100.0
                })
    
    # Thử cả cụm từ
    for location in available_locations:
        location_normalized = normalize_text(location)
        similarity = fuzz.partial_ratio(query_normalized, location_normalized)
        
        if similarity >= threshold:
            potential_locations.append({
                'query_term': user_query,
                'matched_location': location,
                'confidence': similarity / 100.0
            })
    
    # Loại bỏ duplicate và sắp xếp theo confidence
    unique_locations = {}
    for loc in potential_locations:
        key = loc['matched_location']
        if key not in unique_locations or loc['confidence'] > unique_locations[key]['confidence']:
            unique_locations[key] = loc
    
    return sorted(unique_locations.values(), key=lambda x: x['confidence'], reverse=True)

def check_location_match(tour, target_locations, threshold=70):
    """Kiểm tra tour có match với địa danh mục tiêu không"""
    if not target_locations:
        return False, 0
    
    destination = tour.get('destination', '').lower()
    title = tour.get('title', '').lower()
    
    dest_normalized = normalize_text(destination)
    title_normalized = normalize_text(title)
    
    max_score = 0
    
    for location_info in target_locations:
        target_location = normalize_text(location_info['matched_location'])
        
        # Kiểm tra trong destination (ưu tiên cao nhất)
        dest_similarity = fuzz.partial_ratio(target_location, dest_normalized)
        if dest_similarity >= threshold:
            max_score = max(max_score, dest_similarity / 100.0)
        
        # Kiểm tra trong title
        title_similarity = fuzz.partial_ratio(target_location, title_normalized)
        if title_similarity >= threshold:
            max_score = max(max_score, (title_similarity / 100.0) * 0.8)  # Giảm trọng số cho title
    
    return max_score >= (threshold / 100.0), max_score


def extract_price_constraints(query):
    """Extract price constraints from query (e.g., dưới 100000, từ 500000 đến 1000000)"""
    query_normalized = normalize_text(query)
    price_pattern = r"(dưới|trên|từ\s*\d+\s*đến\s*\d+|khoảng\s*\d+|\d+)"
    matches = re.findall(price_pattern, query_normalized)
    
    price_filter = {}
    for match in matches:
        if match.startswith("dưới"):
            price = re.search(r"\d+", match)
            if price:
                price_filter["max_price"] = int(price.group())
        elif match.startswith("trên"):
            price = re.search(r"\d+", match)
            if price:
                price_filter["min_price"] = int(price.group())
        elif match.startswith("từ"):
            prices = re.findall(r"\d+", match)
            if len(prices) == 2:
                price_filter["min_price"] = int(prices[0])
                price_filter["max_price"] = int(prices[1])
        elif match.startswith("khoảng"):
            price = re.search(r"\d+", match)
            if price:
                price_filter["approx_price"] = int(price.group())
    
    return price_filter


def is_specific_tour_query(query, available_tours, threshold=85):
    """Check if query is asking for a specific tour by title"""
    query_normalized = normalize_text(query)
    for tour in available_tours:
        title_normalized = normalize_text(tour.get('title', ''))
        similarity = fuzz.partial_ratio(query_normalized, title_normalized)
        if similarity >= threshold:
            return True, tour
    return False, None

def get_search_strategy(user_query: str, available_locations: list, available_tours: list) -> dict:
    """Xác định chiến lược tìm kiếm: location, price, or specific tour"""
    query_normalized = normalize_text(user_query)
    
    # Check for specific tour query
    is_specific, specific_tour = is_specific_tour_query(user_query, available_tours)
    if is_specific:
        return {
            "search_type": "specific_tour",
            "search_query": specific_tour.get('title', ''),
            "is_location_query": False,
            "confidence": 1.0,
            "target_locations": [],
            "specific_tour": specific_tour
        }
    
    # Check for price-based query
    price_filter = extract_price_constraints(user_query)
    if price_filter:
        return {
            "search_type": "price_specific",
            "search_query": user_query,
            "is_location_query": False,
            "confidence": 0.9,
            "target_locations": [],
            "price_filter": price_filter
        }
    
    # Check for location-based query
    found_locations = find_location_matches(user_query, available_locations)
    if found_locations:
        best_locations = [loc for loc in found_locations if loc['confidence'] > 0.7]
        if best_locations:
            location_terms = [loc['matched_location'] for loc in best_locations[:2]]
            search_query = f"tour {' '.join(location_terms)}"
            return {
                "search_type": "location_specific",
                "search_query": search_query,
                "is_location_query": True,
                "confidence": max([loc['confidence'] for loc in best_locations]),
                "target_locations": best_locations,
                "price_filter": {}
            }
    
    return {
        "search_type": "general_search",
        "search_query": user_query,
        "is_location_query": False,
        "confidence": 0.7,
        "target_locations": [],
        "price_filter": {}
    }
def search_tours(strategy: dict, user_query: str) -> list:
    """Tìm kiếm tours dựa trên chiến lược"""
    search_query = strategy.get("search_query", user_query)
    search_type = strategy.get("search_type", "general_search")
    target_locations = strategy.get("target_locations", [])
    price_filter = strategy.get("price_filter", {})
    
    try:
        # Specific tour query
        if search_type == "specific_tour":
            return [strategy["specific_tour"]]
        
        # Query Pinecone for initial results
        initial_results = query_pinecone(search_query, top_k=20)
        if not initial_results:
            return []
        
        
        # Price-based query
        if search_type == "price_specific":
            filtered_tours = []
            for tour in initial_results:
                price_str = tour.get('price', '0')
                try:
                    price = int(re.sub(r'[^\d]', '', price_str))
                except ValueError:
                    continue
                
                matches = True
                if "max_price" in price_filter and price > price_filter["max_price"]:
                    matches = False
                if "min_price" in price_filter and price < price_filter["min_price"]:
                    matches = False
                if "approx_price" in price_filter:
                    # Allow ±20% range for approximate price
                    if not (price_filter["approx_price"] * 0.8 <= price <= price_filter["approx_price"] * 1.2):
                        matches = False
                if matches:
                    filtered_tours.append(tour)
            
            return filtered_tours[:3]
        
        # Location-specific query
        if search_type == "location_specific" and target_locations:
            location_matched_tours = []
            for tour in initial_results:
                is_match, score = check_location_match(tour, target_locations)
                if is_match:
                    tour['location_match_score'] = score
                    location_matched_tours.append(tour)
            
            location_matched_tours.sort(key=lambda x: x.get('location_match_score', 0), reverse=True)
            return location_matched_tours[:3]
        
        # General search
        return initial_results[:3]
        
    except Exception as e:
        print(f"❌ Lỗi search: {e}")
        return []

def generate_response(user_query: str, strategy: dict, tours: list) -> dict:
    """Tạo câu trả lời theo định dạng yêu cầu"""
    search_type = strategy.get("search_type", "general_search")
    target_locations = strategy.get("target_locations", [])
    price_filter = strategy.get("price_filter", {})
    
    # Format tour data
    formatted_tours = []
    for tour in tours[:3]:
        formatted_tours.append({
            "id": tour.get('code', ''),
            "title": tour.get('title', ''),
            "price": tour.get('price', ''),
            "duration": tour.get('duration', ''),
            "destination": tour.get('destination', ''),
            "description": tour.get('description', ''),
            "maxParticipants": tour.get('maxParticipants', ''),
            "score": tour.get('location_match_score', tour.get('score', 0))
        })
    
    # Check if any tours match the criteria
    if not tours:
        message = "Rất tiếc, hiện tại chúng tôi chưa có tour phù hợp trong hệ thống. Vui lòng liên hệ để được tư vấn thêm! 🙏"
        if search_type == "location_specific" and target_locations:
            location_names = [loc['matched_location'] for loc in target_locations]
            message = f"Rất tiếc, hiện tại chúng tôi chưa có tour đến {', '.join(location_names)} trong hệ thống. Vui lòng liên hệ để được tư vấn thêm! 🙏"
        elif search_type == "price_specific":
            if "max_price" in price_filter:
                message = f"Rất tiếc, hiện tại chúng tôi chưa có tour dưới {price_filter['max_price']} VND trong hệ thống. Vui lòng liên hệ để được tư vấn thêm! 🙏"
            elif "min_price" in price_filter:
                message = f"Rất tiếc, hiện tại chúng tôi chưa có tour trên {price_filter['min_price']} VND trong hệ thống. Vui lòng liên hệ để được tư vấn thêm! 🙏"
            elif "approx_price" in price_filter:
                message = f"Rất tiếc, hiện tại chúng tôi chưa có tour khoảng {price_filter['approx_price']} VND trong hệ thống. Vui lòng liên hệ để được tư vấn thêm! 🙏"
        elif search_type == "specific_tour":
            message = f"Rất tiếc, không tìm thấy tour '{strategy['search_query']}' trong hệ thống. Vui lòng kiểm tra lại tên tour hoặc liên hệ để được tư vấn thêm! 🙏"
        
        return {
            "status": "warning",
            "message": message,
            "tour_data": None
        }
    
    # Prepare prompt for AI
    tours_info = f"✅ TÌM THẤY {len(tours)} TOUR PHÙ HỢP NHẤT:\n"
    for i, tour in enumerate(tours[:3], 1):
        tours_info += f"""
Tour {i}: {tour.get('title', 'Không có tên')}
- Giá: {tour.get('price', 'Liên hệ')}
- Thời gian: {tour.get('duration', 'N/A')}
- Điểm đến: {tour.get('destination', 'N/A')}
- Số người tối đa: {tour.get('maxParticipants', 'N/A')}
- Mô tả: {tour.get('description', 'Không có mô tả')[:150]}...
"""
    
    response_prompt = f"""
Bạn là chuyên gia tư vấn du lịch Việt Nam. Phân tích và trả lời:

CÂU HỎI: "{user_query}"
LOẠI TÌM KIẾM: {search_type}
{tours_info}

NGUYÊN TẮC TRẢ LỜI:
1. Chỉ giới thiệu TỐI ĐA 3 TOURS hoặc 1 tour nếu hỏi cụ thể
2. Nếu hỏi về tour cụ thể, chỉ trả lời thông tin của tour đó
3. Nếu không có tour phù hợp, trả lời rõ ràng và gợi ý liên hệ
4. Sử dụng emoji, ngôn ngữ thân thiện
5. Trung thực, chỉ nói về tours trong danh sách
6. Nếu hỏi về giá hoặc số người, nhấn mạnh thông tin đó

Trả lời chuyên nghiệp, ngắn gọn, chính xác.
"""
    
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "Bạn là AI tư vấn tour du lịch Việt Nam. Luôn trung thực, trả lời ngắn gọn."},
                {"role": "user", "content": response_prompt}
            ],
            model="gpt-3.5-turbo",
            temperature=0.3,
            max_tokens=1000
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        # Check if response contains "xin lỗi" or "rất tiếc"
        if "xin lỗi" in ai_response.lower() or "rất tiếc" in ai_response.lower():
            return {
                "status": "warning",
                "message": ai_response,
                "tour_data": None
            }
        
        return {
            "status": "success",
            "message": ai_response,
            "tour_data": formatted_tours
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": "Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn. Vui lòng thử lại! 🙏",
            "tour_data": None
        }

def update_conversation_context(query: str, response: dict):
    """Cập nhật context cuộc hội thoại"""
    
    conversation_context["history"].append({
        "query": query,
        "response": response.get("message", ""),
        "tours_found": response.get("data", {}).get("tours_found", 0)
    })
    
    # Giữ chỉ 5 lượt hội thoại gần nhất
    if len(conversation_context["history"]) > 5:
        conversation_context["history"] = conversation_context["history"][-5:]
    
    conversation_context["last_query"] = query
    if response.get("data", {}).get("tours"):
        conversation_context["current_tours"] = response["data"]["tours"]

def handle_query(user_query: str) -> dict:
    """Hàm chính xử lý câu hỏi của user"""
    if not user_query.strip():
        return {
            "status": "error",
            "message": "Vui lòng nhập câu hỏi của bạn! 😊",
            "tour_data": None
        }
    
    try:
        # Lấy dữ liệu mẫu để trích xuất địa danh và tour
        sample_tours = query_pinecone("tour vietnam", top_k=50)
        available_locations = extract_location_from_tours(sample_tours)
        
        # Bước 1: Phân tích strategy
        strategy = get_search_strategy(user_query, available_locations, sample_tours)
        
        # Bước 2: Tìm kiếm tours
        tours = search_tours(strategy, user_query)
        
        # Bước 3: Tạo response
        response = generate_response(user_query, strategy, tours)
        
        # Bước 4: Cập nhật context
        update_conversation_context(user_query, response)
        
        return response
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return {
            "status": "error",
            "message": "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại! 🙏",
            "tour_data": None
        }

def main():
    """Hàm chạy chatbot trong terminal"""
    
    print("🌟 Smart Tour Chatbot - Fuzzy Search Version! 🌟")
    print("✨ Ví dụ: 'Tour đi Quảng Nam', 'Có tour Đà Nẵng không?', 'Tour Sapa'")
    print("-" * 60)
    
    while True:
        user_input = input("\n🎯 Câu hỏi của bạn (hoặc 'quit' để thoát): ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("👋 Cảm ơn bạn đã sử dụng dịch vụ!")
            break
            
        if not user_input:
            print("❌ Vui lòng nhập câu hỏi!")
            continue
            
        # Xử lý câu hỏi
        result = handle_query(user_input)
        
        # Hiển thị kết quả
        print("\n" + "="*60)
        print("📋 Kết quả:")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        print("="*60)

if __name__ == "__main__":
    main()