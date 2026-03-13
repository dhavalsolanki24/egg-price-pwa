const citySelect = document.getElementById("city");
const table = document.getElementById("priceTable");

async function loadPrices() {

let res = await fetch("prices.json");
let data = await res.json();

let city = citySelect.value;

table.innerHTML = "<tr><th>Date</th><th>Price</th></tr>";

data[city].forEach(item => {

let row = table.insertRow();

row.insertCell(0).innerText = item.date;
row.insertCell(1).innerText = "₹ " + item.price;

});
}

citySelect.addEventListener("change",loadPrices);

loadPrices();