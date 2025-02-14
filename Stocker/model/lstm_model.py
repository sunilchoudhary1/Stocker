import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

def predict_stock_price(symbol):
    # Dummy data simulation (replace with real API data)
    np.random.seed(0)
    prices = np.random.randn(100) * 20 + 100  

    # LSTM Model
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=(10, 1)),
        LSTM(50),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse')

    X = np.array(prices[:-10]).reshape(-1, 10, 1)
    y = np.array(prices[10:])

    model.fit(X, y, epochs=5, batch_size=1, verbose=0)

    future_price = model.predict(X[-1].reshape(1, 10, 1))
    
    return {"symbol": symbol, "predicted_price": float(future_price[0][0])}

