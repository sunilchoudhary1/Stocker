from flask import Flask, render_template, request, jsonify
from model.lstm_model import predict_stock_price
from flask_cors import CORS  # Import CORS
import os

# Configure Flask to look for templates in the current directory
app = Flask(__name__, template_folder='.', static_folder='.', static_url_path='/')

CORS(app)  # Enable CORS to handle frontend-backend requests

# 🔄 Load stock-analysis.html by default
@app.route('/')
def stock_analysis():  
    return render_template('stock-analysis.html')  # Opens stock-analysis.html instead of index.html

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    stock_symbol = data.get('symbol')
    prediction = predict_stock_price(stock_symbol)
    return jsonify(prediction)

# ✅ Test Route to Check Frontend-Backend Connection
@app.route('/test', methods=['POST'])
def test_connection():
    data = request.json
    message = data.get('message', 'No message received')
    return jsonify({'response': f'Backend received: {message}'})

if __name__ == '__main__':
    app.run(debug=True)
