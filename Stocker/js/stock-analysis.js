// ✅ API Key & Base URL (Replace with your key)
const API_KEY = "lcJAl6mYKGdgTG681z00DFGsTlRHsWNq";
const BASE_URL =
  "https://financialmodelingprep.com/api/v3/historical-price-full/";

// ✅ Fetch stock data and analyze it
document
  .getElementById("stockSearchForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    let stockSymbol = document
      .getElementById("stockSymbol")
      .value.toUpperCase();
    if (!stockSymbol) return alert("Please enter a stock symbol!");

    try {
      let response = await fetch(`${BASE_URL}${stockSymbol}?apikey=${API_KEY}`);
      if (!response.ok) {
        alert(`Error: ${response.status} - Unable to fetch data!`);
        return;
      }
      let data = await response.json();


      if (!data || !data.historical || data.historical.length === 0) {
        alert("No stock data found for this symbol. Please try another.");
        return;
      }


      let prices = data.historical.map((entry) => entry.close).reverse();
      let dates = data.historical
        .map((entry) => moment(entry.date).format("YYYY-MM-DD"))
        .reverse();


      displayStockChart(dates, prices);
      analyzeStock(prices);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  });

// ✅ Display stock price graph using Chart.js
function displayStockChart(dates, prices) {
  let ctx = document.getElementById("stockChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Stock Price",
          data: prices,
          borderColor: "blue",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { display: true },
        y: { display: true },
      },
    },
  });

  document.querySelector(".stock-result").style.display = "flex";
}

// ✅ Analyze stock using LSTM model
async function analyzeStock(prices) {
  document.getElementById("predictedPrice").innerText = "Predicting... ⏳";

  let minPrice = Math.min(...prices);
  let maxPrice = Math.max(...prices);
  let scaledPrices = prices.map((p) => (p - minPrice) / (maxPrice - minPrice));

  let timeSteps = 60;
  let inputSequence = scaledPrices.slice(-timeSteps);
  let inputTensor = tf.tensor2d([inputSequence], [1, timeSteps]);

  try {
    let model = await tf.loadLayersModel("tf-model/model.json");
    let prediction = model.predict(inputTensor);
    let predictedPrice =
      prediction.dataSync()[0] * (maxPrice - minPrice) + minPrice;

    document.getElementById(
      "predictedPrice"
    ).innerText = `$${predictedPrice.toFixed(2)}`;
  } catch (error) {
    document.getElementById("predictedPrice").innerText =
      "Prediction failed ❌";
    console.error("Prediction error:", error);
  }
}
