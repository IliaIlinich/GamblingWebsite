/**
 * @file results.js
 * @description Retrieves game session results from the browser's local storage
 * and dynamically constructs HTML table rows to display the historical data.
 */

/**
 * Data Retrieval: Fetch and parse the stored game results.
 * Utilizes short-circuit evaluation (|| []) to ensure a valid array is returned
 * even if 'gameResults' is null (e.g., on the user's very first visit).
 * * @type {Array<Object>} Array of result objects containing date, game, and result properties.
 */
const results = JSON.parse(localStorage.getItem('gameResults')) || [];

/**
 * DOM Reference: Select the table body element where the dynamic rows will be injected.
 * @type {HTMLElement}
 */
const tableBody = document.getElementById('tableBody');

/**
 * Iteration & DOM Manipulation: Loop through each record in the results array
 * and construct the corresponding table row.
 */
results.forEach((record) => {
  // 1. Create a new, empty HTML Table Row (<tr>) element in memory
  const row = document.createElement('tr');

  // 2. Populate the row using a template literal for clean string interpolation.
  // This maps the object properties directly into HTML Table Data (<td>) cells.
  row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.game}</td>
                <td>${record.result}</td>
            `;

  // 3. Append the fully constructed row to the live DOM within the table body.
  tableBody.appendChild(row);
});
