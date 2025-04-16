from flask import Flask, request, jsonify
import requests
import json

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

from flask_cors import CORS
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# Địa chỉ của process chatbot chính
CHATBOT_SERVICE_URL = "http://localhost:5001/process"  

@app.route('/flask', methods=['POST'])
def chat():
    try:
        print("Received request to /flask")
        data = request.get_json()
        print("Request data:", data)
        
        if not data or 'message' not in data:
            print("Invalid request format")
            return jsonify({
                "status": "error", 
                "message": "Vui lòng gửi tin nhắn hợp lệ",
                "data": None,
                "error": "Invalid request format"
            }), 400
        
        # Chuyển tiếp yêu cầu đến process chatbot chính
        print(f"Forwarding to chatbot service at {CHATBOT_SERVICE_URL}")
        response = requests.post(CHATBOT_SERVICE_URL, json=data)
        print(f"Response status: {response.status_code}")
        return response.json()
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Lỗi xử lý câu hỏi",
            "data": None,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Flask API on port 5002...")
    app.run(host='0.0.0.0', port=5002, debug=True)