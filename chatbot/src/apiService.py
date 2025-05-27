from flask import Flask, request, jsonify
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import handle_query

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False



@app.route('/process', methods=['GET'])
def process():
    try:
        data = request.get_json()
        message = data.get('message', '')
        response = handle_query(message)
        return jsonify(response)
    except Exception as e:
        print(f"Error in processing: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Lỗi xử lý câu hỏi",
            "data": None,
            "error": str(e)
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)