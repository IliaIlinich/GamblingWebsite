/**
 * @file contact-us.js
 * @description Handles the submission of the contact form. Mocks backend
 * integration by serializing the form data into a JSON file and triggering
 * a local download for the user.
 */

// Bind the event listener to the form submission
document.getElementById('myForm').addEventListener('submit', function (event) {
  // Prevent the default browser behavior (which would normally refresh the page
  // and attempt to send a GET/POST request to the current URL).
  event.preventDefault();

  /**
   * Extractor: Retrieve the form data.
   * `FormData` automatically parses all input fields within the form that have a 'name' attribute.
   * @type {FormData}
   */
  const formData = new FormData(this);

  /**
   * Transformer: Convert the iterable FormData object into a standard JavaScript Object.
   * @type {Object}
   */
  const formObject = Object.fromEntries(formData.entries());

  /**
   * Serializer: Convert the JavaScript Object into a formatted JSON string.
   * The 'null, 2' arguments ensure the output is pretty-printed with 2 spaces of indentation.
   * @type {string}
   */
  const jsonString = JSON.stringify(formObject, null, 2);

  /**
   * Buffer/Blob creation: Package the JSON string into a Blob (Binary Large Object).
   * This tells the browser to treat the string as an actual file of type application/json.
   * @type {Blob}
   */
  const blob = new Blob([jsonString], { type: 'application/json' });

  /**
   * Memory Allocation: Create a temporary, internal browser URL pointing to the Blob.
   * @type {string}
   */
  const url = URL.createObjectURL(blob);

  // ==========================================
  // VIRTUAL DOWNLOAD TRIGGER
  // ==========================================

  // 1. Create a virtual HTML anchor (<a>) element in memory
  const downloadLink = document.createElement('a');

  // 2. Set the destination to our Blob's temporary URL
  downloadLink.href = url;

  // 3. Define the default filename for the downloaded file
  downloadLink.download = 'formData.json';

  // 4. Temporarily attach the anchor to the Document Object Model (DOM)
  document.body.appendChild(downloadLink);

  // 5. Programmatically trigger a click event to execute the download
  downloadLink.click();

  // 6. Immediately remove the anchor from the DOM to keep the tree clean
  document.body.removeChild(downloadLink);

  // ==========================================
  // CLEANUP & LOGGING
  // ==========================================

  // Free up browser memory by revoking the temporary URL once the download initiates.
  // This is a crucial step to prevent memory leaks in single-page applications.
  URL.revokeObjectURL(url);

  // Confirm successful execution in the developer console
  console.log('Form data successfully serialized and downloaded as JSON.');
});
