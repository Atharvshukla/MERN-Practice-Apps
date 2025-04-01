const apiUrl = "https://api.coindesk.com/v1/bpi/historical/close.json";
const ctx = document.getElementById("priceChart").getContext("2d");

// Fetch Bitcoin prices and render the chart
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    const dates = Object.keys(data.bpi);
    const prices = Object.values(data.bpi);

    renderChart(dates, prices);
  })
  .catch(error => console.error("Error fetching data:", error));

// Render Chart
function renderChart(dates, prices) {
  new Chart(ctx, {
    type: "line", // Line chart
    data: {
      labels: dates,
      datasets: [
        {
          label: "Bitcoin Price (USD)",
          data: prices,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.2,
          borderWidth: 2,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        tooltip: {
          enabled: true,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Dates",
          },
        },
        y: {
          title: {
            display: true,
            text: "Price (USD)",
          },
          ticks: {
            callback: function (value) {
              return `$${value}`; // Format y-axis labels as currency
            },
          },
        },
      },
    },
  });
}
