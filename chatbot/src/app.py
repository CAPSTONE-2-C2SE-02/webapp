from os import path
import sys
import json
sys.path.append(path.abspath(path.join(path.dirname(__file__), "..")))

from src.utils import read_csv_file
from src.embedder import get_embedding
from src.pineconeClient import upsert_to_pinecone,index

txt_path = "data/tours.csv"  

tours = read_csv_file(txt_path)

# Tạo text và vectors
for tour in tours:
    tour["text"] = f"Code: {tour['code']}\nTitle: {tour['title']}\nDescription: {tour['description']}\nDestination: {tour['destination']}\nPrice: {tour['price']}\nMax Participants: {tour['maxParticipants']}\nDuration: {tour['duration']}"

# Tạo vectors với ID là tour_code
vectors = [
    {
        "id": f"tour_{tour['code']}",
        "values": get_embedding(tour["text"]),
        "metadata": tour
    }
    for tour in tours
]

# Kiểm tra vector nào đã tồn tại
def filter_new_vectors(vectors):
    ids = [v["id"] for v in vectors]
    existing = index.fetch(ids).vectors.keys()
    return [v for v in vectors if v["id"] not in existing]

new_vectors = filter_new_vectors(vectors)
print(f"🆕 Số lượng vector mới cần upsert: {len(new_vectors)}")

# Upsert nếu có dữ liệu mới
if new_vectors:
    index.upsert(vectors=new_vectors)
    print("✅ Csv data has been successfully embedded and upserted into Pinecone!")
else:
    print("⛔ No new data to upsert — all vectors already exist.")

