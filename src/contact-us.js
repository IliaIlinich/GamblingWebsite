// This code takes the input data from the contact us form and downloads it
// as a .json file to demonstrate the further possibility of usage with
// backend in mind.
document.getElementById('myForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const formData = new FormData(this);

  const formObject = Object.fromEntries(formData.entries());

  const jsonString = JSON.stringify(formObject, null, 2);

  const blob = new Blob([jsonString], { type: 'application/json' });

  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'formData.json';

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  URL.revokeObjectURL(url);
  console.log(URL.createObjectURL(blob));
});
