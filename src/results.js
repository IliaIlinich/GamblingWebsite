// Get the data from memory
const results = JSON.parse(localStorage.getItem('gameResults')) || [];
const tableBody = document.getElementById('tableBody');

// Loop through the data and create a table row for each one
results.forEach((record) => {
  const row = document.createElement('tr');

  row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.game}</td>
                <td>${record.result}</td>
            `;

  tableBody.appendChild(row);
});
