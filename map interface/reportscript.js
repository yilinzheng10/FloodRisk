document.addEventListener("DOMContentLoaded", function() {
  const mapboxToken = "pk.eyJ1IjoicXVpeWlsIiwiYSI6ImNsemoxNHlhMTBsa2UyaXByd3pvcjM4ZjgifQ.JTxA-uHyVmgrVrRoNJiAyA";
  
  const proxyUrl = "https://cors-anywhere.herokuapp.com/";
  const scriptURL = "https://script.google.com/macros/s/AKfycbyyDqv7BcaeeqPqmVKiy504CIQ5scHK2v80xCXZ9Tjj/dev";
  
  // Retrieve URL parameters (if present) and update location display and map marker
  const urlParams = new URLSearchParams(window.location.search);
  const latParam = parseFloat(urlParams.get('lat')) || 40.7128;
  const lngParam = parseFloat(urlParams.get('lng')) || -74.0060;
  const addressParam = urlParams.get('address') || 'Unknown Address';
  
  console.log("URL Parameters:", latParam, lngParam, addressParam);
  
  // Update location display element
  const locationDisplay = document.getElementById('location-display');
  if (locationDisplay) {
    locationDisplay.innerHTML = `
      <div style="font-size: 15px">
        <span style="color:#FF5722; font-weight:bold;">Location :</span> <br>
        <span>${addressParam}</span>
      </div>
    `;
  }
  
  // Initialize the Leaflet map in the #map container (inside bottom right table card)
  const map = L.map('map', {
    center: [latParam, lngParam],
    zoom: 14,
    maxZoom: 18,
    minZoom: 10
  });
  
  L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`, {
    attribution: 'Map data &copy; OpenStreetMap contributors, Imagery © Mapbox',
    tileSize: 512,
    zoomOffset: -1
  }).addTo(map);
  
  // Create a white marker icon by inverting the black marker via CSS (or use your own hosted image)
  const whiteIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
  });
  
  // Optionally, after markers are added, apply a CSS filter to invert colors.
  // (This might not work if markers are added after the fact, so it's best to use your own white marker.)
  // Example:
  // Array.from(document.getElementsByClassName('leaflet-marker-icon')).forEach(img => {
  //   img.style.filter = "brightness(0) invert(1)";
  // });
  
  // Add a marker at the provided location from URL parameters
  L.marker([latParam, lngParam], { icon: whiteIcon }).addTo(map)
    .bindPopup(`<strong>${addressParam}</strong><br>Flood Risk: (data not available)`);
  
  // --- Bottom Buttons Event Listeners ---
  document.querySelector(".home-button").addEventListener("click", function() {
    window.location.href = "../tool.html"; // Change to your actual home page
  });
  
  document.getElementById("downloadBtn").addEventListener("click", function() {
    // Insert PDF download functionality here.
    alert("Download as PDF functionality not implemented yet.");
  });
  
  document.getElementById("emailBtn").addEventListener("click", function() {
    // Insert email functionality here.
    alert("Email to me functionality not implemented yet.");
  });
  
  // If you wish to update dynamic data from your Google Sheet, you can call your loadFloodData() function here.
  // For example, if you want to plot all flood risk markers, uncomment the next line:
  // loadFloodData();
  
  // Example of loadFloodData() that fetches JSON from your Apps Script and plots markers:
  async function loadFloodData() {
    try {
      const response = await fetch(scriptURL);
      const locations = await response.json();
      for (const loc of locations) {
        const address = loc["Location"];
        const floodRisk = loc["Flood Risk"];
        await plotLocation(address, floodRisk);
      }
    } catch (error) {
      console.error("Error fetching flood data:", error);
    }
  }
  
  async function plotLocation(address, floodRisk) {
    try {
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        const riskColor = getRiskColor(floodRisk);
        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: riskColor,
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map);
        marker.bindPopup(`<strong>${address}</strong><br>Flood Risk: ${floodRisk}`);
      } else {
        console.warn("No geocode results for:", address);
      }
    } catch (error) {
      console.error("Geocoding error for:", address, error);
    }
  }
  
  function getRiskColor(risk) {
    if (risk >= 4) return "#FF0000"; // high risk (red)
    if (risk >= 2) return "#FFA500"; // medium risk (orange)
    return "#008000"; // low risk (green)
  }
});