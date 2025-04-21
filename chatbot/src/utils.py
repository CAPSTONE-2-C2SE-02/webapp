from langchain.text_splitter import RecursiveCharacterTextSplitter
from os import path
import sys
import csv
import math
sys.path.append(path.abspath(path.join(path.dirname(__file__), "..")))
from src.embedder import get_embedding




def read_csv_file(file_path):
    """Read CSV file and extract required tour information."""
    tours = []

    with open(file_path, "r", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)

        for row in reader:
                # Xử lý giá tour
                raw_price = int(float(row["priceForAdult"])) if row["priceForAdult"] else 0
                formatted_price = f"{raw_price:,} Đồng".replace(",", ".")

                # Xử lý thời lượng - chắc chắn là số nguyên
                raw_duration = int(float(row["duration"])) if row["duration"] else 0
                formatted_duration = f"{raw_duration} Ngày"

                tour = {
                    "code": row["_id"].strip() if row["_id"] else "",
                    "title": row["title"].strip() if row["title"] else "",
                    "description": row["introduction"].strip() if row["introduction"] else "",
                    "destination": row["destination"].strip() if row["destination"] else "",
                    "departure": row["departureLocation"].strip() if row["departureLocation"] else "",
                    "price": formatted_price,
                    "maxParticipants": int(row["maxParticipants"]) if row["maxParticipants"] else 0,
                    "duration": formatted_duration
                }
                tours.append(tour)

        return tours


def chunk_tours_with_langchain(tours, chunk_size=500, chunk_overlap=50):
    """ Splitting data using LangChain Text Splitter """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, 
        chunk_overlap=chunk_overlap
    )

    all_chunks = []
    for tour in tours:
        tour_text = f"Code: {tour['code']}\nTitle: {tour['title']}\nDescription: {tour['description']}\nDestination: {tour['destination']}\nDeparture: {tour['departure']}\nPrice: {tour['price']}\nMax Participants: {tour['maxParticipants']}\nDuration: {tour['duration']}"
        chunks = text_splitter.split_text(tour_text)
        all_chunks.extend(chunks)

    return all_chunks

