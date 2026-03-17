const table = document.getElementById("priceTable");

async function loadPrices() {

    let res = await fetch(`prices.json?t=${new Date().getTime()}`)
    let data = await res.json();

    const cities = ["ahmedabad", "surat", "mumbai", "delhi"];

    let validDates = data["ahmedabad"]
        .filter(item => item.price && item.price !== "-" && item.price !== "NaN")
        .map(item => item.date);

    validDates.sort((a, b) => a - b);

    let lastDates = validDates.slice(-6);

    table.innerHTML = "";

    let header = table.insertRow();
    header.innerHTML = `
        <th>Date</th>
        <th>Ahmedabad</th>
        <th>Surat</th>
        <th>Mumbai</th>
        <th>Delhi</th>
    `;

    const month = new Date().toLocaleString('default', { month: 'short' });

    lastDates.forEach((day, index) => {
        if (day === 32) return; // Skip invalid date

        let row = table.insertRow();

        let dateStr = String(day).padStart(2, '0') + "-" + month;
        row.insertCell(0).innerText = dateStr;

        cities.forEach(city => {

            let cityData = data[city].find(d => d.date === day);
            let prevDay = lastDates[index - 1];

            let prevData = data[city].find(d => d.date === prevDay);

            let cell = row.insertCell(-1);

            if (cityData && cityData.price && cityData.price !== "NaN") {

                //let price = parseFloat(cityData.price) / 100;
                let price = cityData.price;

                let display = price;

                // Compare with previous day
                if (prevData && prevData.price) {

                    //let prevPrice = parseFloat(prevData.price) / 100;
                    let prevPrice = prevData.price;

                    if (price > prevPrice) {
                        cell.innerHTML = `${display}`;
                        cell.className = "up";
                    }
                    else if (price < prevPrice) {
                        cell.innerHTML = `${display}`;
                        cell.className = "down";
                    }
                    else {
                        cell.innerHTML = `${display}`;
                    }

                } else {
                    cell.innerText = display;
                }

            } else {
                cell.innerText = "-";
            }

        });

    });

}

loadPrices();
