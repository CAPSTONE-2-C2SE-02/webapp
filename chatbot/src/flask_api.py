from flask import Flask, request, jsonify
import requests
import json

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

from flask_cors import CORS
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:3000"]}}, supports_credentials=True)

CHATBOT_SERVICE_URL = "http://localhost:5001/process"  

@app.route('/flask', methods=['GET', 'POST'])
def chat():
    try:
        print("Received request to /flask")
        
        # Handle both GET and POST requests
        if request.method == 'GET':
            message = request.args.get('message')
            if not message:
                return jsonify({
                    "status": "error",
                    "message": "Vui lòng gửi tin nhắn hợp lệ",
                    "data": None,
                    "error": "Missing message parameter"
                }), 400
            data = {"message": message}
        else:  # POST request
            data = request.get_json()
            if not data or 'message' not in data:
                return jsonify({
                    "status": "error",
                    "message": "Vui lòng gửi tin nhắn hợp lệ",
                    "data": None,
                    "error": "Invalid request format"
                }), 400

        print("Request data:", data)
        
        # Forward request to chatbot service using GET
        print(f"Forwarding to chatbot service at {CHATBOT_SERVICE_URL}")
        response = requests.get(CHATBOT_SERVICE_URL, json=data)
        print(f"Response status: {response.status_code}")
        
        if response.status_code != 200:
            return jsonify({
                "status": "error",
                "message": "Không thể kết nối đến dịch vụ chatbot",
                "data": None,
                "error": f"Chatbot service returned status {response.status_code}"
            }), 503
            
        return response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to chatbot service: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Không thể kết nối đến dịch vụ chatbot",
            "data": None,
            "error": str(e)
        }), 503
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