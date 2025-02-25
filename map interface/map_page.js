const mapboxToken = "pk.eyJ1IjoicXVpeWlsIiwiYSI6ImNsemoxNHlhMTBsa2UyaXByd3pvcjM4ZjgifQ.JTxA-uHyVmgrVrRoNJiAyA";

const blackIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
    iconSize: [25, 41], // Default Leaflet marker size
    iconAnchor: [12, 41], // Position relative to its location
    popupAnchor: [1, -34], // Position where the popup opens
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41], // Default Leaflet shadow size
    shadowAnchor: [12, 41]
});

// NYC extent bounds
const nycBounds = [[40.4774, -74.2591], [40.9176, -73.7004]];

// Initialize the map
const map = L.map('map', {
    maxBounds: nycBounds,
    maxZoom: 18,
    minZoom: 11
}).setView([40.7128, -74.0060], 12);

// Add Mapbox tile layer
L.tileLayer('https://api.mapbox.com/styles/v1/quiyil/cm2m8fdnz001x01qj75tm3xod/tiles/{z}/{x}/{y}?access_token=' + mapboxToken, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);

document.getElementById('search').addEventListener('click', () => {
    const address = document.getElementById('address').value.trim();

    if (!address) {
        alert('Please enter an address.');
        return;
    }

    // Call the async function to handle the geocoding request
    searchAddress(address);
});

// Async function for geocoding
async function searchAddress(address) {
    try {
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}`
        );
        const data = await response.json();

        if (!data.features || data.features.length === 0) {
            alert('Address not found.');
            return;
        }

        // Extract coordinates and address
        const [lng, lat] = data.features[0].geometry.coordinates;
        const placeName = data.features[0].place_name;

        // Create a button for the popup
        const popupContent = `
            <div>
                <p><strong>Address:</strong> ${placeName}</p>
                <p><strong>Coordinates:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
                <button onclick="selectLocation(${lat}, ${lng}, '${placeName}')">Select this location</button>
            </div>
        `;

        // Use the custom black marker icon
        L.marker([lat, lng], { icon: blackIcon }).addTo(map).bindPopup(popupContent).openPopup();
        map.setView([lat, lng], 14);
    } catch (error) {
        console.error('Error with geocoding request:', error);
        alert('Failed to search for address.');
    }
}

// Function to handle location selection
function selectLocation(lat, lng, address) {
    const url = `attribution.html?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`;
    window.location.href = url;
}

// Add a pin when clicking on the map
map.on('click', async (e) => {
    const { lat, lng } = e.latlng;

    try {
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`
        );
        const data = await response.json();
        const placeName = data.features[0]?.place_name || 'Unknown Location';

        // Create a button for the popup
        const popupContent = `
            <div>
                <p><strong>Address:</strong> ${placeName}</p>
                <p><strong>Coordinates:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
                <button onclick="selectLocation(${lat}, ${lng}, '${placeName}')">Select this location</button>
            </div>
        `;

        // Use the custom black marker icon
        L.marker([lat, lng], { icon: blackIcon }).addTo(map).bindPopup(popupContent).openPopup();
    } catch (error) {
        console.error('Error fetching reverse geocode:', error);
    }
});

// Restrict dragging out of bounds
map.on('drag', () => {
    map.panInsideBounds(nycBounds, { animate: false });
});
