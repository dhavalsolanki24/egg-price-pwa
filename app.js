// ==============================
// Egg Price Variables
// ==============================
const table = document.getElementById("priceTable");

// ==============================
// Newspaper Variables
// ==============================
let newspaperData = null;
let currentPage = 0;

const SWIPE_THRESHOLD = 60; // pixels

// ==============================
// Egg Price Functions
// ==============================
async function loadPrices() {

    let res = await fetch(`prices.json?t=${Date.now()}`);
    let data = await res.json();

    const lastUpdated = document.getElementById("lastUpdated");

    if (data._metadata && data._metadata.updated_at) {
        lastUpdated.innerHTML =
            "Last updated: " + "<b>"+data._metadata.updated_at+"</b>";
    } else {
        lastUpdated.innerHTML =
            "Last updated: Unknown";
    }

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

// ==============================
// Newspaper Functions
// ==============================

async function loadNewspaper(){
    try{
        const response =
            await fetch(`newspaper.json?t=${Date.now()}`);

        const data = await response.json();

        if(data.pages.length){
            // document.getElementById("newspaperImage").src =
            //     data.pages[1].image;
            newspaperData = data;
            showPage(0);
        }
        document.getElementById("paperEdition").innerText =
            data._metadata.edition;

        document.getElementById("paperUpdated").innerHTML =
            "Updated: " + "<b>"+data._metadata.updated_at+"</b>";

        newspaperData = data;
        showPage(0);
    }
    catch(e){
        console.log(e);
    }
}

function showPage(index){
    if(!newspaperData) return;

    const pages = newspaperData.pages;
    currentPage = index;

    // document.getElementById("newspaperImage").src =
    //     pages[index].image;

    // const image = document.getElementById("newspaperImage");
    // image.style.opacity = "0.3";
    // image.src = pages[index].image;
    // image.onload = () => {
    //     image.style.opacity = "1";
    // };

    const image = document.getElementById("newspaperImage");
    const loader = document.getElementById("paperLoader");
    loader.style.display = "block";

    const temp = new Image();
    temp.onload = function(){
        image.src = temp.src;
        loader.style.display = "none";
    };
    temp.src = newspaperData.pages[index].image;

    document.getElementById("pageNumber").innerText =
        `${index+1} / ${pages.length}`;

    document.getElementById("prevBtn").disabled =
        index===0;

    document.getElementById("nextBtn").disabled =
        index===pages.length-1;

    // Preload previous and next pages
    //preloadPage(index - 1);
    preloadPage(index + 1);
}

// function showPage(index){
//     const image = document.getElementById("newspaperImage");
//     const loader = document.getElementById("paperLoader");
//     loader.style.display = "block";

//     const temp = new Image();

//     temp.onload = function(){
//         image.src = temp.src;
//         loader.style.display = "none";
//     };

//     temp.src = newspaperData.pages[index].image;
// }


function preloadPage(index) {
    if (!newspaperData) return;

    if (index < 0 || index >= newspaperData.pages.length)
        return;

    const img = new Image();
    img.src = newspaperData.pages[index].image;
}

// ==============================
// swipe button handlers
// ==============================
function handleSwipe() {
    const diff = touchEndX - touchStartX;
    // Swipe Right (Previous)
    if (diff > SWIPE_THRESHOLD) {
        if (currentPage > 0) {
            showPage(currentPage - 1);
        }
    }
    // Swipe Left (Next)
    else if (diff < -SWIPE_THRESHOLD) {
        if (currentPage < newspaperData.pages.length - 1) {
            showPage(currentPage + 1);
        }
    }
}


// ==============================
// Button Events   <-- Step 5 goes here
// ==============================
document.getElementById("prevBtn").onclick = () => {

    if (currentPage > 0) {
        showPage(currentPage - 1);
    }

};

document.getElementById("nextBtn").onclick = () => {

    if (currentPage < newspaperData.pages.length - 1) {
        showPage(currentPage + 1);
    }

};


// ==============================
// App Start
// ==============================
loadPrices();
loadNewspaper();


// ==============================
// swipe events
// ==============================
const paper = document.getElementById("newspaperImage");

paper.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1)
        return;
    touchStartX = e.touches[0].screenX;
}, { passive: true });

paper.addEventListener("touchend", function (e) {
    if (e.changedTouches.length !== 1)
        return;
    touchEndX = e.changedTouches[0].screenX;
    paper.style.transition = "transform .25s ease";
    paper.style.transform = "translateX(0)";
    handleSwipe();
}, { passive: true });


let dragging = false;
paper.addEventListener("touchmove", function(e){
    if(e.touches.length!==1)
        return;
    dragging = true;
    const currentX = e.touches[0].screenX;
    const delta = currentX-touchStartX;
    paper.style.transition = "none";
    paper.style.transform = `translateX(${delta}px)`;
    //paper.style.transform="translateX(0)";
    
},{passive:true});
