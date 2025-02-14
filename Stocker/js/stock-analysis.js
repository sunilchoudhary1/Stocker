// 🚀 Stock Analysis Form Submission
document
  .getElementById("stockSearchForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const symbol = document.getElementById("stockSymbol").value;

    fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: symbol }),
    })
      .then((response) => response.json())
      .then((data) => {
        document.querySelector(".stock-result").style.display = "block";
        document.getElementById("analysisSummary").innerHTML = `<h3>${
          data.symbol
        } - Predicted Price: $${data.predicted_price.toFixed(2)}</h3>`;
      })
      .catch((error) => console.error("Error:", error));
  });

// ✅ Test Backend Connection
document.addEventListener("DOMContentLoaded", function () {
  const testButton = document.createElement("button");
  testButton.textContent = "Test Backend Connection";
  document.body.appendChild(testButton);

  testButton.addEventListener("click", function () {
    fetch("http://127.0.0.1:5000/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello from Frontend!" }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.response); // Shows backend response
      })
      .catch((error) => console.error("Error:", error));
  });
});
