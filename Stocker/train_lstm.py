import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
import tensorflowjs as tfjs

# ✅ Load Stock Data
def load_stock_data(stock_symbol):
    url = f"https://financialmodelingprep.com/api/v3/historical-price-full/{stock_symbol}?apikey=lcJAl6mYKGdgTG681z00DFGsTlRHsWNq"
    data = pd.read_json(url)
    
    if "historical" not in data or len(data["historical"]) == 0:
        raise ValueError("No stock data found!")
    
    df = pd.DataFrame(data["historical"].tolist())
    df = df[["date", "close"]].sort_values(by="date")
    df["date"] = pd.to_datetime(df["date"])
    
    return df

# ✅ Prepare Data for LSTM
def preprocess_data(df, time_steps=60):
    scaler = MinMaxScaler(feature_range=(0, 1))
    df["scaled_close"] = scaler.fit_transform(df["close"].values.reshape(-1, 1))
    
    X, y = [], []
    for i in range(time_steps, len(df)):
        X.append(df["scaled_close"].values[i - time_steps:i])
        y.append(df["scaled_close"].values[i])
    
    return np.array(X), np.array(y), scaler

# ✅ Train LSTM Model
def train_lstm_model(X_train, y_train):
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=(X_train.shape[1], 1)),
        LSTM(50, return_sequences=False),
        Dense(25),
        Dense(1)
    ])
    
    model.compile(optimizer="adam", loss="mean_squared_error")
    model.fit(X_train, y_train, epochs=20, batch_size=16)
    
    return model

# ✅ Save Model for TensorFlow.js
def export_to_tfjs(model):
    tfjs.converters.save_keras_model(model, "tf-model/")
    print("✅ Model successfully exported to tf-model/")

# ✅ Main Execution
if __name__ == "__main__":
    stock_symbol = "AAPL"  # Change to the stock you want to train on
    df = load_stock_data(stock_symbol)
    
    X, y, scaler = preprocess_data(df)
    
    # Reshape data for LSTM input
    X = X.reshape((X.shape[0], X.shape[1], 1))
    
    lstm_model = train_lstm_model(X, y)
    export_to_tfjs(lstm_model)

    print("🎉 LSTM Model Training & Export Completed!")
