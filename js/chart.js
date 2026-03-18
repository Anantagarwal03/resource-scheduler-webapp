let chart;

function updateChart() {
  const ctx = document.getElementById('chart').getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: bookings.map((_, i) => "B" + (i+1)),
      datasets: [{
        label: 'Bookings',
        data: bookings.map((_, i) => i + 1),
      }]
    }
  });
}

updateChart();