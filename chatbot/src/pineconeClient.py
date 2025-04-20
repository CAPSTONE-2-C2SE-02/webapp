from os import path
import sys
import time
sys.path.append(path.abspath(path.join(path.dirname(__file__), "..")))
from pinecone import Pinecone,ServerlessSpec
from config import PINECONE_API_KEY, PINECONE_INDEX_NAME
from src.embedder import get_embedding


pc = Pinecone(api_key=PINECONE_API_KEY)

DIMENSION = 1024  

if PINECONE_INDEX_NAME not in [idx["name"] for idx in pc.list_indexes()]:
    pc.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")  
    )
    while not pc.describe_index(PINECONE_INDEX_NAME).status["ready"]:
        print("⏳ Waiting for index to be ready...")
        time.sleep(3)


index = pc.Index(PINECONE_INDEX_NAME)
# print(index.describe_index_stats())



def upsert_to_pinecone(chunks, batch_size=10):
    vectors = []
    for i, chunk in enumerate(chunks):
        if not isinstance(chunk, dict):
            #print(f"⚠️ Chunk {i} not is dictionary:", chunk)
            continue  

        # Kiểm tra nếu thiếu khóa nào trong chunk
        missing_keys = [k for k in ("code", "title", "description", "destination", "departure" , "price",
                                    "maxParticipants", "duration") if k not in chunk]
        if missing_keys:
            #print(f"⚠️ Chunk {i} thiếu các khóa {missing_keys}: {chunk}")
            continue  # Bỏ qua chunk này nếu thiếu thông tin

        
        # Tạo text để đưa vào embedding từ thông tin của từng chunk
        text_to_embed = f"{chunk['code']} {chunk['title']} {chunk['description']} {chunk['destination']} {chunk['departure']} {chunk['price']} {chunk['maxParticipants']} {chunk['duration']}"


        vectors.append({
            "id": f"tour_{chunk['code']}",
            "metadata": {
                "code": chunk["code"],
                "title": chunk["title"],
                "description": chunk["description"],
                "destination": chunk["destination"],
                "departure": chunk["departure"],
                "maxParticipants": chunk["maxParticipants"],
                "duration": chunk["duration"],
                "price": chunk["price"]
            },
            "text": text_to_embed
        })

    # Lấy embedding cho văn bản
    texts = [v["text"] for v in vectors]
    embeddings = get_embedding(texts)  

    for i, emb in enumerate(embeddings):
        vectors[i]["values"] = emb

    # Upsert vào Pinecone
    for i in range(0, len(vectors), batch_size):
        index.upsert(vectors[i:i+batch_size])



def query_pinecone(query_text, top_k=3, score_threshold=0.5):
    """Truy vấn Pinecone với vector embedding và trả về các kết quả phù hợp."""
    if not query_text.strip():
        print("⚠️ Truy vấn không hợp lệ.")
        return []

    try:
        # Chuyển câu hỏi thành vector embedding
        query_vector = get_embedding(query_text)
        if query_vector is None:
            print("⚠️ Không thể tạo vector embedding cho truy vấn.")
            return []

        # Kiểm tra nếu index chưa được khởi tạo
        if "index" not in globals() or index is None:
            print("⚠️ Lỗi: Pinecone index chưa được khởi tạo.")
            return []

        # Truy vấn Pinecone
        response = index.query(vector=query_vector, top_k=top_k, include_metadata=True)

        if not response or "matches" not in response or not response["matches"]:
            print("⚠️ Không tìm thấy kết quả phù hợp.")
            return []

        results = []
        for match in response["matches"]:
            score = round(match["score"], 4)
            if score < score_threshold:
                continue  # Bỏ qua kết quả nếu độ tương đồng quá thấp

            results.append({
                "score": score,
                "code": match["metadata"].get("code", "N/A"),
                "title": match["metadata"].get("title", "N/A"),
                "description": match["metadata"].get("description", "N/A"),
                "destination": match["metadata"].get("destination", "N/A"),
                "departure": match["metadata"].get("departure", "N/A"),
                "maxParticipants": match["metadata"].get("maxParticipants", "N/A"),
                "duration": match["metadata"].get("duration", "N/A"),
                "price": match["metadata"].get("price", "N/A"),
                "text": match["metadata"].get("text", "N/A")
            })

        if not results:
            print("⚠️ Không có kết quả nào đạt ngưỡng độ tương đồng.")
            return []

        return results

    except Exception as e:
        print(f"⚠️ Lỗi khi truy vấn Pinecone: {str(e)}")
        return []


