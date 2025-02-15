from flask import Flask, request, jsonify, render_template, send_from_directory
import requests
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import os  # Import os to set template folder

app = Flask(__name__, template_folder=os.getcwd())  # Set template folder to root directory

# Route to serve CSS files
@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory("css", filename)

# Route to serve JS files
@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory("js", filename)

# Your FinancialModelingPrep API Key
API_KEY = "lcJAl6mYKGdgTG681z00DFGsTlRHsWNq"
BASE_URL = "https://financialmodelingprep.com/api/v3/historical-price-full/"

# Function to fetch and preprocess stock data
def get_stock_data(ticker):
    api_url = f"{BASE_URL}{ticker}?apikey={API_KEY}"
    response = requests.get(api_url)

    if response.status_code != 200:
        return None, "Failed to fetch data"

    data = response.json()

    if "historical" not in data or not data["historical"]:
        return None, "No stock data available"

    # Convert data into Pandas DataFrame
    df = pd.DataFrame(data["historical"])

    # Keep only 'date' and 'close' columns
    df = df[['date', 'close']]
    df = df.rename(columns={'close': 'Close'})  # Rename column for consistency

    # Sort data in ascending order (API gives it in descending order)
    df = df.sort_values(by="date")

    # Normalize 'Close' prices using MinMaxScaler
    scaler = MinMaxScaler(feature_range=(0, 1))
    df["Close_scaled"] = scaler.fit_transform(df[['Close']])

    # Prepare time-series data for LSTM
    time_steps = 60
    X, Y = [], []
    for i in range(len(df) - time_steps):
        X.append(df["Close_scaled"].iloc[i:i + time_steps].values)
        Y.append(df["Close_scaled"].iloc[i + time_steps])

    return {
        "dates": df["date"].tolist(),
        "prices": df["Close"].tolist(),
        "scaled_prices": df["Close_scaled"].tolist(),
        "current_price": df["Close"].iloc[-1]
    }, None

# Route to handle stock search & preprocessing
@app.route('/search', methods=['GET'])
def search_stock():
    ticker = request.args.get('ticker', '').upper()

    if not ticker:
        return jsonify({"error": "Stock ticker is required"}), 400

    stock_data, error = get_stock_data(ticker)

    if error:
        return jsonify({"error": error}), 404

    return jsonify(stock_data)

# Route to render the stock analysis page
@app.route('/stock-analysis')
def stock_analysis():
    return render_template("stock-analysis.html")

if __name__ == '__main__':
    app.run(debug=True)
