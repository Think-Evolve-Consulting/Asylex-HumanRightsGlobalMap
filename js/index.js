const popup = document.querySelector("#popup-container");
const table = document.querySelector("#table");
const tableBtn = document.querySelector("#tableBtn");
const content = document.getElementById("content");

function showPopup(data) {
  popup.innerHTML = data;
  popup.style.display = "block";
}

function hidePopup() {
  popup.style.display = "none";
  document.removeEventListener("click", hidePopupOnClickOutside);
}

function hideTable() {
  table.style.display = "none";
  tableBtn.style.display = "block";
}

function showTable() {
  table.style.display = "block";
  tableBtn.style.display = "none";
}

function hidePopupOnClickOutside(event) {
  if (!popup.contains(event.target)) {
    hidePopup();
  }
}
