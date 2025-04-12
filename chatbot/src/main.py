from os import path
import sys
import json
import re
from huggingface_hub import InferenceClient
from config import API_KEY


sys.path.append(path.abspath(path.join(path.dirname(__file__), "..")))
from src.pineconeClient import query_pinecone

client = InferenceClient(
    provider="novita",
    api_key=API_KEY,
)
model_name = "deepseek-ai/DeepSeek-V3-0324"

current_tour = None
last_query = ""
ALL_TOURS = {}  

SUPPORTED_DESTINATIONS = []

TOUR_CONFIG = {
    "min_tours_per_destination": 1,  
    "max_destinations_to_show": 2,   
    "max_tours_per_destination": 2    
}

conversation_state = {
    "last_tour_id": None,
    "current_topic": None, 
    "query_counter": 0     
}

# 1. Các hàm khởi tạo và cấu hình
def load_all_tours():
    global ALL_TOURS, SUPPORTED_DESTINATIONS
    ALL_TOURS = {"all": []}
    
    print("🌟 Chào mừng đến với Chatbot Du lịch! 🌟")
    print("👉 Đang tải dữ liệu tour...")

    all_tours = query_pinecone("tour", top_k=30)  
    
    # Tạo cache truy cập nhanh
    tour_by_id = {}
    
    if all_tours:
        # Trích xuất tất cả destinations
        for tour in all_tours:
            destination = tour.get('destination', '')
            if destination and destination != "Khác" and destination not in SUPPORTED_DESTINATIONS:
                SUPPORTED_DESTINATIONS.append(destination)
        
        # Lưu trữ trong tour_by_id để truy cập nhanh
        for tour in all_tours:
            tour_id = tour.get('code', '')
            if tour_id:
                tour_by_id[tour_id] = tour
        
        # Phân loại tours theo destinations
        for tour in all_tours:
            destination = tour.get('destination', '')
            
            # Thêm destination vào tour nếu chưa có
            if 'destination' not in tour:
                tour['destination'] = destination
                
            # Thêm tour vào danh sách theo điểm đến
            if destination not in ALL_TOURS:
                ALL_TOURS[destination] = []
            
            ALL_TOURS[destination].append(tour)
            ALL_TOURS["all"].append(tour)
    
    # Lưu cache vào biến toàn cục để truy cập nhanh
    global TOUR_CACHE
    TOUR_CACHE = {
        'by_id': tour_by_id
    }
    
    print("✅ Đã tải xong dữ liệu tour.")
    print(f"ALL_TOURS loaded with {len(ALL_TOURS)} destinations")
    for dest in ALL_TOURS:
        if dest != "all":
            print(f"- {dest}: {len(ALL_TOURS[dest])} tours")
    print("👉 Bạn có thể hỏi về các tour tại:", ", ".join(SUPPORTED_DESTINATIONS) 
          if SUPPORTED_DESTINATIONS else "Chưa có địa điểm nào")

def _reset_conversation_state():
    return {
        "last_tour_id": None,
        "current_topic": None,
        "query_counter": 0,
        "last_destination": None,
        "last_region": None,
        "user_interests": []  # Lưu trữ sở thích của user qua các lần tương tác
    }

# 2. Các hàm phân tích câu hỏi
def is_destination_related(query):
    query_lower = query.lower()
    
    # Tạo bảng băm từ các từ trong query
    query_words_set = set(query_lower.split())
    
    # Kiểm tra match chính xác trước
    for location in SUPPORTED_DESTINATIONS:
        loc_lower = location.lower()
        if loc_lower in query_lower:
            return location
    
    # Tìm destination có tỉ lệ match cao nhất
    best_match = None
    best_score = 0
    for location in SUPPORTED_DESTINATIONS:
        loc_lower = location.lower()
        loc_words_set = set(loc_lower.split())
        
        # Tính tỉ lệ trùng khớp
        common_words = query_words_set.intersection(loc_words_set)
        if common_words:
            score = len(common_words) / len(loc_words_set)
            if score > best_score and score >= 0.5:  # Yêu cầu tỉ lệ match tối thiểu 50%
                best_score = score
                best_match = location
    
    # Nếu không tìm thấy địa điểm phù hợp, kiểm tra xem có phải người dùng đang hỏi về địa điểm không được hỗ trợ
    if not best_match:
        # Danh sách các từ khóa chỉ địa điểm
        location_keywords = ["đi", "tour", "du lịch", "tham quan", "địa điểm"]
        
        # Kiểm tra xem câu query có chứa từ khóa chỉ địa điểm không
        contains_location_keyword = any(keyword in query_lower for keyword in location_keywords)
        
        # Kiểm tra xem trong câu có từ nào không nằm trong danh sách SUPPORTED_DESTINATIONS không
        potential_locations = [word for word in query_lower.split() if len(word) > 3 and word not in ["tour", "không", "sắp", "tới", "có", "đi"]]
        
        if contains_location_keyword and potential_locations:
            # Trả về từ có thể là địa điểm nhưng không được hỗ trợ
            for word in potential_locations:
                if word not in ' '.join(SUPPORTED_DESTINATIONS).lower():
                    return word.capitalize()  
    
    return best_match

def is_tour_related(query):
    related_keywords = [
        # Từ khóa chung về tour
        "tour", "du lịch", "tham quan", "khám phá", "trải nghiệm",
        "hành trình", "đi", "chuyến", "lịch trình", "chương trình",
        
        # Chi phí
        "giá", "chi phí", "trả", "tiền", "đặt cọc", "thanh toán",
        "bao nhiêu", "mắc", "rẻ", "đắt", "tiết kiệm", "giá cả",
        
        # Thời gian
        "thời gian", "mấy ngày", "bao lâu", "kéo dài", "lịch",
        "ngày", "tuần", "tháng", "giờ", "lịch trình", "hành trình",
        
        # Người tham gia
        "số người", "người tham gia", "tối đa", "quy mô", "sức chứa",
        "đoàn", "nhóm", "gia đình", "bạn bè", "người lớn", "trẻ em",
        
        # Địa điểm
        "địa điểm", "điểm đến", "tham quan", "ghé thăm", "dừng chân", 
        "khách sạn", "resort", "nghỉ dưỡng", "nhà nghỉ", "lưu trú",
        
        # Hoạt động
        "hoạt động", "tham gia", "trải nghiệm", "khám phá", "vui chơi",
        "giải trí", "ẩm thực", "món ăn", "đặc sản", "mua sắm", "chụp ảnh",
        
        # Mô tả
        "mô tả", "chi tiết", "có những gì", "bao gồm", "gồm có",
        "thông tin", "diễn ra", "như thế nào", "ra sao", "ntn"
    ]
    
    query_lower = query.lower()
    
    if len(query_lower.split()) <= 3:
        return True
        
    return any(keyword in query_lower for keyword in related_keywords)

def is_follow_up_question(query, conversation_state):
    query_lower = query.lower()
    
    # Các từ khóa chỉ báo câu hỏi tiếp theo rõ ràng
    explicit_follow_up_indicators = [
        # Từ nối
        "còn", "vậy", "thì", "thì sao", "thế còn", "còn về", "về việc", 
        
        # Câu hỏi ngắn cụ thể về tour hiện tại
        "giá?", "mấy ngày?", "bao lâu?", "bao nhiêu?", "khi nào?", "ở đâu?", 
        
        # Cấu trúc câu hỏi tiếp theo
        "như thế nào", "ra sao", "như nào", "thế nào", "làm sao", "kiểu gì",
        "có gì", "gồm những gì", "bao gồm gì", "có những gì", "có bao nhiêu",
        
        # Đại từ chỉ định không có chủ ngữ rõ ràng
        "nó", "đó", "này", "kia", "họ", "chúng", "tour này", "tour đó"
    ]
    
    # Các từ khóa thông tin cụ thể - cần kết hợp với context để xác định là follow-up
    specific_info_keywords = [
        "giá cả", "chi phí", "thời gian", "lịch trình", "số người", "hoạt động",
        "giảm giá", "khuyến mãi", "ưu đãi", "đặt tour", "thanh toán", "hủy tour"
    ]
    
    # Các từ khóa chỉ rõ một yêu cầu tìm kiếm mới, KHÔNG phải follow-up
    new_search_indicators = [
        "tìm tour", "tour ở", "tour tại", "tour đi", "tour đến", 
        "muốn đi", "có tour", "tour nào", "tour khác", "tour mới"
    ]
    
    # Kiểm tra trước nếu rõ ràng là tìm kiếm mới
    for indicator in new_search_indicators:
        if indicator in query_lower:
            return False
    
    # Kiểm tra nếu có từ khóa follow-up rõ ràng
    for indicator in explicit_follow_up_indicators:
        if indicator in query_lower:
            return True
    
    # Kiểm tra các từ khóa thông tin cụ thể kết hợp với context
    if conversation_state.get("current_topic") is not None:
        for keyword in specific_info_keywords:
            if keyword in query_lower:
                return True
    
    # Kiểm tra nếu điểm đến được đề cập trùng với tour hiện tại
    if current_tour and current_tour.get('destination', '').lower() in query_lower:
        # Nếu query chỉ đề cập đến điểm đến hiện tại và không có từ khóa tìm kiếm mới
        if len(query_lower.split()) <= 5:
            return True
    
    # Kiểm tra trường hợp đặc biệt: câu hỏi rất ngắn không có từ khóa tìm kiếm mới
    if len(query_lower.split()) <= 2 and current_tour:
        has_new_destination = False
        for dest in SUPPORTED_DESTINATIONS:
            if dest.lower() in query_lower and dest.lower() != current_tour.get('destination', '').lower():
                has_new_destination = True
                break
        
        if not has_new_destination:
            return True
        
    return False

def _determine_query_type(query_lower, conversation_state):
    """Xác định loại câu hỏi."""
    if not query_lower.strip() or query_lower.strip() in ["....", ".", "..", "...", "?", "???"]:
        return "empty"
    
    if not any(c.isalnum() for c in query_lower):
        return "empty"  
    
    # Ưu tiên 1: Kiểm tra nếu là câu hỏi về vùng miền
    if any(region in query_lower for region in ["miền bắc", "miền trung", "miền nam"]):
        return "region"
    
    # Ưu tiên 2: Nhận diện câu hỏi về HOẠT ĐỘNG (cần xử lý trước để không bị nhầm)
    activity_patterns = [
        r"(tour|chuyến đi).*(nào).*(có).*(hoạt động|lặn|bơi|ăn uống|ẩm thực)",  # Tour nào có hoạt động gì
        r"(có).*(tour|chuyến đi).*(nào).*(về|có).*(hoạt động|lặn|bơi|ăn uống|ẩm thực)",  # Có tour nào về hoạt động
        r"(tìm|kiếm).*(tour).*(lặn|bơi|ăn uống|ẩm thực)",  # Tìm tour có hoạt động
        r"(muốn|thích).*(lặn|bơi|ăn uống|tham quan)",  # Muốn hoạt động gì
        r"(tour|chuyến đi).*(để).*(lặn|bơi|ăn uống)",  # Tour để làm gì
        r"(tour|chuyến đi).*(phù hợp).*(lặn|bơi|ăn uống)"  # Tour phù hợp với hoạt động gì
    ]
    
    for pattern in activity_patterns:
        if re.search(pattern, query_lower):
            print(f"Matched activity pattern: {pattern}")
            return "activity"
    
    # Ưu tiên 3: Nhận diện câu hỏi về tour cụ thể
    specific_tour_patterns = [
        r"tour\s+(trải nghiệm|khám phá)\s+[\w\s]+(hà nội|đà nẵng|hội an|huế|hồ chí minh|sài gòn|nha trang|đà lạt)",  
        r"(cho\s+\w+\s+biết|thông tin)\s+về\s+tour\s+[\w\s]+",  # "cho tôi biết về tour..."
        r"(giới thiệu|nói|kể)\s+về\s+tour\s+[\w\s]+",  # "giới thiệu về tour..."
        r"tour\s+[\w\s]+(\d+\s+ngày|\d+\s+đêm)"  # Tour + số ngày/đêm
    ]
    
    for pattern in specific_tour_patterns:
        if re.search(pattern, query_lower):
            print(f"Matched specific tour pattern: {pattern}")
            return "specific_tour"
    
    # Ưu tiên 4: Kiểm tra nếu là câu hỏi về tour mới
    new_tour_indicators = [
        "tour khác", "còn tour nào", "tour mới", "tìm tour", "giới thiệu tour", 
        "có tour nào", "tour du lịch", "thông tin tour", "giá của tour", "thời gian tour",
        "mô tả tour", "danh sách tour", "tour ở", "tour tại", "tour đi", "tour đến"
    ]
    if any(indicator in query_lower for indicator in new_tour_indicators):
        # Kiểm tra nếu có đề cập đến điểm đến cụ thể
        for dest in SUPPORTED_DESTINATIONS:
            if dest.lower() in query_lower:
                return "new_tour"
        return "new_tour"
    
    # Ưu tiên 5: Kiểm tra nếu là câu hỏi follow-up cho tour hiện tại
    if current_tour and is_follow_up_question(query_lower, conversation_state):
        return "follow_up"
    
    # Ưu tiên 6: Kiểm tra từ khóa hoạt động riêng lẻ (sau khi đã loại trừ các trường hợp trên)
    activity_keywords = [
        "lặn", "biển", "bơi",
        "ăn uống", "đồ ăn", "món ăn", "ẩm thực", "ăn", "uống", "đặc sản", "hải sản",
        "bbq", "nướng", "tiệc nướng",
        "tham quan", "khám phá", "du lịch", "check-in",
        "cầu rồng", "phun lửa", "cầu",
        "biển", "bãi biển", "bờ biển", "đại dương",
        "văn hóa", "lịch sử", "di sản", "truyền thống",
        "phố cổ", "làng chài", "nhà cổ"
    ]
    
    for activity in activity_keywords:
        if activity in query_lower:
            # Nếu câu hỏi chỉ chứa từ "tour" và từ khóa hoạt động, không có tên cụ thể
            # thì xác định là activity
            if "tour" in query_lower and len(query_lower.split()) <= 5:
                return "activity"
                
            # Nếu câu có dạng "tour có [hoạt động]" mà không có tên tour cụ thể
            if re.search(r"tour\s+(có|với)\s+" + activity, query_lower):
                return "activity"
                
            return "activity"
    
    # Ưu tiên 7 (MỚI): Nhận diện câu hỏi chung về tour (không liên quan đến điểm đến cụ thể)
    general_tour_patterns = [
        r"(tour|chuyến đi).*(phổ biến|nổi tiếng|hay|đẹp|tốt)",  # Tour phổ biến/nổi tiếng
        r"(giới thiệu|gợi ý|cho xem|đề xuất|danh sách).*(tour|chuyến đi)",  # Giới thiệu/gợi ý tour
        r"(có).*(những|một số|các).*(tour|chuyến đi|du lịch)",  # Có những tour nào
        r"(tour|chuyến đi).*(giá).*(dưới|trên|khoảng|từ|bao nhiêu)",  # Tour giá bao nhiêu
        r"(tour|chuyến đi).*(nào).*(giá)",  # Tour nào giá...
        r"(tour|chuyến đi).*(phù hợp|thích hợp).*(với|cho)",  # Tour phù hợp với...
        r"(tour|chuyến đi).*(số lượng|nhóm|gia đình|bạn bè)"  # Tour cho số lượng/nhóm
    ]
    
    for pattern in general_tour_patterns:
        if re.search(pattern, query_lower):
            print(f"Matched general tour pattern: {pattern}")
            return "general_tour"  
    
    # Kiểm tra điểm đến mới
    if any(dest.lower() in query_lower for dest in SUPPORTED_DESTINATIONS) and current_tour:
        current_dest = current_tour.get('destination', '').lower() 
        for dest in SUPPORTED_DESTINATIONS:
            if dest.lower() in query_lower and dest.lower() != current_dest:
                return "new_tour"  
    
    if not is_tour_related(query_lower):
        return "non_tour"
    
    # Mặc định là câu hỏi tìm kiếm mới
    return "search"

def _is_general_tour_question(query_lower):
    general_tour_keywords = ["tour hiện tại", "tour nào", "các tour", "tour du lịch", 
                       "danh sách tour", "giới thiệu tour", "tour phổ biến"]
    return any(keyword in query_lower for keyword in general_tour_keywords)

# Xác định trọng tâm của câu hỏi
def _determine_question_focus(query_lower):
    if any(keyword in query_lower for keyword in ["giá bao nhiêu", "giá", "chi phí"]):
        return "price"
    elif any(keyword in query_lower for keyword in ["thời gian", "kéo dài", "mấy ngày", "bao lâu"]):
        return "duration"
    elif any(keyword in query_lower for keyword in ["đặc điểm", "mô tả", "lịch trình", "có gì", "chương trình"]):
        return "description"
    elif any(keyword in query_lower for keyword in ["số người", "số lượng", "tối đa", "sức chứa", "quy mô"]):
        return "maxParticipants"
    else:
        return "all"
    
# 3. Các hàm tìm kiếm
def _find_specific_tour(query_clean):
    # Làm sạch query và chuyển thành lowercase
    query_clean = re.sub(r'(thông tin|chi tiết|tour|về)\s+', '', query_clean).strip().lower()
    
    # Tạo từ điển để lưu trữ điểm tương đồng của từng tour
    tour_scores = {}
    
    for destination in ALL_TOURS:
        if destination == "all":
            continue
            
        for tour in ALL_TOURS[destination]:
            tour_title = tour.get('title', '').lower()
            
            # Kiểm tra trùng khớp chính xác
            if query_clean in tour_title or tour_title in query_clean:
                return tour
            
            # Kiểm tra trùng khớp từng phần
            query_words = query_clean.split()
            title_words = tour_title.split()
            
            # Tính điểm dựa trên số từ trùng khớp
            matches = sum(1 for word in query_words if word in title_words)
            if matches > 0:
                similarity_score = matches / max(len(query_words), len(title_words))
                tour_scores[tour['code']] = {
                    'score': similarity_score,
                    'tour': tour
                }
    
    # Trả về tour có điểm cao nhất nếu vượt qua ngưỡng
    if tour_scores:
        best_match = max(tour_scores.items(), key=lambda x: x[1]['score'])
        if best_match[1]['score'] >= 0.3:  # Ngưỡng tương đồng tối thiểu
            return best_match[1]['tour']
            
    return None

def _find_tour_by_keywords(query):
    query_lower = query.lower()
    
    # Cải thiện activity mappings và thêm trọng số
    activity_mappings = {
        "lặn biển": {"keywords": ["lặn", "biển", "snorkeling", "diving", "bơi"], "weight": 2.0},
        "ẩm thực": {"keywords": ["ăn uống", "đồ ăn", "món ăn", "ẩm thực", "ăn", "uống", "đặc sản", "hải sản"], "weight": 2.0},
        "bbq": {"keywords": ["bbq", "nướng", "tiệc nướng", "barbeque"], "weight": 2.0},
        "tham quan": {"keywords": ["tham quan", "khám phá", "du lịch", "check-in"], "weight": 1.5},
        "cầu rồng": {"keywords": ["cầu rồng", "phun lửa", "cầu"], "weight": 1.5},
        "biển": {"keywords": ["biển", "bãi biển", "bờ biển", "đại dương"], "weight": 1.5},
        "văn hóa": {"keywords": ["văn hóa", "lịch sử", "di sản", "truyền thống"], "weight": 1.5},
        "phố cổ": {"keywords": ["phố cổ", "làng chài", "nhà cổ"], "weight": 1.5}
    }
    
    # Trực tiếp kiểm tra nếu query ngắn gọn chỉ hỏi về một hoạt động cụ thể
    for activity, info in activity_mappings.items():
        if any(keyword in query_lower for keyword in info["keywords"]):
            # Gán trọng số cao hơn cho các hoạt động
            expanded_keywords = info["keywords"]
            activity_weight = info["weight"]
            
            # Tìm kiếm tour với các từ khóa hoạt động cụ thể này
            results = []
            for destination in ALL_TOURS:
                if destination == "all":
                    continue
                    
                for tour in ALL_TOURS[destination]:
                    title = tour.get('title', '').lower()
                    description = tour.get('description', '').lower()
                    combined_text = title + " " + description
                    
                    matches = 0
                    total_weight = 0
                    
                    for keyword in expanded_keywords:
                        weight = activity_weight  # Sử dụng trọng số của hoạt động
                        if keyword in title:
                            weight *= 1.5  # Tăng thêm nếu từ khóa trong tiêu đề
                        
                        count = combined_text.count(keyword)
                        if count > 0:
                            matches += 1
                            total_weight += weight * count
                    
                    if matches > 0:
                        score = (matches / len(expanded_keywords)) * total_weight
                        results.append({
                            'tour': tour,
                            'score': score
                        })
            
            if results:
                # Sắp xếp theo điểm giảm dần và trả về
                results.sort(key=lambda x: x['score'], reverse=True)
                return [item['tour'] for item in results[:2]] if results else []
    
    # Nếu không có kết quả trực tiếp từ hoạt động, tiếp tục với logic tìm kiếm cũ
    expanded_keywords = []
    query_words = query_lower.split()
    
    stopwords = ["tour", "du", "lịch", "về", "ở", "tại", "có", "những", "các", "và", "không", "nào", "gì", "thú vị"]  
    filtered_words = [w for w in query_words if w not in stopwords and len(w) >= 2]
    
    for word in filtered_words:
        expanded_keywords.append(word)
        for activity, info in activity_mappings.items():
            if word in info["keywords"] or any(syn in query_lower for syn in info["keywords"]):
                expanded_keywords.extend(info["keywords"])
                break
    
    # Loại bỏ trùng lặp
    expanded_keywords = list(set(expanded_keywords))
    
    results = []
    for destination in ALL_TOURS:
        if destination == "all":
            continue
            
        for tour in ALL_TOURS[destination]:
            title = tour.get('title', '').lower()
            description = tour.get('description', '').lower()
            combined_text = title + " " + description
            
            matches = 0
            total_weight = 0
            
            for keyword in expanded_keywords:
                weight = 1.0  # Trọng số mặc định
                if keyword in title:
                    weight = 2.0  # Từ khóa trong tiêu đề quan trọng hơn
                
                count = combined_text.count(keyword)
                if count > 0:
                    matches += 1
                    total_weight += weight * count
            
            if matches > 0:
                score = (matches / len(expanded_keywords)) * total_weight
                results.append({
                    'tour': tour,
                    'score': score
                })
    
    results.sort(key=lambda x: x['score'], reverse=True)
    return [item['tour'] for item in results[:3]] if results else []

def _find_tour_by_id(tour_id):
    for destination in ALL_TOURS:
        for tour in ALL_TOURS[destination]:
            if tour.get('code', '') == tour_id:
                return tour
    return None

def _find_tours_by_destination(destination):
    """Lấy danh sách tour theo điểm đến.""" 
    destination_lower = destination.lower()
    
    # Tìm điểm đến phù hợp nhất
    matched_destination = None
    for supported_dest in SUPPORTED_DESTINATIONS:
        if supported_dest.lower() == destination_lower:
            matched_destination = supported_dest
            break
    
    if not matched_destination:
        return []
    
    return ALL_TOURS.get(matched_destination, [])

def _find_tour_by_similar_name(query):
    """Tìm tour dựa trên tên gần đúng."""
    query_words = set(query.lower().split())
    best_match = None
    best_score = 0
    
    # Lặp qua tất cả các điểm đến trong ALL_TOURS
    for destination in ALL_TOURS:
        if destination == "all":  # Bỏ qua key "all"
            continue
            
        # Lặp qua từng tour trong điểm đến
        for tour in ALL_TOURS[destination]:
            tour_title = tour.get("title", "").lower()
            
            # Tính điểm tương đồng dựa trên số từ trùng khớp
            title_words = set(tour_title.split())
            common_words = query_words.intersection(title_words)
            
            # Tính điểm tương đồng
            if common_words:
                # Tỷ lệ từ trong query khớp với title
                query_match_ratio = len(common_words) / len(query_words)
                # Tỷ lệ từ trong title khớp với query
                title_match_ratio = len(common_words) / len(title_words)
                # Điểm tương đồng tổng hợp
                score = (query_match_ratio + title_match_ratio) / 2
                
                # Nếu score cao hơn ngưỡng và cao hơn best_score hiện tại
                if score > best_score and score >= 0.4:
                    best_score = score
                    best_match = tour
                    
    return best_match
    
# 4. Các hàm hỗ trợ và tiện ích
def format_tour_for_response(tour):
    return {
        "title": tour.get('title', ''),
        "description": tour.get('description', ''),
        "price": tour.get('price', '0'),
        "duration": tour.get('duration', '0'),
        "destination": tour.get('destination', ''),
        "maxParticipants": tour.get('maxParticipants', 0),
        "code": tour.get('code', '')
    }

def _get_ai_response(prompt):
    completion = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
    )
    ai_response = completion.choices[0].message["content"]
    return ai_response.replace("*", "")

def get_region_from_destination(destination):
    north = ["hà nội", "hạ long"]
    central = ["đà nẵng", "hội an","đà lạt"]
    south = ["sài gòn", "vũng tàu", "nha trang"] 

    destination_lower = destination.lower()

    if any(dest in destination_lower for dest in north):
        return "miền bắc"
    elif any(dest in destination_lower for dest in central):
        return "miền trung"
    elif any(dest in destination_lower for dest in south):
        return "miền nam"
    else:
        return None
    
# Chuẩn bị dữ liệu phản hồi dựa trên trọng tâm
def _prepare_focus_data(focus, tour):
    if focus == "price":
        return {"focus": focus, "price": tour.get('price')}
    elif focus == "duration":
        return {"focus": focus, "duration": tour.get('duration')}
    elif focus == "description":
        return {"focus": focus, "description": tour.get('description')}
    elif focus == "maxParticipants":
        return {"focus": focus, "maxParticipants": tour.get('maxParticipants')}
    else:
        return {"focus": focus, "tour": format_tour_for_response(tour)}
    
# 5. Các hàm xử lý câu hỏi
def _handle_specific_tour_question(query, tour, conversation_state):
    global current_tour
    
    current_tour = tour
    conversation_state["last_tour_id"] = tour.get('code', '')
    conversation_state["query_counter"] += 1
    
    focus = _determine_question_focus(query.lower())
    conversation_state["current_topic"] = focus
    
    tour_info = (f"Tiêu đề: {tour.get('title', '')}, "
                 f"Mô tả: {tour.get('description', '')}, "
                 f"Giá: {tour.get('price', '0')}, "
                 f"Thời gian: {tour.get('duration', '0')}, "
                 f"Điểm đến: {tour.get('destination', '')}, "
                 f"Số người tối đa: {tour.get('maxParticipants', '0')}")

    prompt = f"""Dựa trên thông tin tour sau: \n\n{tour_info}\n\n
    Trả lời câu hỏi sau của người dùng: '{query}'.
    Người dùng đang hỏi về {"giá của" if focus == "price" else "thời gian của" if focus == "duration" else
    "mô tả chi tiết của" if focus == "description" else "số người tối đa của" if focus == "maxParticipants" else ""} tour.
    Chỉ trả lời về thông tin của tour này, không đề cập đến các tour khác.
    Trả lời ngắn gọn, súc tích và đầy đủ thông tin."""
    
    try:
        ai_response = _get_ai_response(prompt)
        
        # Điều chỉnh data trả về dựa trên focus
        response_data = {}
        
        if focus in ["price", "duration", "maxParticipants"]:
            response_data = {
                "focus": focus,
                "value": tour.get(focus, "Không có thông tin"),
                "tourTitle": tour.get('title', '')  
            }
        elif focus == "description":
            response_data = {
                "focus": focus,
                "value": tour.get('description', "Không có mô tả"),
                "destination": tour.get('destination', ''),
                "tourTitle": tour.get('title', '')
            }
        else:
            response_data = {
                "focus": focus,
                "tour": format_tour_for_response(tour)
            }
        
        return {
            "status": "success",
            "message": ai_response,
            "data": response_data,
            "error": None
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"Lỗi khi gọi model AI: {str(e)}",
            "message": "",
            "data": None
        }
    
def _handle_destination_question(query, destination, conversation_state):
    global current_tour

    # Kiểm tra xem điểm đến có được hỗ trợ không
    if destination not in SUPPORTED_DESTINATIONS:
        return {
            "status": "warning",
            "message": f"Xin lỗi, hiện tại không có thông tin về tour tại {destination}.",
            "data": None,
            "error": None
        }
    
    # Lấy danh sách tour tại điểm đến này
    destination_tours = _find_tours_by_destination(destination)
    
    if not destination_tours:
        current_tour = None
        conversation_state["last_tour_id"] = None
        conversation_state["current_topic"] = None
        return {
            "status": "warning",
            "message": f"Không tìm thấy tour nào tại {destination}.",
            "data": None,
            "error": None
        }
    
    # Giới hạn số lượng tour trả về
    max_tours = min(TOUR_CONFIG["max_tours_per_destination"], len(destination_tours))
    min_tours = min(TOUR_CONFIG["min_tours_per_destination"], len(destination_tours))
    num_tours = max(min_tours, min(max_tours, len(destination_tours)))
    tours_to_return = destination_tours[:num_tours]
    
    # Tạo context cho AI
    context = "\n".join([
        f"Tiêu đề: {tour.get('title', '')}, "
        f"Mô tả: {tour.get('description', '')}, "
        f"Giá: {tour.get('price', '0')}, "
        f"Thời gian: {tour.get('duration', '0')}, "
        f"Điểm đến: {tour.get('destination', '')}, "
        f"Số người tối đa: {tour.get('maxParticipants', '0')}"
        for tour in tours_to_return
    ])

    prompt = f"""Dựa trên thông tin tour sau: \n\n{context}\n\n
    Trả lời câu hỏi sau của người dùng: '{query}'.
    Người dùng đang tìm tour tại {destination}.
    Hãy trình bày tất cả {len(tours_to_return)} tour theo định dạng sau cho mỗi tour: \n\n
    1. [Tên Tour]\n   - Điểm đến/Hoạt động: [Mô tả ngắn gọn]\n   - Giá: [Giá] | Thời gian: [Thời gian]\n\n
    Bắt đầu bằng một câu giới thiệu ngắn gọn về số lượng tour tìm thấy tại {destination}."""
    
    try:
        ai_response = _get_ai_response(prompt)
        
        # Nếu chỉ có một tour, đặt làm tour hiện tại
        if len(destination_tours) == 1:
            current_tour = destination_tours[0]
            conversation_state["last_tour_id"] = current_tour.get('code', '')
            conversation_state["current_topic"] = "destination"
        
        conversation_state["query_counter"] += 1
        
        return {
            "status": "success",
            "message": ai_response,
            "data": {
                "destination": destination,
                "tours": [format_tour_for_response(tour) for tour in tours_to_return]
            },
            "error": None
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"Lỗi khi gọi model AI: {str(e)}",
            "message": "",
            "data": None
        }
    
def _handle_general_tour_question(query, conversation_state):
    """Xử lý câu hỏi chung về tour bằng cách giới thiệu nhiều tour từ nhiều điểm đến."""

    num_destinations_to_show = TOUR_CONFIG["max_destinations_to_show"]
    destinations_to_show = []
    all_recommended_tours = []
    
    # Chọn một số điểm đến ngẫu nhiên từ danh sách hỗ trợ
    import random
    random_destinations = random.sample(SUPPORTED_DESTINATIONS, min(num_destinations_to_show, len(SUPPORTED_DESTINATIONS)))
    
    # Với mỗi điểm đến, lấy ít nhất 2 tour (nếu có)
    for destination in random_destinations:
        tours = _find_tours_by_destination(destination)
        if tours:
            # Lấy tối thiểu 1, tối đa 2 tour từ mỗi điểm đến
            max_tours = min(TOUR_CONFIG["max_tours_per_destination"], len(tours))
            min_tours = min(TOUR_CONFIG["min_tours_per_destination"], len(tours))
            num_tours = max(min_tours, min(max_tours, len(tours)))
            
            dest_tours = tours[:num_tours]
            all_recommended_tours.extend(dest_tours)
            destinations_to_show.append(destination)
    
    if not all_recommended_tours:
        return {
            "status": "warning",
            "message": "Hiện tại không có tour nào để giới thiệu.",
            "data": None,
            "error": None
        }
    
    # Tạo nội dung tin nhắn
    destination_messages = []
    tours_data = []
    
    # Nhóm tour theo điểm đến và tạo thông báo
    for destination in destinations_to_show:
        dest_tours = [t for t in all_recommended_tours if t.get('destination') == destination]
        if dest_tours:
            destination_messages.append(f"\n🌟 Tour tại {destination}:")
            for i, tour in enumerate(dest_tours):
                title = tour.get('title', 'Không có tiêu đề')
                description = tour.get('description', 'Không có mô tả')
                price = tour.get('price', 'Không rõ giá')
                duration = tour.get('duration', 'Không rõ thời gian')
                
                destination_messages.append(f"{i+1}. {title}\n   - Điểm đến/Hoạt động: {description}\n   - Giá: {price} | Thời gian: {duration}\n")
                tours_data.append(format_tour_for_response(tour))
    
    # Tạo phần giới thiệu
    introduction = f"Hiện có các tour du lịch hấp dẫn tại {len(destinations_to_show)} điểm đến để bạn lựa chọn:"
    
    # Kết hợp thành tin nhắn hoàn chỉnh
    full_message = introduction + "".join(destination_messages)
    
    return {
        "status": "success",
        "message": full_message,
        "data": {
            "tours": tours_data
        },
        "error": None
    }

def _handle_pinecone_results(query, pinecone_results, conversation_state):
    global current_tour
    
    query_lower = query.lower()

    # Trước tiên kiểm tra xem có kết quả nào không
    if not pinecone_results:
        return {
            "status": "warning",
            "message": "Không tìm thấy tour phù hợp với yêu cầu của bạn.",
            "data": None,
            "error": None
        }
    
    interest_keywords = [
    "ẩm thực", "giải trí", "nghỉ dưỡng", "khám phá", "văn hóa",
    "tham quan", "phiêu lưu", "hoạt động", "lịch sử", "ăn uống",
    "đi chơi", "tắm biển", "leo núi", "cắm trại", "check-in",
    "chụp ảnh", "mua sắm", "spa", "massage", "thể thao", 
    "ăn", "uống", "hải sản", "món ngon", "đặc sản" 
    ]
    
    # Kiểm tra địa điểm có được đề cập và có kết quả phù hợp không
    mentioned_location = None
    for location in SUPPORTED_DESTINATIONS:
        if location.lower() in query_lower:
            mentioned_location = location
            break
    
    if mentioned_location and not any(
        mentioned_location.lower() in res.get("destination", "").lower() for res in pinecone_results
    ):
        return {
            "status": "warning",
            "message": f"Không tìm thấy tour nào tại {mentioned_location} phù hợp với yêu cầu của bạn.",
            "data": None,
            "error": None
        }
    
    # Xử lý dựa trên từ khóa liên quan đến sở thích
    if any(keyword in query_lower for keyword in interest_keywords):
        most_relevant = pinecone_results[0]
        
        context = (f"Tiêu đề: {most_relevant.get('title', '')}, "
                   f"Mô tả: {most_relevant.get('description', '')}, "
                   f"Giá: {most_relevant.get('price', '0')}, "
                   f"Thời gian: {most_relevant.get('duration', '0')}, "
                   f"Điểm đến: {most_relevant.get('destination', '')}, "
                   f"Số người tối đa: {most_relevant.get('maxParticipants', '0')}")

        prompt = f"""Dựa trên thông tin tour sau: \n\n{context}\n\n
                      Trả lời câu hỏi sau của người dùng: '{query}'.
                      Hãy giới thiệu một tour phù hợp nhất với yêu cầu '{query}' của người dùng: \n\n
                      [Tên Tour]\n - Điểm đến/Hoạt động: [Mô tả ngắn gọn]\n - Giá: [Giá] | Thời gian: [Thời gian]\n\n
                      Bắt đầu với một câu giới thiệu ngắn gọn về tour này."""
        
        # Cập nhật current_tour
        current_tour = most_relevant
        conversation_state["last_tour_id"] = most_relevant.get('code', '')
        conversation_state["current_topic"] = "interest"
        
        try:
            ai_response = _get_ai_response(prompt)
            
            conversation_state["query_counter"] += 1
            
            return {
                "status": "success",
                "message": ai_response,
                "data": {"tours": [format_tour_for_response(most_relevant)]},
                "error": None
            }
        except Exception as e:
            return {
                "status": "error",
                "error": f"Lỗi khi gọi model AI: {str(e)}",
                "message": "",
                "data": None
            }
    else:
        # Xử lý với tất cả kết quả
        context = "\n".join([
            f"Tiêu đề: {tour.get('title', '')}, "
            f"Mô tả: {tour.get('description', '')}, "
            f"Giá: {tour.get('price', '0')}, "
            f"Thời gian: {tour.get('duration', '0')}, "
            f"Điểm đến: {tour.get('destination', '')}, "
            f"Số người tối đa: {tour.get('maxParticipants', '0')}"
            for tour in pinecone_results
        ])

        prompt = f"""Dựa trên thông tin tour sau: \n\n{context}\n\n
                      Trả lời câu hỏi sau của người dùng: '{query}'.
                      Nếu câu hỏi là về danh sách tour, hãy trình bày theo định dạng sau cho mỗi tour: \n\n
                      1. [Tên Tour]\n  - Điểm đến/Hoạt động: [Mô tả ngắn gọn]\n  - Giá: [Giá] | Thời gian: [Thời gian]\n\n
                      Bắt đầu bằng một câu giới thiệu ngắn gọn về số lượng tour tìm thấy."""
        
        try:
            ai_response = _get_ai_response(prompt)
            
            # Cập nhật current_tour nếu chỉ có 1 kết quả
            if len(pinecone_results) == 1:
                current_tour = pinecone_results[0]
                conversation_state["last_tour_id"] = current_tour.get('code', '')
            
            conversation_state["query_counter"] += 1
            
            return {
                "status": "success",
                "message": ai_response,
                "data": {"tours": [format_tour_for_response(tour) for tour in pinecone_results]},
                "error": None
            }
        except Exception as e:
            return {
                "status": "error",
                "error": f"Lỗi khi gọi model AI: {str(e)}",
                "message": "",
                "data": None
            }


def _handle_follow_up_question(query, tour, conversation_state):
    query_lower = query.lower()
    
    # THÊM VÀO: Kiểm tra nếu người dùng đang hỏi về tour khác
    if any(keyword in query_lower for keyword in ["tour khác", "còn tour nào", "tour mới"]):
        # Gọi hàm xử lý câu hỏi về tour chung
        return _handle_general_tour_question(query, conversation_state)
    
    focus = _determine_question_focus(query_lower)
    
    tour_info = (f"Tiêu đề: {tour.get('title', '')}, "
                 f"Mô tả: {tour.get('description', '')}, "
                 f"Giá: {tour.get('price', '0')}, "
                 f"Thời gian: {tour.get('duration', '0')}, "
                 f"Điểm đến: {tour.get('destination', '')}, "
                 f"Số người tối đa: {tour.get('maxParticipants', '0')}")

    prompt = f"""Dựa trên thông tin tour sau: \n\n{tour_info}\n\n
    Trả lời câu hỏi sau của người dùng: '{query}'.
    Chỉ đề cập đến tour này, không đề cập đến các tour khác.
    Trả lời ngắn gọn, súc tích và đầy đủ thông tin."""

    conversation_state["current_topic"] = focus
    conversation_state["query_counter"] += 1
    
    try:
        ai_response = _get_ai_response(prompt)
        
        response = {
            "status": "success",
            "message": ai_response,
            "data": _prepare_focus_data(focus, tour),
            "error": None
        }
        return response
    except Exception as e:
        return {
            "status": "error",
            "error": f"Lỗi khi gọi model AI: {str(e)}",
            "message": "",
            "data": None
        }

def _handle_region_question(query, conversation_state):
    query_lower = query.lower()

    target_region = None
    if "miền bắc" in query_lower:
        target_region = "miền bắc"
    elif "miền trung" in query_lower:
        target_region = "miền trung"
    elif "miền nam" in query_lower:
        target_region = "miền nam"

    if not target_region:
        return {
            "status": "warning",
            "message": "Không xác định được miền bạn muốn du lịch. Vui lòng nêu rõ miền Bắc, miền Trung hay miền Nam.",
            "data": None,
            "error": None
        }

    # Lọc các địa điểm hỗ trợ theo miền
    supported_destinations_in_region = []
    for destination in SUPPORTED_DESTINATIONS:
        dest_region = get_region_from_destination(destination)
        if dest_region == target_region:
            supported_destinations_in_region.append(destination)

    # Số điểm đến tối đa để hiển thị
    max_destinations = 2
    selected_destinations = supported_destinations_in_region[:min(max_destinations, len(supported_destinations_in_region))]
    
    all_selected_tours = []
    dest_tour_mapping = {}
    
    for destination in selected_destinations:
        tours_for_destination = _find_tours_by_destination(destination)
        if tours_for_destination:
            tours_to_show = tours_for_destination[:min(1, len(tours_for_destination))]
            all_selected_tours.extend(tours_to_show)
            dest_tour_mapping[destination] = tours_to_show

    if not all_selected_tours:
        return {
            "status": "warning",
            "message": f"Hiện tại không có thông tin về tour du lịch ở {target_region}.",
            "data": None,
            "error": None
        }

    all_tour_info = []
    for tour in all_selected_tours:
        tour_info = (f"Tiêu đề: {tour.get('title', '')}, "
                   f"Mô tả: {tour.get('description', '')}, "
                   f"Giá: {tour.get('price', '0')}, "
                   f"Thời gian: {tour.get('duration', '0')}, "
                   f"Điểm đến: {tour.get('destination', '')}, "
                   f"Số người tối đa: {tour.get('maxParticipants', '0')}")
        all_tour_info.append(tour_info)
    
    context = "\n\n".join(all_tour_info)

    prompt = f"""Dựa trên thông tin tour sau: \n\n{context}\n\n
    Trả lời câu hỏi sau của người dùng: '{query}'.
    Người dùng đang tìm tour tại {target_region}.
    Hãy trình bày tour theo địa điểm, sử dụng định dạng sau: \n\n
    📍 [Tên Địa Điểm]:
    1. [Tên Tour]\n   - Điểm đến/Hoạt động: [Mô tả ngắn gọn]\n   - Giá: [Giá] | Thời gian: [Thời gian]\n\n
    Bắt đầu bằng một câu giới thiệu ngắn gọn về số lượng tour tìm thấy tại {target_region}."""

    ai_response = _get_ai_response(prompt)
    
    formatted_tours = []
    for tour in all_selected_tours:
        formatted_tours.append(format_tour_for_response(tour))
    
    return {
        "status": "success",
        "message": ai_response,
        "data": {
            "region": target_region,
            "tours": formatted_tours
        },
        "error": None
    }

def _handle_keyword_matches(query, tours, conversation_state):
    if len(tours) == 1:
        global current_tour
        current_tour = tours[0]
        conversation_state["last_tour_id"] = tours[0].get('code', '')
        return _handle_specific_tour_question(query, tours[0], conversation_state)
    
    tour_contexts = []
    for tour in tours:
        tour_info = (f"Tiêu đề: {tour.get('title', '')}, "
                 f"Mô tả: {tour.get('description', '')}, "
                 f"Giá: {tour.get('price', '0')}, "
                 f"Thời gian: {tour.get('duration', '0')}, "
                 f"Điểm đến: {tour.get('destination', '')}, "
                 f"Số người tối đa: {tour.get('maxParticipants', '0')}")
        tour_contexts.append(tour_info)
    
    context = "\n\n".join(tour_contexts)
    
    prompt = f"""Dựa trên thông tin tour sau: \n\n{context}\n\n
    Trả lời câu hỏi sau của người dùng: '{query}'.
    Hãy giới thiệu các tour phù hợp với yêu cầu của người dùng theo định dạng sau: \n\n
    1. [Tên Tour]\n   - Điểm đến/Hoạt động: [Mô tả ngắn gọn]\n   - Giá: [Giá] | Thời gian: [Thời gian]\n\n
    Bắt đầu bằng một câu giới thiệu ngắn gọn về các tour được tìm thấy."""
    
    try:
        ai_response = _get_ai_response(prompt)
        
        return {
            "status": "success",
            "message": ai_response,
            "data": {"tours": [format_tour_for_response(tour) for tour in tours]},
            "error": None
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"Lỗi khi gọi model AI: {str(e)}",
            "message": "",
            "data": None
        }
    
    
# 6. Các hàm tạo response
def _create_success_response(message, data=None):
    """Tạo phản hồi thành công."""
    return {
        "status": "success",
        "message": message,
        "data": data,
        "error": None
    }

def _create_warning_response(message, data=None):
    """Tạo phản hồi cảnh báo."""
    return {
        "status": "warning",
        "message": message,
        "data": data,
        "error": None
    }

def _create_error_response(error_message):
    """Tạo phản hồi lỗi."""
    return {
        "status": "error",
        "error": error_message,
        "message": "",
        "data": None
    }

# 7. Hàm chính để xử lý câu hỏi
def search(query):
    global current_tour, last_query, conversation_state
    
    # 1. Kiểm tra và tiền xử lý query
    if not query.strip() or not any(c.isalnum() for c in query):
        return _create_error_response("Vui lòng nhập câu hỏi hợp lệ!")  
    
    last_query = query
    query_lower = query.lower()
    
    # 2. Xác định loại câu hỏi
    query_type = _determine_query_type(query_lower, conversation_state)
    print(f"Query Type: {query_type}")
    
    # 3. Xử lý theo loại câu hỏi
    if query_type == "empty":
        return _create_error_response("Vui lòng nhập câu hỏi hợp lệ!")
    elif query_type == "region":
        return _handle_region_question(query, conversation_state)
    elif query_type == "follow_up":
        return _handle_follow_up_question(query, current_tour, conversation_state)
    elif query_type == "specific_tour":  
        # Ưu tiên tìm theo tên tour
        tour_by_name = _find_tour_by_similar_name(query_lower)
        if tour_by_name:
            return _handle_specific_tour_question(query, tour_by_name, conversation_state)
        
        # Hoặc tìm tour cụ thể
        matched_tour = _find_specific_tour(query_lower)
        if matched_tour:
            return _handle_specific_tour_question(query, matched_tour, conversation_state)
    elif query_type == "activity":
        keyword_matches = _find_tour_by_keywords(query)
        if keyword_matches:
            return _handle_keyword_matches(query, keyword_matches, conversation_state)
        else:
            return _create_warning_response(
                f"Xin lỗi, không tìm thấy tour nào có hoạt động phù hợp với yêu cầu của bạn. Chúng tôi hiện chỉ có tour tại: {', '.join(SUPPORTED_DESTINATIONS)}."
            )
    elif query_type == "new_tour":
        current_tour = None
        conversation_state = _reset_conversation_state()
    elif query_type == "general_tour":
        return _handle_general_tour_question(query, conversation_state)
    elif query_type == "non_tour":
        return _create_error_response("Câu hỏi không liên quan đến tour. Vui lòng hỏi về các tour hoặc điểm đến.")
    
    # 4.0 Kiểm tra nếu đang tìm tour cụ thể theo tên
    tour_by_name = _find_tour_by_similar_name(query_lower)
    if tour_by_name:
        return _handle_specific_tour_question(query, tour_by_name, conversation_state)
    
    # 4.1. Tìm tour cụ thể (nếu có)
    matched_tour = _find_specific_tour(query_lower)
    if matched_tour:
        return _handle_specific_tour_question(query, matched_tour, conversation_state)
    
    # 4.2. Tìm theo điểm đến 
    destination = is_destination_related(query)
    if destination:
        # Kiểm tra xem điểm đến có nằm trong danh sách được hỗ trợ không
        if destination not in SUPPORTED_DESTINATIONS:
            return {
                "status": "warning",
                "message": f"Xin lỗi, hiện tại không có thông tin về tour. Chúng tôi hiện chỉ có tour tại: {', '.join(SUPPORTED_DESTINATIONS)}.",
                "data": None,
                "error": None
            }
        return _handle_destination_question(query, destination, conversation_state)
    
    # 4.3. Tìm theo từ khóa trong mô tả (ƯU TIÊN TÌM KIẾM HOẠT ĐỘNG Ở ĐÂY)
    keyword_matches = _find_tour_by_keywords(query)
    if keyword_matches:
        return _handle_keyword_matches(query, keyword_matches, conversation_state)
    
    # 4.4. Xử lý câu hỏi chung về tour
    if _is_general_tour_question(query_lower):
        return _handle_general_tour_question(query, conversation_state)
    
    # 4.5. Tìm kiếm Pinecone nếu không khớp với các trường hợp trên
    pinecone_results = query_pinecone(query, top_k=3)
    if pinecone_results:
        return _handle_pinecone_results(query, pinecone_results, conversation_state)
    
    # 5. Không tìm thấy thông tin
    return _create_warning_response(
        f"Xin lỗi, hiện tại không có thông tin về tour. Chúng tôi hiện chỉ có tour tại: {', '.join(SUPPORTED_DESTINATIONS)}."
    )
def main():
    load_all_tours()

    while True:
        user_query = input("\nNhập câu hỏi (bấm 'z' để thoát): ")
        if user_query.lower() == "z":
            print("👋 Hẹn gặp lại!")
            break
        
        result = search(user_query)
        # Hiển thị kết quả dưới dạng JSON cho mục đích testing
        print(json.dumps(result, ensure_ascii=False, indent=2))

def handle_query(query):
    if not ALL_TOURS:
        load_all_tours()

    return search(query)

if __name__ == "__main__":
    main()