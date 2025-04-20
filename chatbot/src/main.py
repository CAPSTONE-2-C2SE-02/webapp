from os import path
import sys
import json
import random
import re
from huggingface_hub import InferenceClient
from config import API_KEY
from openai import OpenAI


sys.path.append(path.abspath(path.join(path.dirname(__file__), "..")))
from src.pineconeClient import query_pinecone

client = OpenAI(api_key=API_KEY)

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
    SUPPORTED_DESTINATIONS = []
    
    print("🌟 Chào mừng đến với Chatbot Du lịch! 🌟")
    print("👉 Đang tải dữ liệu tour...")

    all_tours = query_pinecone("tour", top_k=30)  
    
    # Tạo cache truy cập nhanh
    tour_by_id = {}
    
    if all_tours:
        # Trích xuất tất cả cặp departure-destination
        for tour in all_tours:
            destination = tour.get('destination', '')
            departure = tour.get('departure', '')
            
            if destination and departure:
                route = f"{departure} - {destination}"
                if route not in SUPPORTED_DESTINATIONS and destination != "Khác":
                    SUPPORTED_DESTINATIONS.append(route)
        
        # Lưu trữ trong tour_by_id để truy cập nhanh
        for tour in all_tours:
            tour_id = tour.get('code', '')
            if tour_id:
                tour_by_id[tour_id] = tour
        
        # Đảm bảo lưu trữ theo cả route
        for tour in all_tours:
            destination = tour.get('destination', '')
            departure = tour.get('departure', '')
        
            if destination and departure:
                route = f"{departure} - {destination}"
                if route not in ALL_TOURS:
                    ALL_TOURS[route] = []
            
                ALL_TOURS[route].append(tour)
                ALL_TOURS["all"].append(tour)
            
                # Thêm route vào danh sách các tuyến hỗ trợ nếu chưa có
                if route not in SUPPORTED_DESTINATIONS:
                    SUPPORTED_DESTINATIONS.append(route)
    
    # Lưu cache vào biến toàn cục để truy cập nhanh
    global TOUR_CACHE
    TOUR_CACHE = {
        'by_id': tour_by_id
    }
    
    print("✅ Đã tải xong dữ liệu tour.")
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
    
    # Tạo cấu trúc để lưu trữ kết quả với hướng đi chính xác
    found_routes = []
    
    # Kiểm tra các pattern cụ thể để xác định điểm đi và điểm đến
    for route in SUPPORTED_DESTINATIONS:
        route_lower = route.lower()
        departure, destination = route_lower.split(" - ")
        
        # Tạo cả hai chiều của tuyến đường để kiểm tra
        forward_route = f"{departure} - {destination}"  # tuyến gốc
        reverse_route = f"{destination} - {departure}"  # tuyến ngược chiều
        
        # Kiểm tra pattern rõ ràng cho tuyến gốc
        forward_indicators = [
            re.compile(f"{departure}\\s*[-–—]\\s*{destination}"),
            re.compile(f"từ\\s+{departure}\\s+(?:đi|đến|tới|ra)\\s+{destination}"),
            re.compile(f"{departure}\\s+(?:đi|đến|tới|ra)\\s+{destination}")
        ]
        
        # Kiểm tra pattern rõ ràng cho tuyến ngược
        reverse_indicators = [
            re.compile(f"{destination}\\s*[-–—]\\s*{departure}"),
            re.compile(f"từ\\s+{destination}\\s+(?:đi|đến|tới|ra)\\s+{departure}"),
            re.compile(f"{destination}\\s+(?:đi|đến|tới|ra)\\s+{departure}")
        ]
        
        # Kiểm tra từ ngữ cảnh theo hướng đi
        forward_context = [
            (f"từ {departure}", f"đến {destination}"),
            (f"từ {departure}", f"tới {destination}"),
            (f"từ {departure}", f"ra {destination}"),
            (f"{departure}", f"đi {destination}"),
            (f"tour {departure}", f"{destination}")
        ]
        
        reverse_context = [
            (f"từ {destination}", f"đến {departure}"),
            (f"từ {destination}", f"tới {departure}"),
            (f"từ {destination}", f"ra {departure}"),
            (f"{destination}", f"đi {departure}"),
            (f"tour {destination}", f"{departure}")
        ]
        
        # Kiểm tra tuyến gốc
        for pattern in forward_indicators:
            if pattern.search(query_lower):
                found_routes.append((route, 0.9))  # Độ tin cậy cao
                break
                
        # Kiểm tra tuyến ngược
        for pattern in reverse_indicators:
            if pattern.search(query_lower):
                # Tìm tuyến ngược trong danh sách hỗ trợ
                reverse_in_supported = False
                for supported_route in SUPPORTED_DESTINATIONS:
                    if supported_route.lower() == reverse_route:
                        found_routes.append((supported_route, 0.9))
                        reverse_in_supported = True
                        break
                
                # Nếu không có, thử tạo tuyến ngược mới
                if not reverse_in_supported:
                    found_routes.append((reverse_route, 0.85))
                break
        
        # Kiểm tra ngữ cảnh cho tuyến gốc
        for start, end in forward_context:
            if start in query_lower and end in query_lower and query_lower.find(start) < query_lower.find(end):
                found_routes.append((route, 0.8))
                break
        
        # Kiểm tra ngữ cảnh cho tuyến ngược
        for start, end in reverse_context:
            if start in query_lower and end in query_lower and query_lower.find(start) < query_lower.find(end):
                # Tìm tuyến ngược trong danh sách hỗ trợ
                reverse_in_supported = False
                for supported_route in SUPPORTED_DESTINATIONS:
                    if supported_route.lower() == reverse_route:
                        found_routes.append((supported_route, 0.8))
                        reverse_in_supported = True
                        break
                
                # Nếu không có, thử tạo tuyến ngược mới
                if not reverse_in_supported:
                    found_routes.append((reverse_route, 0.75))
                break
        
        # Kiểm tra đơn giản các từ khóa
        if f"tour {departure} {destination}" in query_lower:
            found_routes.append((route, 0.7))
        elif f"tour {destination} {departure}" in query_lower:
            # Tìm tuyến ngược trong danh sách hỗ trợ
            reverse_in_supported = False
            for supported_route in SUPPORTED_DESTINATIONS:
                if supported_route.lower() == reverse_route:
                    found_routes.append((supported_route, 0.7))
                    reverse_in_supported = True
                    break
            
            # Nếu không có, thử tạo tuyến ngược mới
            if not reverse_in_supported:
                found_routes.append((reverse_route, 0.65))
    
    # Sắp xếp kết quả theo độ tin cậy và trả về tuyến đáng tin cậy nhất
    if found_routes:
        found_routes.sort(key=lambda x: x[1], reverse=True)
        print(f"Found routes: {found_routes}")  # Debug log
        return found_routes[0][0]
    
    return None
def is_tour_related(query):
    query_lower = query.lower().strip()
    
    # Kiểm tra đặc biệt cho các câu ngắn về cảm xúc
    emotion_words = ["buồn", "chán", "vui", "hạnh phúc", "đau", "mệt", "khỏe", "ốm", "bệnh", 
                     "nhớ", "ghét", "yêu", "thương", "thích", "lo", "sợ"]
    
    # Nhận diện câu ngắn có từ ngữ cảm xúc
    if len(query_lower.split()) <= 4:  # Câu ngắn <= 4 từ
        # Nếu câu đề cập đến cảm xúc mà không có từ khóa tour
        if any(word in query_lower for word in emotion_words) and not any(word in query_lower for word in ["tour", "du lịch", "đi", "chuyến"]):
            return False
            
    # Nhận diện các đại từ nhân xưng + cảm xúc
    pronouns = ["tôi", "mình", "tớ", "t", "ta", "tao", "mik", "mk", "bạn", "cậu", "mày"]
    
    # Nếu câu có cấu trúc "đại từ + cảm xúc"
    for pronoun in pronouns:
        for emotion in emotion_words:
            if f"{pronoun} {emotion}" in query_lower:
                return False
    
    # Danh sách từ khóa liên quan tour (giữ nguyên như cũ)
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
    
    # Những câu cực kỳ ngắn và không rõ nghĩa thì không thể xác định
    if len(query_lower.split()) <= 3:
        basic_words = query_lower.split()
        if any(word in ["tour", "du lịch", "đi", "chuyến"] for word in basic_words):
            return True
        return False
    
    # Danh sách các pattern rõ ràng về cảm xúc cá nhân không liên quan tour
    non_tour_patterns = [
        r"\b(tôi|mình|tớ|t|ta|tao|mik|mk)\s+(buồn|chán|vui|hạnh phúc|đau|mệt|khỏe|ốm|bệnh)(\s+|$|\.|\?)",
        r"\b(cảm thấy|cảm giác|thấy)\s+(buồn|chán|vui|hạnh phúc|đau|mệt|khỏe|ốm|bệnh)(\s+|$|\.|\?)",
        r"\b(bạn|cậu|mày|bồ)\s+(là ai|tên gì|có khỏe|thế nào|ra sao|làm gì)(\s+|$|\.|\?)",
        r"^(chào|hello|hi|hey|xin chào)(\s+|$|\.|\?)",
        r"(thời tiết|tin tức|bóng đá|covid|dịch bệnh)",
        r"(làm thế nào để|cách để|hướng dẫn)\s+(nấu ăn|học|kiếm tiền|giảm cân)",
        r"(yêu|thương|ghét|nhớ|thích)",
        r"(gia đình|công việc|trường học|bạn bè)"
    ]
    
    # Kiểm tra nếu câu hỏi khớp với mẫu không liên quan
    for pattern in non_tour_patterns:
        if re.search(pattern, query_lower):
            return False
        
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

def is_price_related_query(query):
    query_lower = query.lower()
    
    # Từ khóa liên quan đến giá
    price_keywords = [
        'giá', 'chi phí', 'phí', 'tiền', 'đắt', 'rẻ', 'giá cả',
        'giá thành', 'giá tiền', 'chi phí', 'tốn', 'kinh phí'
    ]
    
    # Từ khóa liên quan đến so sánh giá
    min_price_indicators = [
        'rẻ nhất', 'thấp nhất', 'ít nhất', 'ít tiền nhất', 'tiết kiệm nhất', 
        'giá thấp', 'giá rẻ', 'giảm giá', 'phải chăng', 'hợp lý', 'kinh tế nhất'
    ]
    
    max_price_indicators = [
        'đắt nhất', 'cao nhất', 'nhiều nhất', 'tốn nhất', 'đắt đỏ nhất',
        'giá cao', 'cao cấp', 'vip', 'sang trọng', 'đắt tiền'
    ]
    
    has_price_keyword = any(keyword in query_lower for keyword in price_keywords)
    
    if not has_price_keyword:
        return None, None
    
    price_type = None
    
    # Xác định loại so sánh giá
    if any(indicator in query_lower for indicator in min_price_indicators):
        price_type = "min"
    elif any(indicator in query_lower for indicator in max_price_indicators):
        price_type = "max"
    
    # Kiểm tra xem có tuyến đường nào được đề cập không
    destination = is_destination_related(query)
    
    return price_type, destination

def _determine_query_type(query_lower, conversation_state):
    """Xác định loại câu hỏi."""
    if not query_lower.strip() or query_lower.strip() in ["....", ".", "..", "...", "?", "???"]:
        return "empty"
    
    if not any(c.isalnum() for c in query_lower):
        return "empty"  
    
    specific_tour_patterns = [
        r"(cho\s+\w+\s+biết|thông tin)\s+về\s+tour\s+[\w\s]+",  # "cho tôi biết về tour..."
        r"(thông tin|chi tiết|mô tả|lịch trình|giá|chi phí|thời gian của|số người tham gia)\s+tour\s+[\w\s]+",  
        r"(giới thiệu|nói|kể)\s+về\s+tour\s+[\w\s]+",  # "giới thiệu về tour..."
        r"tour\s+[\w\s]+(\d+\s+ngày|\d+\s+đêm)",  # Tour + số ngày/đêm
        r"tour\s+[\w\s]+(có gì|như thế nào|ra sao|thế nào|đặc biệt|hay ho|đáng chú ý)",  # Tour + có gì/như thế nào/...
        r"tour\s+[\w\s]+(phun lửa|ẩm thực|khám phá|trải nghiệm|tham quan)",  # Tour + hoạt động đặc biệt
        r"tour\s+[^?]+\?$"  # Bất kỳ câu hỏi nào bắt đầu bằng "Tour [tên tour]" và kết thúc bằng dấu ?
    ]
    
    for pattern in specific_tour_patterns:
        if re.search(pattern, query_lower):
            return "specific_tour"
    
    # Kiểm tra nếu là câu hỏi về tuyến du lịch
    for route in SUPPORTED_DESTINATIONS:
        if re.search(r"" + re.escape(route.lower()) + r"\s+(có|những|các|có những|có các)\s+.*(tour|chuyến đi|du lịch)", query_lower):
            return "new_tour"
    
    # Pattern cho "Từ [departure] đi [destination] có những tour nào?"
    for route in SUPPORTED_DESTINATIONS:
        departure, destination = route.split(" - ")
        if re.search(r"từ\s+" + re.escape(departure.lower()) + r"\s+(đi|đến)\s+" + re.escape(destination.lower()), query_lower):
            return "new_tour"

    # Ưu tiên cao nhất: Kiểm tra câu hỏi về tour ở một điểm đến cụ thể
    for dest in SUPPORTED_DESTINATIONS:
        # Loại bỏ dấu ^ để không bắt buộc đầu câu, cho phép linh hoạt hơn
        if re.search(r"" + re.escape(dest.lower()) + r"\s+(có|những|các|có những|có các)\s+.*(tour|chuyến đi|du lịch)", query_lower):
            return "new_tour"
    
    # Pattern cụ thể cho "Điểm đến có những tour nào?"
    for dest in SUPPORTED_DESTINATIONS:
        if re.search(r"" + re.escape(dest.lower()) + r".*có.*những.*tour", query_lower):
            return "new_tour"
    
    # Nếu câu hỏi đề cập đến điểm đến cụ thể và có từ khóa liên quan đến tour
    tour_keywords = ["tour", "du lịch", "chuyến đi", "tham quan", "khám phá", "đi", "gợi ý"]
    if any(dest.lower() in query_lower for dest in SUPPORTED_DESTINATIONS) and any(kw in query_lower for kw in tour_keywords):
        return "new_tour"
    
    # Kiểm tra điểm đến mới (đặt lên trước để ưu tiên hơn general_tour_patterns)
    if any(dest.lower() in query_lower for dest in SUPPORTED_DESTINATIONS):
        if 'current_tour' in locals() and current_tour:
            current_dest = current_tour.get('destination', '').lower() 
            for dest in SUPPORTED_DESTINATIONS:
                if dest.lower() in query_lower and dest.lower() != current_dest:
                    return "new_tour"
        return "new_tour"  # Nếu có điểm đến, mặc định là new_tour
    
    # Kiểm tra câu hỏi về điểm đến đơn trước các loại khác
    if find_single_destination(query_lower):
        # Kiểm tra nếu là câu hỏi về điểm khởi hành
        departure_indicators = [
            r"(?:đi|khởi hành|xuất phát)\s+từ",
            r"từ\s+\w+\s+(?:đi|khởi hành|tới|đến)",
            r"tour\s+(?:đi|khởi hành)\s+từ",
            r"bắt đầu\s+từ",
            r"khởi\s+hành\s+ở",
            r"tour\s+(?:nào|gì)?\s+khởi\s+hành\s+ở",
            r"có\s+tour\s+(?:nào|gì)?\s+ở"
        ]
        
        for indicator in departure_indicators:
            if re.search(indicator, query_lower):
                return "single_departure"
        
        return "single_destination"
    
    personal_patterns = [
        r"\b(tôi|mình|t|tao|ta|mik|mk)\s+(buồn|chán|vui|khỏe|mệt|ốm|đau)",  
        r"\b(cảm thấy|cảm giác|thấy)\s+(buồn|chán|vui|khỏe|mệt|ốm|đau)",
        r"\b(bạn|cậu|mày)\s+(là ai|tên gì|có khỏe|tuổi|làm gì)",
        r"^\s*(chào|hello|hi|hey|hola)\s*$",
        r"\b(thời tiết|tin tức|bóng đá|covid)\b",
        r"\b(làm thế nào để|cách để)\s+(nấu ăn|học|kiếm tiền)"
    ]
    
    # Kiểm tra nếu câu hỏi là cá nhân không liên quan tour
    for pattern in personal_patterns:
        if re.search(pattern, query_lower):
            tour_terms = ["tour", "du lịch", "chuyến đi", "đi đâu", "điểm đến"]
            if not any(term in query_lower for term in tour_terms):
                return "non_tour"
    
    # Ưu tiên 1: Kiểm tra nếu là câu hỏi về vùng miền
    if any(region in query_lower for region in ["miền bắc", "miền trung", "miền nam"]):
        return "region"
    
    # Ưu tiên 2: Nhận diện câu hỏi về HOẠT ĐỘNG (cần xử lý trước để không bị nhầm)
    activity_patterns = [
        r"(tour|chuyến đi).*(nào).*(có).*(hoạt động|lặn|bơi|ăn uống|ẩm thực)",  # Tour nào có hoạt động gì
        r"(có).*(tour|chuyến đi).*(nào).*(về|có).*(hoạt động|lặn|bơi|ăn uống|ẩm thực)",  # Có tour nào về hoạt động
        r"(tìm|kiếm).*(tour).*(lặn|bơi|ăn uống|ẩm thực)",  # Tìm tour có hoạt động
        r"(tour|chuyến đi).*(để).*(lặn|bơi|ăn uống)",  # Tour để làm gì
        r"(tour|chuyến đi).*(phù hợp).*(lặn|bơi|ăn uống)"  # Tour phù hợp với hoạt động gì
    ]
    
    for pattern in activity_patterns:
        if re.search(pattern, query_lower):
            return "activity"
    
    # Ưu tiên 3: Kiểm tra nếu là câu hỏi về tour mới
    new_tour_indicators = [
        "tour khác", "còn tour nào", "tour mới", "tìm tour", "giới thiệu tour", 
        "có tour nào", "tour du lịch", "thông tin tour", "giá của tour", "thời gian tour",
        "mô tả tour", "danh sách tour", "tour ở", "tour tại", "tour đi", "tour đến"
    ]
    if any(indicator in query_lower for indicator in new_tour_indicators):
        return "new_tour"
    
    # Ưu tiên 4: Kiểm tra nếu là câu hỏi follow-up cho tour hiện tại
    if current_tour and is_follow_up_question(query_lower, conversation_state):
        return "follow_up"
    
    # Ưu tiên 5: Kiểm tra từ khóa hoạt động riêng lẻ (sau khi đã loại trừ các trường hợp trên)
    activity_keywords = [
        "lặn", "biển", "bơi",
        "ăn uống", "đồ ăn", "món ăn", "ẩm thực", "ăn", "uống", "đặc sản", "hải sản",
        "bbq", "nướng", "tiệc nướng",
        "tham quan", "khám phá", "check-in",
        "cầu rồng", "phun lửa", "cầu",
        "biển", "bãi biển", "bờ biển", "đại dương",
        "văn hóa", "lịch sử", "di sản", "truyền thống",
        "phố cổ", "làng chài", "nhà cổ"
    ]
    
    for activity in activity_keywords:
        if activity in query_lower:
            # Nếu câu hỏi chỉ chứa từ "tour" và từ khóa hoạt động, không có tên cụ thể thì xác định là activity
            if "tour" in query_lower and len(query_lower.split()) <= 5:
                return "activity"
                
            # Nếu câu có dạng "tour có [hoạt động]" mà không có tên tour cụ thể
            if re.search(r"tour\s+(có|với)\s+" + activity, query_lower):
                return "activity"
            
            # Kiểm tra xem nếu câu hỏi có đề cập đến địa điểm thì ưu tiên new_tour
            if any(dest in query_lower for dest in SUPPORTED_DESTINATIONS):
                return "new_tour"
                
            return "activity"
    
    # Ưu tiên 6: Nhận diện câu hỏi chung về tour (không liên quan đến điểm đến cụ thể)
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
            return "general_tour"  
    
    # Kiểm tra nếu câu hỏi không liên quan đến tour
    if 'is_tour_related' in globals() and not is_tour_related(query_lower):
        return "non_tour"
    
    # Kiểm tra câu hỏi về giá
    price_type, _ = is_price_related_query(query_lower)
    if price_type:
        return "price_query"
    
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

def _find_tours_by_destination(route):
    """Lấy danh sách tour theo tuyến đường (departure - destination).""" 
    route_lower = route.lower()
    
    # Tìm route phù hợp nhất
    matched_route = None
    for supported_route in SUPPORTED_DESTINATIONS:
        if supported_route.lower() == route_lower:
            matched_route = supported_route
            break
    
    if not matched_route:
        # Thử tìm ngược lại nếu không tìm thấy
        # (Tạm bỏ qua vì bạn muốn tránh hiển thị tour ngược chiều)
        return []
    
    return ALL_TOURS.get(matched_route, [])

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

def find_single_destination(query):
    """Xác định khi người dùng hỏi về một điểm đến hoặc điểm khởi hành"""
    query_lower = query.lower()
    
    # Tạo danh sách các điểm đến từ SUPPORTED_DESTINATIONS
    all_destinations = set()
    for route in SUPPORTED_DESTINATIONS:
        departure, destination = route.split(" - ")
        all_destinations.add(departure.lower())
        all_destinations.add(destination.lower())
    
    # Các mẫu câu hỏi về điểm đến
    destination_patterns = [
        r"có\s+tour\s+(?:nào|gì|gi|j)\s+(?:đi|tới|ra|đến)\s+([^?]+?)(?:\s+không|\?|$)",
        r"tour\s+(?:đi|tới|ra|đến)\s+([^?]+?)(?:\s+thì\s+sao|\s+không|\?|$)",
        r"(?:đi|tới|ra|đến)\s+([^?]+?)(?:\s+có\s+tour\s+nào|\s+không|\?|$)",
        r"có\s+đi\s+([^?]+?)(?:\s+không|\?|$)",
        r"muốn\s+đi\s+([^?]+?)(?:\s+thì\s+sao|\s+có\s+không|\?|$)",
        r"tour\s+([^?]+?)(?:\s+giá|\s+bao\s+nhiêu|\s+thế\s+nào|\s+có\s+không|\?|$)"
    ]
    
    # Các mẫu câu hỏi về điểm khởi hành
    departure_patterns = [
        r"(?:đi|khởi hành|xuất phát)\s+từ\s+([^?]+?)(?:\s+không|\?|$)",
        r"từ\s+([^?]+?)\s+(?:đi|khởi hành|tới|đến)(?:\s+không|\?|$)",
        r"tour\s+(?:đi|khởi hành)\s+từ\s+([^?]+?)(?:\s+không|\?|$)",
        r"(?:có|được)\s+tour\s+(?:nào|gì)\s+(?:đi|khởi hành|xuất phát)\s+từ\s+([^?]+?)(?:\s+không|\?|$)",
        r"(?:có|được)\s+(?:đi|khởi hành|xuất phát)\s+từ\s+([^?]+?)(?:\s+không|\?|$)",
        r"(?:bắt đầu|start)\s+từ\s+([^?]+?)(?:\s+không|\?|$)",
        r"tour\s+từ\s+([^?]+?)(?:\s+không|\?|$)",
        r"(?:có|được)\s+tour\s+(?:nào|gì)\s+(?:đi|khởi hành|xuất phát)\s+ở\s+([^?]+?)(?:\s+không|\?|$)",
        r"(?:có|được)\s+tour\s+(?:nào|gì)\s+khởi\s+hành\s+ở\s+([^?]+?)(?:\s+không|\?|$)",
        r"tour\s+(?:nào|gì)\s+khởi\s+hành\s+ở\s+([^?]+?)(?:\s+không|\?|$)",
        r"có\s+tour\s+(?:nào|gì)\s+ở\s+([^?]+?)(?:\s+không|\?|$)"
    ]
    
    # Thêm kiểm tra trực tiếp nếu một địa điểm có trong câu hỏi
    for dest in all_destinations:
        if dest in query_lower:
            # Kiểm tra cụm "tour ... [địa điểm]" hoặc "đi ... [địa điểm]"
            if f"tour {dest}" in query_lower or f"đi {dest}" in query_lower:
                return dest
            
            # Kiểm tra cụm "từ [địa điểm]" hoặc "ở [địa điểm]"
            if f"từ {dest}" in query_lower or f"ở {dest}" in query_lower:
                return dest
            
            # Kiểm tra cụm "từ [địa điểm]"
            if f"từ {dest}" in query_lower:
                return dest
    
    # Tiếp tục với phần tìm kiếm theo pattern điểm đến
    for pattern in destination_patterns:
        matches = re.search(pattern, query_lower)
        if matches:
            potential_dest = matches.group(1).strip()
            best_match = find_best_match(potential_dest, all_destinations)
            if best_match:
                return best_match
    
    # Tiếp tục với phần tìm kiếm theo pattern điểm khởi hành
    for pattern in departure_patterns:
        matches = re.search(pattern, query_lower)
        if matches:
            potential_dest = matches.group(1).strip()
            best_match = find_best_match(potential_dest, all_destinations)
            if best_match:
                return best_match
                
    return None

def find_best_match(potential_dest, all_destinations):
    """Tìm điểm đến phù hợp nhất dựa trên text nhập vào"""
    best_match = None
    best_score = 0
    
    for dest in all_destinations:
        # Kiểm tra chính xác trước
        if potential_dest == dest:
            return dest
        
        # Kiểm tra nếu chuỗi tìm thấy nằm trong điểm đến
        if potential_dest in dest:
            score = len(potential_dest) / len(dest)
            if score > best_score:
                best_score = score
                best_match = dest
        
        # Kiểm tra nếu điểm đến nằm trong chuỗi tìm thấy
        if dest in potential_dest:
            score = len(dest) / len(potential_dest)
            if score > best_score:
                best_score = score
                best_match = dest
    
    # Nếu có kết quả khớp với độ tin cậy cao
    if best_score > 0.7:
        return best_match
    
    return None

def _find_tours_by_price(price_type, destination=None):
    """
    Tìm tour theo giá (rẻ nhất/đắt nhất) và tùy chọn theo điểm đến
    
    Args:
        price_type: "min" cho rẻ nhất, "max" cho đắt nhất
        destination: Tùy chọn tuyến đường cụ thể
    
    Returns:
        Danh sách tour được sắp xếp theo giá
    """
    # Lấy danh sách tour để lọc
    if destination and destination in ALL_TOURS:
        tours_to_filter = ALL_TOURS[destination]
    else:
        tours_to_filter = ALL_TOURS["all"]
    
    # Chuyển đổi giá thành số
    def extract_price(tour):
        price_str = tour.get('price', '0 Đồng')
        # Loại bỏ đơn vị tiền tệ và chuyển về số
        numeric_str = re.sub(r'[^\d]', '', price_str)
        if numeric_str:
            return int(numeric_str)
        return 0
    
    # Sắp xếp tour theo giá
    if price_type == "min":
        sorted_tours = sorted(tours_to_filter, key=extract_price)
    else:  # price_type == "max"
        sorted_tours = sorted(tours_to_filter, key=extract_price, reverse=True)
    
    # Giới hạn số lượng kết quả
    return sorted_tours[:1]  
    
# 4. Các hàm hỗ trợ và tiện ích
def format_tour_for_response(tour):
    return {
        "title": tour.get('title', ''),
        "description": tour.get('description', ''),
        "price": tour.get('price', '0'),
        "duration": tour.get('duration', '0'),
        "destination": tour.get('destination', ''),
        "departure": tour.get('departure', ''),
        "maxParticipants": tour.get('maxParticipants', 0),
        "code": tour.get('code', '')
    }

def _get_ai_response(prompt: str) -> str:
    completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "Bạn là một hướng dẫn viên du lịch chuyên nghiệp, luôn trả lời chi tiết và thân thiện."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="gpt-3.5-turbo",
        temperature=0.7,
        max_tokens=500
    )
    ai_response = completion.choices[0].message.content
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
                 f"Điểm khởi hành: {tour.get('departure', '')}, "
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
    
def _handle_destination_question(query, route, conversation_state):
    global current_tour

    # Kiểm tra xem tuyến đường có được hỗ trợ không
    if route not in SUPPORTED_DESTINATIONS:
        return {
            "status": "warning",
            "message": f"Xin lỗi, hiện tại không có thông tin về tour tuyến {route}.",
            "data": None,
            "error": None
        }
    
    # Lấy danh sách tour theo tuyến đường
    route_tours = _find_tours_by_destination(route)
    
    if not route_tours:
        current_tour = None
        conversation_state["last_tour_id"] = None
        conversation_state["current_topic"] = None
        return {
            "status": "warning",
            "message": f"Không tìm thấy tour nào đi tuyến {route}.",
            "data": None,
            "error": None
        }
    
    # Phân tách điểm khởi hành và điểm đến từ route để kiểm tra khớp chính xác
    route_departure, route_destination = route.split(" - ")
    
    # Lọc chỉ lấy tour khớp chính xác tuyến đường
    exact_route_tours = []
    for tour in route_tours:
        if (tour.get('departure', '').lower() == route_departure.lower() and 
            tour.get('destination', '').lower() == route_destination.lower()):
            exact_route_tours.append(tour)
    
    # Nếu không có tour khớp chính xác, trả về thông báo không tìm thấy
    if not exact_route_tours:
        return {
            "status": "warning",
            "message": f"Không tìm thấy tour nào đi tuyến {route}.",
            "data": None,
            "error": None
        }
    
    # Tiếp tục với tour khớp chính xác
    tours_to_return = exact_route_tours
    
    # Giới hạn số lượng tour trả về
    max_tours = min(TOUR_CONFIG["max_tours_per_destination"], len(tours_to_return))
    min_tours = min(TOUR_CONFIG["min_tours_per_destination"], len(tours_to_return))
    num_tours = max(min_tours, min(max_tours, len(tours_to_return)))
    tours_to_return = tours_to_return[:num_tours]
    
    # Phân tách điểm khởi hành và điểm đến từ route
    departure, destination = route.split(" - ")
    
    # Tạo context cho AI
    context = "\n".join([
        f"Tiêu đề: {tour.get('title', '')}, "
        f"Mô tả: {tour.get('description', '')}, "
        f"Giá: {tour.get('price', '0')}, "
        f"Thời gian: {tour.get('duration', '0')}, "
        f"Điểm khởi hành: {tour.get('departure', '')}, "
        f"Điểm đến: {tour.get('destination', '')}, "
        f"Số người tối đa: {tour.get('maxParticipants', '0')}"
        for tour in tours_to_return
    ])

    prompt = f"""Dựa trên thông tin tour sau: \n\n{context}\n\n
    Trả lời câu hỏi sau của người dùng: '{query}'.
    Người dùng đang tìm tour đi từ {departure} đến {destination}.
    Hãy trình bày tất cả {len(tours_to_return)} tour theo định dạng sau cho mỗi tour: \n\n
    1. [Tên Tour]\n   - Tuyến đường: {departure} - {destination}\n   - Điểm đến/Hoạt động: [Mô tả ngắn gọn]\n   - Giá: [Giá] | Thời gian: [Thời gian]\n\n
    Bắt đầu bằng một câu giới thiệu ngắn gọn về số lượng tour tìm thấy đi từ {departure} đến {destination}."""
    
    try:
        ai_response = _get_ai_response(prompt)
        
        # Nếu chỉ có một tour, đặt làm tour hiện tại
        if len(tours_to_return) == 1:
            current_tour = tours_to_return[0]
            conversation_state["last_tour_id"] = current_tour.get('code', '')
            conversation_state["current_topic"] = "route" 
        
        conversation_state["query_counter"] += 1
        
        return {
            "status": "success",
            "message": ai_response,
            "data": {
                "route": route,
                "departure": departure,
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
    """Xử lý câu hỏi chung về tour bằng cách giới thiệu nhiều tour từ nhiều tuyến đường."""

    num_routes_to_show = TOUR_CONFIG["max_destinations_to_show"]
    routes_to_show = []
    all_recommended_tours = []
    
    # Chọn một số tuyến đường ngẫu nhiên từ danh sách hỗ trợ
    random_routes = random.sample(SUPPORTED_DESTINATIONS, min(num_routes_to_show, len(SUPPORTED_DESTINATIONS)))
    
    # Với mỗi tuyến đường, tìm tour phù hợp
    for route in random_routes:
        # Lấy danh sách tour theo tuyến đường
        route_tours = _find_tours_by_destination(route)
        
        if route_tours:
            # Phân tách điểm khởi hành và điểm đến từ route
            route_departure, route_destination = route.split(" - ")
            
            # Lọc chỉ lấy tour khớp chính xác tuyến đường
            exact_route_tours = []
            for tour in route_tours:
                if (tour.get('departure', '').lower() == route_departure.lower() and 
                    tour.get('destination', '').lower() == route_destination.lower()):
                    exact_route_tours.append(tour)
            
            # Nếu có tour khớp chính xác
            if exact_route_tours:
                # Lấy tối thiểu 1, tối đa 2 tour từ mỗi tuyến đường
                max_tours = min(TOUR_CONFIG["max_tours_per_destination"], len(exact_route_tours))
                min_tours = min(TOUR_CONFIG["min_tours_per_destination"], len(exact_route_tours))
                num_tours = max(min_tours, min(max_tours, len(exact_route_tours)))
                
                selected_tours = exact_route_tours[:num_tours]
                all_recommended_tours.extend(selected_tours)
                routes_to_show.append(route)
    
    if not all_recommended_tours:
        return {
            "status": "warning",
            "message": "Hiện tại không có tour nào để giới thiệu.",
            "data": None,
            "error": None
        }
    
    # Tạo context cho AI
    context = "\n".join([
        f"Tuyến đường: {tour.get('departure', '')} - {tour.get('destination', '')}, "
        f"Tiêu đề: {tour.get('title', '')}, "
        f"Mô tả: {tour.get('description', '')}, "
        f"Giá: {tour.get('price', '0')}, "
        f"Thời gian: {tour.get('duration', '0')}, "
        f"Số người tối đa: {tour.get('maxParticipants', '0')}"
        for tour in all_recommended_tours
    ])

    # Tạo chuỗi các tuyến đường để hiển thị trong prompt
    routes_text = ", ".join([f"{route.split(' - ')[0]} đến {route.split(' - ')[1]}" for route in routes_to_show])

    prompt = f"""Dựa trên thông tin tour sau: \n\n{context}\n\n
    Trả lời câu hỏi chung về tour của người dùng: '{query}'.
    Người dùng đang tìm hiểu về các tour du lịch nói chung.
    Hãy trình bày tổng cộng {len(all_recommended_tours)} tour từ {len(routes_to_show)} tuyến đường khác nhau.
    Nhóm các tour theo tuyến đường và hiển thị theo định dạng sau:
    
    🌟 Tour từ [Điểm khởi hành] đến [Điểm đến]:
    1. [Tên Tour]
       - Chi tiết: [Mô tả ngắn gọn]
       - Giá: [Giá] | Thời gian: [Thời gian]
       - Số người tối đa: [Số người tối đa]
    
    Bắt đầu bằng một câu giới thiệu ngắn gọn về số lượng tour tìm thấy từ {len(routes_to_show)} tuyến đường khác nhau: {routes_text}."""
    
    try:
        ai_response = _get_ai_response(prompt)
        
        conversation_state["query_counter"] += 1
        
        return {
            "status": "success",
            "message": ai_response,
            "data": {
                "tours": [format_tour_for_response(tour) for tour in all_recommended_tours]
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
        
        context =  (f"Tiêu đề: {most_relevant.get('title', '')}, "
                    f"Mô tả: {most_relevant.get('description', '')}, "
                    f"Giá: {most_relevant.get('price', '0')}, "
                    f"Thời gian: {most_relevant.get('duration', '0')}, "
                    f"Điểm khởi hành: {most_relevant.get('departure', '')}, "
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
            f"Điểm khởi hành: {tour.get('departure', '')}, "
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
    
    tour_info =(f"Tiêu đề: {tour.get('title', '')}, "
                f"Mô tả: {tour.get('description', '')}, "
                f"Giá: {tour.get('price', '0')}, "
                f"Thời gian: {tour.get('duration', '0')}, "
                f"Điểm khởi hành: {tour.get('departure', '')}, "
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
        tour_info =(f"Tiêu đề: {tour.get('title', '')}, "
                    f"Mô tả: {tour.get('description', '')}, "
                    f"Giá: {tour.get('price', '0')}, "
                    f"Thời gian: {tour.get('duration', '0')}, "
                    f"Điểm khởi hành: {tour.get('departure', '')}, "
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
                 f"Điểm khởi hành: {tour.get('departure', '')}, "
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
    
def _handle_single_destination_question(query, destination, conversation_state, is_departure=False):
    global current_tour

    # Phân tích ngữ cảnh câu hỏi để xác định xem người dùng muốn "đi đến" hay "đi từ" điểm đó
    query_lower = query.lower()
    is_departure = False
    
    # Kiểm tra nếu người dùng muốn đi "từ" địa điểm này
    departure_patterns = [
        r"(?:đi|khởi hành|xuất phát)\s+từ\s+" + re.escape(destination.lower()),
        r"từ\s+" + re.escape(destination.lower()) + r"\s+(?:đi|tới|đến)",
        r"tour\s+(?:đi|khởi hành)\s+từ\s+" + re.escape(destination.lower())
    ]
    
    for pattern in departure_patterns:
        if re.search(pattern, query_lower):
            is_departure = True
            break
    
    # Tìm tour phù hợp dựa trên điểm đến hoặc điểm đi
    relevant_tours = []
    
    for route in SUPPORTED_DESTINATIONS:
        departure, dest = route.split(" - ")
        
        # Nếu người dùng muốn tìm tour "từ" địa điểm này đi
        if is_departure and destination.lower() == departure.lower():
            route_tours = _find_tours_by_destination(route)
            for tour in route_tours:
                tour['route'] = route
                relevant_tours.append(tour)
        
        # Nếu người dùng muốn tìm tour "đến" địa điểm này (mặc định)
        elif not is_departure and destination.lower() == dest.lower():
            route_tours = _find_tours_by_destination(route)
            for tour in route_tours:
                tour['route'] = route
                relevant_tours.append(tour)
    
    if not relevant_tours:
        # Nếu không tìm thấy tour theo điều kiện ban đầu, thử tìm tất cả tour liên quan
        # Đây là phương án dự phòng khi không phân tích được ý định chính xác
        if not is_departure:  # Chỉ thực hiện khi ưu tiên tìm điểm đến không thành công
            for route in SUPPORTED_DESTINATIONS:
                departure, dest = route.split(" - ")
                if destination.lower() == departure.lower() or destination.lower() == dest.lower():
                    route_tours = _find_tours_by_destination(route)
                    for tour in route_tours:
                        tour['route'] = route
                        tour['is_destination'] = destination.lower() == dest.lower()  # Đánh dấu nếu là điểm đến
                        relevant_tours.append(tour)
            
            # Ưu tiên sắp xếp các tour có điểm đến trước
            relevant_tours.sort(key=lambda x: x.get('is_destination', False), reverse=True)
    
    if not relevant_tours:
        return {
            "status": "warning",
            "message": f"Không tìm thấy tour nào liên quan đến {destination}.",
            "data": None,
            "error": None
        }
    
    # Giới hạn số lượng tour trả về
    max_tours = min(TOUR_CONFIG["max_tours_per_destination"], len(relevant_tours))
    min_tours = min(TOUR_CONFIG["min_tours_per_destination"], len(relevant_tours))
    num_tours = max(min_tours, min(max_tours, len(relevant_tours)))
    tours_to_return = relevant_tours[:num_tours]
    
    # Tạo context cho AI với thông tin về ý định người dùng
    context = "\n".join([
        f"Tiêu đề: {tour.get('title', '')}, "
        f"Mô tả: {tour.get('description', '')}, "
        f"Giá: {tour.get('price', '0')}, "
        f"Thời gian: {tour.get('duration', '0')}, "
        f"Tuyến đường: {tour.get('route', '')}, "
        f"Điểm khởi hành: {tour.get('departure', '')}, "
        f"Điểm đến: {tour.get('destination', '')}, "
        f"Số người tối đa: {tour.get('maxParticipants', '0')}"
        for tour in tours_to_return
    ])

    # Điều chỉnh nội dung prompt dựa trên ý định của người dùng
    if is_departure:
        intent_text = f"Người dùng đang tìm tour khởi hành từ {destination}."
    else:
        intent_text = f"Người dùng đang tìm tour đi đến {destination}."

    prompt = f"""Dựa trên thông tin tour sau: \n\n{context}\n\n
    Trả lời câu hỏi sau của người dùng: '{query}'.
    {intent_text}
    Hãy trình bày tất cả {len(tours_to_return)} tour theo định dạng sau cho mỗi tour: \n\n
    1. [Tên Tour]\n   - Tuyến đường: [Điểm khởi hành] - [Điểm đến]\n   - Điểm đến/Hoạt động: [Mô tả ngắn gọn]\n   - Giá: [Giá] | Thời gian: [Thời gian]\n\n
    Bắt đầu bằng một câu giới thiệu ngắn gọn về số lượng tour tìm thấy liên quan đến {destination}."""
    
    try:
        ai_response = _get_ai_response(prompt)
        
        # Nếu chỉ có một tour, đặt làm tour hiện tại
        if len(tours_to_return) == 1:
            current_tour = tours_to_return[0]
            conversation_state["last_tour_id"] = current_tour.get('code', '')
            conversation_state["current_topic"] = "destination" 
        
        conversation_state["query_counter"] += 1
        
        return {
            "status": "success",
            "message": ai_response,
            "data": {
                "destination": destination,
                "is_departure": is_departure,
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
def _handle_price_question(query, price_type, destination, conversation_state):

    price_type_text = "rẻ nhất" if price_type == "min" else "đắt nhất"
    
    # Tìm tour theo giá
    filtered_tours = _find_tours_by_price(price_type, destination)
    
    if not filtered_tours:
        return {
            "status": "warning",
            "message": f"Không tìm thấy tour nào phù hợp với yêu cầu tìm tour {price_type_text}.",
            "data": None,
            "error": None
        }
    
    # Tạo context cho AI
    context = "\n".join([
        f"Tiêu đề: {tour.get('title', '')}, "
        f"Mô tả: {tour.get('description', '')}, "
        f"Giá: {tour.get('price', '0')}, "
        f"Thời gian: {tour.get('duration', '0')}, "
        f"Điểm khởi hành: {tour.get('departure', '')}, "
        f"Điểm đến: {tour.get('destination', '')}, "
        f"Số người tối đa: {tour.get('maxParticipants', '0')}"
        for tour in filtered_tours
    ])
    
    destination_text = f"đi từ {destination.split(' - ')[0]} đến {destination.split(' - ')[1]}" if destination else ""
    
    prompt = f"""Dựa trên thông tin tour sau: \n\n{context}\n\n
    Trả lời câu hỏi sau của người dùng: '{query}'.
    Người dùng đang tìm tour {price_type_text} {destination_text}.
    Hãy trình bày {len(filtered_tours)} tour theo giá {price_type_text} theo định dạng sau cho mỗi tour: \n\n
    1. [Tên Tour]\n   - Tuyến đường: [Điểm đi] - [Điểm đến]\n   - Điểm đến/Hoạt động: [Mô tả ngắn gọn]\n   - Giá: [Giá] | Thời gian: [Thời gian]\n\n
    Bắt đầu bằng một câu giới thiệu ngắn gọn về các tour {price_type_text} tìm thấy."""
    
    try:
        ai_response = _get_ai_response(prompt)
        
        # Nếu chỉ có một tour, đặt làm tour hiện tại
        if len(filtered_tours) == 1:
            current_tour = filtered_tours[0]
            conversation_state["last_tour_id"] = current_tour.get('code', '')
            conversation_state["current_topic"] = "price" 
        
        conversation_state["query_counter"] += 1
        
        return {
            "status": "success",
            "message": ai_response,
            "data": {
                "price_type": price_type,
                "destination": destination,
                "tours": [format_tour_for_response(tour) for tour in filtered_tours]
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
                f"Xin lỗi, không tìm thấy tour nào có hoạt động phù hợp với yêu cầu của bạn."
            )
    elif query_type == "single_destination" or query_type == "single_departure":
        destination = find_single_destination(query)
        is_departure = (query_type == "single_departure")
        return _handle_single_destination_question(query, destination, conversation_state, is_departure)
    elif query_type == "new_tour":
        current_tour = None
        conversation_state = _reset_conversation_state()

        # Kiểm tra nếu đang tìm tour theo tuyến đường
        destination = is_destination_related(query)
        if destination:
            return _handle_destination_question(query, destination, conversation_state)
        
        # single_dest = find_single_destination(query)
        # if single_dest:
        #     is_departure = any(re.search(pattern, query_lower) for pattern in [
        #         r"(?:đi|khởi hành|xuất phát)\s+từ",
        #         r"từ\s+\w+\s+(?:đi|khởi hành|tới|đến)",
        #         r"tour\s+(?:đi|khởi hành)\s+từ",
        #         r"bắt đầu\s+từ"
        #     ])
        #     return _handle_single_destination_question(query, single_dest, conversation_state, is_departure)
    
        return _create_warning_response(
            "Xin lỗi, không tìm thấy thông tin tour phù hợp với yêu cầu của bạn."
        )
    elif query_type == "general_tour":
        return _handle_general_tour_question(query, conversation_state)
    if query_type == "price_query":
        price_type, destination = is_price_related_query(query_lower)
        return _handle_price_question(query, price_type, destination, conversation_state)
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
    
    single_dest = find_single_destination(query)
    if single_dest:
        return _handle_single_destination_question(query, single_dest, conversation_state)
    
    # 4.2. Tìm theo điểm đến 
    destination = is_destination_related(query)
    if destination:
        # Kiểm tra xem điểm đến có nằm trong danh sách được hỗ trợ không
        if destination not in SUPPORTED_DESTINATIONS:
            return {
                "status": "warning",
                "message": f"Xin lỗi, hiện tại không có thông tin về tour tuyến {destination}.",
                "data": None,
                "error": None
            }
        
        # Lấy danh sách tour theo tuyến đường
        route_tours = _find_tours_by_destination(destination)
        
        if not route_tours:
            return {
                "status": "warning",
                "message": f"Không tìm thấy tour nào đi tuyến {destination}.",
                "data": None,
                "error": None
            }
        
        # Nếu tìm thấy tour, xử lý bình thường
        return _handle_destination_question(query, destination, conversation_state)
    
    # 4.3. Tìm theo từ khóa trong mô tả
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
        "Xin lỗi, không tìm thấy thông tin tour phù hợp với yêu cầu của bạn."
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