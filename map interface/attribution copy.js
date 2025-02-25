const mapboxToken = "pk.eyJ1IjoicXVpeWlsIiwiYSI6ImNsemoxNHlhMTBsa2UyaXByd3pvcjM4ZjgifQ.JTxA-uHyVmgrVrRoNJiAyA";

// Retrieve coordinates and address from URL
const urlParams = new URLSearchParams(window.location.search);
const lat = parseFloat(urlParams.get('lat')) || 40.7128;
const lng = parseFloat(urlParams.get('lng')) || -74.0060; 
const address = urlParams.get('address') || 'Unknown Address';

// Debugging: Log the retrieved address
console.log("Retrieved Address:", `"${address}"`);

// Dynamically insert the address into the #location-display section
document.getElementById('location-display').innerHTML = `
    <div style="font-size: 18px">
        <span>Location :</span> <br> <span>${address}</span>
    </div>
`;

const blackIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
    iconSize: [25, 41], 
    iconAnchor: [12, 41], // Position relative to its location
    popupAnchor: [1, -34], // Position where the popup opens
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41], 
    shadowAnchor: [12, 41]
});

// NYC extent
const nycBounds = [[40.4774, -74.2591], [40.9176, -73.7004]];

const map = L.map('map', {
    maxBounds: nycBounds,
    maxZoom: 18,
    minZoom: 10
}).setView([lat, lng], 14);

L.tileLayer('https://api.mapbox.com/styles/v1/quiyil/cm2m8fdnz001x01qj75tm3xod/tiles/{z}/{x}/{y}?access_token=' + mapboxToken, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);

// Add marker
L.marker([lat, lng], { icon: blackIcon }).addTo(map);

// radar chart data based on address
let radarData = [];
if (address.trim() === "200 West 44th Street, New York, New York 10036, United States") {
    radarData = [3, 1, 4, 4]; // Times Square
    console.log("Matched Times Square:", radarData);
} else if (address.trim() === "42-20 27th Street, Long Island City, New York 11101, United States") {
    radarData = [2, 4, 4, 1]; // Long Island City
    console.log("Matched Long Island City:", radarData);
} else {
    radarData = [3, 1, 4, 4]; // random
    console.log("Default Data Assigned:", radarData);
}

// Radar Chart with Chart.js
const ctx = document.getElementById('radarChart').getContext('2d');
new Chart(ctx, {
    type: 'radar',
    data: {
        labels: ['Historic Flood', 'Impervious Surface Coverage', 'Neighborhood Socioeconomic Status', 'Flood Insurance'],
        datasets: [{
            label: 'Attributes',
            data: radarData, // Use the determined data
            backgroundColor: 'rgba(255, 215, 0, 0.5)',
            borderColor: 'rgba(255, 215, 0, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(255, 215, 0, 1)'
        }]
    },
    options: {
        layout: {
            padding: 1 
        },
        scales: {
            r: {
                beginAtZero: true,
                max: 4,
                ticks: {
                    stepSize: 1,
                    color: '#FFFFFF', 
                    font: {
                        size: 14, 
                        weight: 'bold' 
                    },
                    z: 1, 
                    showLabelBackdrop: false
                },
                grid: {
                    circular: true,
                    color: 'rgba(255, 255, 255, 0.3)'
                },
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.5)' 
                },
                pointLabels: {
                    color: '#FFFFFF', 
                    font: {
                        size: 16,
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }
});

function redirectToAnswerPage() {
    window.location.href = 'nextpage.html';
}