// --- CONFIGURATION ---
const mapboxToken = "pk.eyJ1IjoicXVpeWlsIiwiYSI6ImNsemoxNHlhMTBsa2UyaXByd3pvcjM4ZjgifQ.JTxA-uHyVmgrVrRoNJiAyA";
const proxyURL       = "http://127.0.0.1:8080/";
const googleScriptURL = "https://script.google.com/macros/s/AKfycbwhTHTkZyDpBtv5Tss9KBSEldLUY9mDsHLZOmX5CWDbufchowmj4F5xDufOBqwMioNStQ/exec";
const scriptURL      = proxyURL + googleScriptURL;

// Fallback coordinates via URL params
const urlParams     = new URLSearchParams(window.location.search);
const fallbackLat   = parseFloat(urlParams.get('lat')) || 40.7128;
const fallbackLng   = parseFloat(urlParams.get('lng')) || -74.0060;
const fallbackAddress = urlParams.get('address') || 'Unknown Address';

// --- MAP SETUP ---
const nycBounds = [[40.4774, -74.2591], [40.9176, -73.7004]];
const leafletMap = L.map('floodMap', {
  maxBounds: nycBounds,
  maxZoom: 18,
  minZoom: 10
}).setView([fallbackLat, fallbackLng], 14);

L.tileLayer(
  `https://api.mapbox.com/styles/v1/quiyil/cm2m8fdnz001x01qj75tm3xod/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
  {
    attribution:
      'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1
  }
).addTo(leafletMap);

const blackIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});

/// --- Legend ---

const legend = L.control({ position: 'topright' });

legend.onAdd = function(map) {
  const div = L.DomUtil.create('div', 'info legend');
  const grades = ['Low (< 2)', 'Medium (2–3)', 'High (≥ 4)'];
  const colors = ['#008000', '#FFA500', '#FF0000'];

  div.innerHTML += '<h4>Perceived Risk</h4>';
  for (let i = 0; i < grades.length; i++) {
    div.innerHTML +=
      `<i style="
         background:${colors[i]};
         width:18px;
         height:18px;
         display:inline-block;
         margin-right:8px;
         vertical-align:middle;
       "></i>` +
      `<span style="vertical-align:middle">${grades[i]}</span><br>`;
  }
  return div;
};

legend.addTo(leafletMap);

// --- ERROR POPUP ---
function showErrorPopup(message) {
  alert(message);
}

// --- DRAW ONE LATEST MARKER ---
function loadLatestEntry() {
  fetch(scriptURL, {
    method: "GET",
    headers: { "Origin": window.location.origin }
  })
    .then(res => {
      console.log("Latest fetch status:", res.status, res.statusText);
      // dump the first 200 chars if it's not JSON
      return res.text().then(text => {
        // if it looks like HTML, log it
        if (!res.ok || text.trim().startsWith("<")) {
          console.error("Latest raw response (truncated):", text.slice(0, 200));
          throw new Error(`Bad response: ${res.status}`);
        }
        // otherwise parse JSON
        return JSON.parse(text);
      });
    })
    .then(data => {
      console.log("LatestEntry JSON:", data);
      if (!Array.isArray(data) || data.length === 0) {
        showErrorPopup("No entries found.");
        return;
      }
      const latest = data[data.length - 1];
      const address = latest.Location;
      document.getElementById("location-display").innerHTML =
        `<div class="highlight_text" style="font-size:15px">` +
        `<span>${address}</span></div>`;

      // now geocode it
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
                         `${encodeURIComponent(address)}.json?access_token=${mapboxToken}`;
      return fetch(geocodeUrl);
    })
    .then(geoRes => {
      if (!geoRes) return; // in case we threw above
      if (!geoRes.ok) throw new Error(`Geo error ${geoRes.status}`);
      return geoRes.json();
    })
    .then(geoData => {
      if (!geoData || !geoData.features || geoData.features.length === 0) return;
      const [lng, lat] = geoData.features[0].geometry.coordinates;
      leafletMap.setView([lat, lng], 14);
      L.marker([lat, lng], { icon: blackIcon })
       .addTo(leafletMap)
       .bindPopup(`Flood Risk: (latest)`);
    })
    .catch(err => {
      console.error("loadLatestEntry error:", err);
      showErrorPopup("Failed to load latest location.");
    });
}

// --- DRAW ALL RISK POINTS ---
function getRiskColor(risk) {
  if (Number(risk) >= 4) return "#FF0000";
  if (Number(risk) >= 2) return "#FFA500";
  return "#008000";
}

async function plotLocation(address, floodRisk) {
  try {
    const geoRes = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
      `${encodeURIComponent(address)}.json?access_token=${mapboxToken}`
    );
    const geo = await geoRes.json();
    if (geo.features.length === 0) return;

    const [lng, lat] = geo.features[0].geometry.coordinates;
    L.circleMarker([lat, lng], {
      radius: 5,
      fillColor: getRiskColor(floodRisk),
      color: "#000",
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.5
    })
      .addTo(leafletMap)
      .bindPopup(`Flood Risk: ${floodRisk}`);
  } catch (e) {
    console.error("plotLocation error:", e);
  }
}

function handleFloodData(data) {
  if (!data || data.length === 0) {
    showErrorPopup("No flood risk data available.");
    return;
  }
  data.forEach(loc => {
    plotLocation(loc.Location, loc["Flood Risk"]);
  });
}

function loadFloodData() {
  fetch(scriptURL, {
    headers: { Origin: window.location.origin }
  })
    .then(res => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    })
    .then(handleFloodData)
    .catch(err => {
      console.error("Flood data error:", err);
      showErrorPopup("Failed to load flood risk data.");
    });
}

// --- INITIALIZE EVERYTHING ---
loadLatestEntry();
loadFloodData();

// --- REST OF YOUR UI HOOKUPS ---

// Scroll-animation observer
document.addEventListener("DOMContentLoaded", () => {
  const animateObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 1.0 }
  );
  document
    .querySelectorAll(".animate-on-scroll")
    .forEach(el => animateObserver.observe(el));
});

// tabs
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    // activate tab button
    document.querySelector('.tabs button.active').classList.remove('active');
    btn.classList.add('active');
    // show associated pane
    const id = btn.dataset.tab;
    document.querySelector('.tab-content.active').classList.remove('active');
    document.getElementById(id).classList.add('active');
  });
});

// Bottom buttons
document.querySelector(".attribution")
  .addEventListener("click", () => window.location.href = "attribution.html");
document.querySelector("#home-button")
  .addEventListener("click", () => window.location.href = "../index.html");

// PDF download and EmailJS (unchanged)
const downloadBtn = document.getElementById("downloadBtn");
if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    let latestAddress = document
      .getElementById("location-display")
      .textContent.trim() || "Property_Report";
    latestAddress = latestAddress.replace(/[\/\\?%*:|"<>]/g, "-");
    const opt = {
      margin: 0.5,
      filename: `${latestAddress}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    };
    html2pdf().set(opt).from(document.body).save();
  });
}

const emailBtn = document.getElementById("emailBtn");
if (emailBtn) {
  emailBtn.addEventListener("click", () => {
    html2pdf()
      .set({
        margin: 0.5,
        filename: "Property_Report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
      })
      .output("datauristring")
      .then(pdfDataUri => {
        const templateParams = {
          subject: "Your Property Report",
          message: "Please find attached your property report.",
          attachment: pdfDataUri
        };
        emailjs.send("service_f86t12u", "template_sdn5ufi", templateParams)
          .then(() => alert("Email sent successfully!"))
          .catch(e => {
            console.error("EmailJS error:", e);
            alert("Failed to send email.");
          });
      })
      .catch(e => {
        console.error("PDF gen error:", e);
        alert("Error generating PDF.");
      });
  });
}