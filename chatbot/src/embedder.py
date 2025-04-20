from sentence_transformers import SentenceTransformer

model = SentenceTransformer("intfloat/multilingual-e5-large")

def get_embedding(texts):
    if isinstance(texts, list):  
        return model.encode(["passage: " + t for t in texts], normalize_embeddings=True).tolist()
    else:
        return model.encode("passage: " + texts, normalize_embeddings=True).tolist()

