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
L.marker([lat, lng], { icon: blackIcon }).addTo(map)
.bindPopup(`Flood Risk: (data not available)`);

//from google sheet

const scriptURL = "https://script.google.com/macros/s/AKfycbyzs37K_Nnv5O_ZVQdPvleDe7EG8TjDXOcSVccrkqIcS9xlaGwvRzrPI46ZET4bOmyY2g/exec";

function handleFloodData(data) {
  data.forEach(loc => {
    plotLocation(loc.Location, loc["Flood Risk"]);
  });
}

function loadFloodData() {
  const jsonpURL = `${scriptURL}?callback=handleFloodData`;
  const script = document.createElement('script');
  script.src = jsonpURL;
  document.body.appendChild(script);
}

// Then call loadFloodData() to start the process
loadFloodData();
async function plotLocation(address, floodRisk) {
  try {
    // Use Mapbox's geocoding API to get coordinates
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}`;

    const response = await fetch(geocodeUrl);
    const data = await response.json();
    console.log("Geocode result for", address, data);
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      const riskColor = getRiskColor(floodRisk);
      const marker = L.circleMarker([lat, lng], {
        radius: 5,
        fillColor: riskColor,
        color: "#000",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.5
      }).addTo(map);
      marker.bindPopup(`Flood Risk: ${floodRisk}`);
    } else {
      console.warn("No geocode results for:", address);
    }
  } catch (error) {
    console.error("Geocoding error for:", address, error);
  }
}

function getRiskColor(risk) {
  if (risk >= 4) return "#FF0000"; // high risk
  if (risk >= 2) return "#FFA500"; // medium risk
  return "#008000"; // low risk
}

// Start loading the flood data via JSONP
loadFloodData();


  
// --- Bottom Buttons Event Listeners ---
document.querySelector(".home-button").addEventListener("click", function() {
  window.location.href = "../index.html"; // Change to your actual home page
});

document.getElementById("downloadBtn").addEventListener("click", function() {
  // Insert PDF download functionality here.
  alert("Download as PDF functionality not implemented yet.");
});

document.getElementById("emailBtn").addEventListener("click", function() {
  // Insert email functionality here.
  alert("Email to me functionality not implemented yet.");
});
