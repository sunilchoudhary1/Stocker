document
  .getElementById("stockAnalysisLink")
  .addEventListener("click", function () {
    const section = document.getElementById("stockAnalysisSection");
    section.style.display = section.style.display === "none" ? "block" : "none";
  });

document
  .getElementById("stockSearchForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const symbol = document.getElementById("stockSymbol").value.toUpperCase();
    fetchStockData(symbol);
  });

async function fetchStockData(symbol) {
  const apiKey = "lcJAl6mYKGdgTG681z00DFGsTlRHsWNq";
  const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();

    if (data.historical && data.historical.length > 0) {
      const historicalData = data.historical.slice(0, 365).reverse();
      const conversionRate = 83;
      const dataPoints = historicalData.map((item) => ({
        x: new Date(item.date),
        y: parseFloat(item.close) * conversionRate,
      }));

      displayChart(symbol, dataPoints);
      performAnalysis(historicalData, symbol);
    } else {
      alert("Stock data not found. Please enter a valid symbol.");
    }
  } catch (error) {
    console.error("Error fetching stock data:", error);
    alert("Failed to fetch stock data. Please try again later.");
  }
}

function displayChart(symbol, dataPoints) {
  const ctx = document.getElementById("stockChart").getContext("2d");
  if (window.stockChartInstance) window.stockChartInstance.destroy();

  window.stockChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: `${symbol} Price Trends (INR)`,
          data: dataPoints,
          borderColor: "#00b894",
          fill: false,
          tension: 0.4,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "time",
          time: {
            unit: "month",
            tooltipFormat: "MMM yyyy",
            displayFormats: {
              month: "MMM yyyy",
            },
          },
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "Price (INR)",
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `₹${context.parsed.y.toFixed(2)}`,
          },
        },
      },
    },
  });
}

function performAnalysis(data, symbol) {
  const prices = data.map((item) => parseFloat(item.close) * 83);
  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const priceChange = (((endPrice - startPrice) / startPrice) * 100).toFixed(2);

  const recommendation =
    priceChange > 5
      ? `📈 Strong upward trend. Consider <b>buying</b> ${symbol}.`
      : priceChange < -5
      ? `📉 Downward trend. Consider <b>holding/selling</b> ${symbol}.`
      : `⚠️ Stable trend. It's safe to <b>hold</b> ${symbol}.`;

  document.querySelector(".stock-result").style.display = "block";
  document.getElementById("analysisSummary").innerHTML = `
        <p>💹 <strong>Price Change:</strong> ${priceChange}% over the past year.</p>
        <p>${recommendation}</p>
    `;

  // Additional Analysis (Dummy Data for Now)
  document.getElementById("pricePrediction").innerText =
    "Forecast shows steady growth based on SMA/EMA trends.";
  document.getElementById("technicalInsights").innerText =
    "RSI indicates overbought conditions; MACD suggests a bullish crossover.";
  document.getElementById("fundamentalAnalysis").innerText =
    "P/E Ratio is healthy; EPS growth is consistent.";
  document.getElementById("newsImpact").innerText =
    "Recent earnings reports positively impacted the price.";
  document.getElementById("dividendInfo").innerText =
    "Dividend Yield: 2.5%, consistently paid annually.";
  document.getElementById("riskAssessment").innerText =
    "Beta Value: 1.1 indicating moderate volatility.";
  document.getElementById("volumeAnalysis").innerText =
    "Recent volume spikes suggest strong institutional interest.";
  document.getElementById("sentimentAnalysis").innerText =
    "Positive sentiment in social media and forums.";
  document.getElementById("portfolioImpact").innerText =
    "Diversifies portfolio with moderate risk exposure.";
}
