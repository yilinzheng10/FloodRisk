const mapboxToken = "pk.eyJ1IjoicXVpeWlsIiwiYSI6ImNsemoxNHlhMTBsa2UyaXByd3pvcjM4ZjgifQ.JTxA-uHyVmgrVrRoNJiAyA";

// Optionally, use URL parameters as fallback:
const urlParams = new URLSearchParams(window.location.search);
const fallbackLat = parseFloat(urlParams.get('lat')) || 40.7128;
const fallbackLng = parseFloat(urlParams.get('lng')) || -74.0060;
const fallbackAddress = urlParams.get('address') || 'Unknown Address';

// Create the map with fallback coordinates
const nycBounds = [[40.4774, -74.2591], [40.9176, -73.7004]];
const leafletMap = L.map('floodMap', {
  maxBounds: nycBounds,
  maxZoom: 18,
  minZoom: 10
}).setView([fallbackLat, fallbackLng], 14);

L.tileLayer(`https://api.mapbox.com/styles/v1/quiyil/cm2m8fdnz001x01qj75tm3xod/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`, {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1
}).addTo(leafletMap);

const blackIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
    iconSize: [25, 41], 
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41], 
    shadowAnchor: [12, 41]
});

fetch("https://script.google.com/macros/s/AKfycbwhTHTkZyDpBtv5Tss9KBSEldLUY9mDsHLZOmX5CWDbufchowmj4F5xDufOBqwMioNStQ/exec")
  .then(response => response.json())
  .then(data => {
    const latestEntry = data[data.length - 1];
    const latestAddress = latestEntry.Location;
    document.getElementById("location-display").innerHTML = `<div class="highlight_text" style="font-size: 15px"><span>${latestAddress}</span></div>`;

    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(latestAddress)}.json?access_token=${mapboxToken}`;
    return fetch(geocodeUrl);
  })
  .then(response => response.json())
  .then(geocodeData => {
    if (geocodeData.features.length > 0) {
      const [lng, lat] = geocodeData.features[0].geometry.coordinates;
      leafletMap.setView([lat, lng], 14);
      L.marker([lat, lng], { icon: blackIcon })
        .addTo(leafletMap)
        .bindPopup(`Flood Risk: (data not available)`);
    }
  });

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

loadFloodData();

async function plotLocation(address, floodRisk) {
  const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}`;
  const response = await fetch(geocodeUrl);
  const data = await response.json();

  if (data.features.length > 0) {
    const [lng, lat] = data.features[0].geometry.coordinates;
    const riskColor = getRiskColor(floodRisk);
    L.circleMarker([lat, lng], {
      radius: 5,
      fillColor: riskColor,
      color: "#000",
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.5
    }).addTo(leafletMap)
      .bindPopup(`Flood Risk: ${floodRisk}`);
  }
}

function getRiskColor(risk) {
  if (risk >= 4) return "#FF0000";
  if (risk >= 2) return "#FFA500";
  return "#008000";
}

document.addEventListener("DOMContentLoaded", function () {
  // Observer for animating elements on scroll with a lower threshold
  const observerOptions = {
      threshold: 1.0
  };

  const animateObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              console.log("Animating element:", entry.target);
              entry.target.classList.add('animate');
              observer.unobserve(entry.target); // Animate only once per element
          }
      });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
      animateObserver.observe(el);
  });
});

// --- Bottom Buttons Event Listeners --- //
document.querySelector(".attribution").addEventListener("click", function() {
  window.location.href = "attribution.html"; 
});
document.querySelector("#home-button").addEventListener("click", function() {
  window.location.href = "../index.html"; 
});

// Download as PDF feature
document.getElementById("downloadBtn").addEventListener("click", function() {
  // Retrieve the latest address from the location display element
  let latestAddress = document.getElementById("location-display").textContent.trim();
  if (!latestAddress) {
    latestAddress = "Property_Report";
  }
  // Sanitize the address to remove any illegal filename characters
  latestAddress = latestAddress.replace(/[\/\\?%*:|"<>]/g, '-');

  // Choose the element to convert into PDF (adjust this if you want a specific section)
  const element = document.body; 
  const opt = {
    margin:       0.5,
    filename:     `${latestAddress}.pdf`,  // Auto-named based on address
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
});

document.getElementById("emailBtn").addEventListener("click", function() {
  // Choose the element to convert to PDF (adjust as needed)
  const element = document.body; // or document.getElementById("report-content")
  
  // PDF generation options
  const opt = {
    margin:       0.5,
    filename:     'Property_Report.pdf', // filename here can be updated later if desired
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // Generate PDF and get it as a data URI string
  html2pdf().set(opt).from(element).output('datauristring')
    .then(pdfDataUri => {
      // Prepare parameters for EmailJS. Make sure your email template expects an "attachment" variable.
      const templateParams = {
        subject: 'Your Property Report',
        message: 'Please find attached your property report.',
        attachment: pdfDataUri // This data URI (base64 encoded) will be used as an attachment.
      };

  // Replace with your actual Service ID and Template ID from your EmailJS dashboard
  emailjs.send('service_f86t12u', 'template_sdn5ufi', templateParams)
  .then(function(response) {
    alert('Email sent successfully!');
  }, function(error) {
    console.error('Failed to send email:', error);
    alert('Failed to send email.');
  });
})
.catch(error => {
console.error("Error generating PDF:", error);
alert("Error generating PDF.");
});
});