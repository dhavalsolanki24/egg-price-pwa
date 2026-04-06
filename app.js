const table = document.getElementById("priceTable");

async function loadPrices() {

    let res = await fetch(`prices.json?t=${Date.now()}`);
    let data = await res.json();

    const cities = ["ahmedabad", "surat", "mumbai", "delhi"];

    // Collect ALL dates from all cities
    // Collect valid dates (at least one city has data)
let validDates = [];

let allDatesSet = new Set();

cities.forEach(city => {
    data[city].forEach(item => {
        allDatesSet.add(item.date);
    });
});

let allDates = Array.from(allDatesSet).sort((a, b) => a - b);

// Filter valid days
validDates = allDates.filter(day => {

    return cities.some(city => {
        let d = data[city].find(x => x.date === day);
        return d && d.price && d.price !== "-" && d.price !== "NaN";
    });

});

// Take last 5 VALID days
let lastDates = validDates.slice(-8);

    // Clear table
    table.innerHTML = "";

    // Header
    let header = table.insertRow();
    header.innerHTML = `
        <th>Date</th>
        <th>Ahmedabad</th>
        <th>Surat</th>
        <th>Mumbai</th>
        <th>Delhi</th>
    `;

    const month = new Date().toLocaleString('default', { month: 'short' });
    const curr_date = new Date().getDate();
    const daysInCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    lastDates.forEach((day, index) => {
        if (day > daysInCurrentMonth) return; // Skip invalid date

        let row = table.insertRow();

        let dateStr = String(day).padStart(2, '0') + "-" + month;
        row.insertCell(0).innerText = dateStr;

        cities.forEach(city => {

            let cityData = data[city].find(d => d.date === day);
            let prevDay = lastDates[index - 1];
            let prevData = data[city].find(d => d.date === prevDay);

            let cell = row.insertCell(-1);

            // ❌ No data or '-'
            if (!cityData || cityData.price === "-" || cityData.price === "NaN") {
                cell.innerText = "-";
                return;
            }

            let price = cityData.price;
            let display = price;

            // If previous data missing → no trend
            if (!prevData || prevData.price === "-" || prevData.price === "NaN") {
                cell.innerText = display;
                return;
            }

            let prevPrice = prevData.price;

            if (price > prevPrice) {
                cell.innerHTML = `${display}`;
                cell.className = "down";
            }
            else if (price < prevPrice) {
                cell.innerHTML = `${display}`;
                cell.className = "up";
            }
            else {
                cell.innerHTML = `${display}`;
            }

            if(day === curr_date) {
                row.className = "bold-row";
            }

        });

    });

}

loadPrices();
