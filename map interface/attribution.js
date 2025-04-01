const mapboxToken = "pk.eyJ1IjoicXVpeWlsIiwiYSI6ImNsemoxNHlhMTBsa2UyaXByd3pvcjM4ZjgifQ.JTxA-uHyVmgrVrRoNJiAyA";

// Fallback defaults (in case the sheet fetch fails)
const defaultLat = 40.7128;
const defaultLng = -74.0060;
const defaultAddress = "Unknown Address";

// Create the map with fallback coordinates so that the map is available immediately
const nycBounds = [[40.4774, -74.2591], [40.9176, -73.7004]];
const map = L.map('map', {
  maxBounds: nycBounds,
  maxZoom: 18,
  minZoom: 10
}).setView([defaultLat, defaultLng], 14);

L.tileLayer('https://api.mapbox.com/styles/v1/quiyil/cm2m8fdnz001x01qj75tm3xod/tiles/{z}/{x}/{y}?access_token=' + mapboxToken, {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  tileSize: 512,
  zoomOffset: -1
}).addTo(map);

// Declare blackIcon (used for markers)
const blackIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});

// Fetch the latest address from your Google Sheet (via Google Apps Script)
fetch("https://script.google.com/macros/s/AKfycbwhTHTkZyDpBtv5Tss9KBSEldLUY9mDsHLZOmX5CWDbufchowmj4F5xDufOBqwMioNStQ/exec")
  .then(response => response.json())
  .then(data => {
    console.log("Google Sheet Data:", data);
    // Assume the latest entry is the last element in the returned array
    const latestEntry = data[data.length - 1] || {};
    const latestAddress = latestEntry.Location || defaultAddress;
    
    // Update the location display with the fetched address
    document.getElementById('location-display').innerHTML = `
      <div class="highlight" style="font-size: 15px">
        <span>${latestAddress}</span>
      </div>
    `;
    
    // Use Mapbox's geocoding API to get coordinates for the latest address
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(latestAddress)}.json?access_token=${mapboxToken}`;
    return fetch(geocodeUrl);
  })
  .then(response => response.json())
  .then(geocodeData => {
    if (geocodeData.features && geocodeData.features.length > 0) {
      // Get coordinates from the geocode result
      const [lng, lat] = geocodeData.features[0].geometry.coordinates;
      // Update the map view to center on the new coordinates
      map.setView([lat, lng], 14);
      // Add a marker for the latest address
      L.marker([lat, lng], { icon: blackIcon })
        .addTo(map)
        .bindPopup(`Flood Risk: (data not available)`);
    } else {
      console.warn("No geocode results for the latest address. Using fallback coordinates.");
    }
  })
  .catch(error => console.error("Error fetching or geocoding the latest address:", error));

document.addEventListener("DOMContentLoaded", function () {
    //building age
    fetch("../../buildingAge_data.geojson")
        .then(response => response.json())
        .then(buildingAgeData => {
            if (!buildingAgeData || !buildingAgeData.features) {
                throw new Error("Invalid GeoJSON format.");
            }

            const buildingAgeHeatmapData = buildingAgeData.features.map(feature => [
                feature.geometry.coordinates[1], // Latitude
                feature.geometry.coordinates[0], // Longitude
                feature.properties.intensity || 0.5 // Adjust intensity dynamically
            ]);

            const buildingAgeHeatmap = L.heatLayer(buildingAgeHeatmapData, {
                radius: 25,
                blur: 20,
                maxZoom: 17,
                minOpacity: 0.1, // Semi-transparent
                gradient: { 
                    0.1: "#800000",  // Dark Red
                    0.1: "#B22222",  // Firebrick
                    0.1: "#DC143C",  // Crimson
                    0.1: "#FF6347"   // Tomato
                }
            });

            const layer6Checkbox = document.getElementById("layer6");
            if (layer6Checkbox) {
                layer6Checkbox.addEventListener("change", function () {
                    if (this.checked) {
                        buildingAgeHeatmap.addTo(map);
                    } else {
                        map.removeLayer(buildingAgeHeatmap);
                    }
                });
            }
        })
        .catch(error => console.error("Failed to load Building Age GeoJSON:", error));

        // flood levels
        fetch("processed_geojson/floodLevels.geojson")
            .then(response => response.json())
            .then(floodData => {
                // Define a blue gradient for different flood zones
                const floodZoneColors = {
                    "VE": "#58A9F5", // Deep Blue for High-Risk Velocity Zones
                    "A": "#1E90FF",  // Dodger Blue for High-Risk Areas
                    "AE": "#00BFFF", // Light Blue for Base Flood Elevation Areas
                    "AO": "#87CEFA", // Sky Blue for Shallow Flooding
                    "X": "#ADD8E6",  // Pale Blue for Minimal Flood Risk
                    "default": "#B0C4DE" // Light Steel Blue for Unclassified Areas
                };

                // Create a flood levels layer with a blue gradient
                const floodLevelsLayer = L.geoJSON(floodData, {
                    style: function (feature) {
                        let zone = feature.properties.fld_zone || "default";
                        return {
                            color: floodZoneColors[zone] || floodZoneColors["default"],
                            weight: 1,
                            fillOpacity: 0.5
                        };
                    },
                    onEachFeature: function (feature, layer) {
                        let popupContent = `<b>Flood Zone:</b> ${feature.properties.fld_zone || "Unknown"} <br>
                                            <b>Grid Code:</b> ${feature.properties.gridcode} <br>
                                            <b>Static BFE:</b> ${feature.properties.static_bfe}`;
                        layer.bindPopup(popupContent);
                    }
                });

                // Get the "Flood Levels" checkbox
                const layer2Checkbox = document.getElementById("layer2");

                if (layer2Checkbox) {
                    layer2Checkbox.addEventListener("change", function () {
                        if (this.checked) {
                            floodLevelsLayer.addTo(map);
                        } else {
                            map.removeLayer(floodLevelsLayer);
                        }
                    });
                }
            })
            .catch(error => console.error("Failed to load Flood Levels GeoJSON:", error));

        // Flood Premium Cost
        Promise.all([
            fetch("processed_geojson/Modified Zip Code Tabulation Areas (MODZCTA).geojson").then(res => res.json()),
            fetch("processed_geojson/aggregated_zip_insurance.geojson").then(res => res.json())
        ])
        .then(([zipBoundaries, zipData]) => {
            console.log("Loaded ZIP Boundaries and Insurance Data");
        
            // Check ZIP code field name in zipBoundaries
            console.log("Zip Boundaries Sample:", zipBoundaries.features.slice(0, 5));
        
            // Convert ZIP Data into a lookup dictionary
            const zipInsuranceData = {};
            zipData.features.forEach(feature => {
                const zip = String(feature.properties.zip).padStart(5, "0"); // Ensure 5-digit format
                zipInsuranceData[zip] = {
                    avgBuildingCoverage: feature.properties.avgBuildingCoverage,
                    avgContentsCoverage: feature.properties.avgContentsCoverage,
                    avgPremium: feature.properties.avgPremium
                };
            });

            // city-wide average premium (update if needed)
            const cityAvgPremium = 1469.40;
            
            // Ensure we use the correct field name for ZIP codes
            function getZipCode(feature) {
                return String(
                    feature.properties.modzcta || // Use modzcta field
                    feature.properties.label || 
                    feature.properties.zcta || 
                    feature.properties.ZCTA5CE10 || 
                    feature.properties.ZIPCODE || 
                    feature.properties.postalcode
                ).padStart(5, "0");
            }
        
            function getPremiumColor(premium) {
                return premium > 3000 ? "#800026" :
                       premium > 2000 ? "#BD0026" :
                       premium > 1000 ? "#E31A1C" :
                       premium > 500  ? "#FC4E2A" :
                       premium > 250  ? "#FD8D3C" :
                       premium > 100  ? "#FEB24C" :
                                        "#FFEDA0";
            }
        
            const zipBoundaryLayer = L.geoJSON(zipBoundaries, {
                style: function (feature) {
                    const zip = getZipCode(feature);
                    const insuranceInfo = zipInsuranceData[zip];
        
                    if (!zip || zip === "00000") {
                        console.warn(`No valid ZIP code found for this feature:`, feature.properties);
                    }
                    if (!insuranceInfo) {
                        console.warn(`No insurance data for ZIP: ${zip}`);
                    }
        
                    return {
                        fillColor: insuranceInfo?.avgPremium ? getPremiumColor(insuranceInfo.avgPremium) : "#ccc",
                        weight: 1,
                        opacity: 0.8,
                        color: "#666",
                        fillOpacity: 0.6
                    };
                },
                onEachFeature: function (feature, layer) {
                    const zip = getZipCode(feature);
                    const insuranceInfo = zipInsuranceData[zip] || {};
                    const popupContent = `
                        <b>ZIP Code:</b> ${zip} <br>
                        <b>Avg Building Coverage:</b> $${insuranceInfo.avgBuildingCoverage?.toFixed(2) || "N/A"} <br>
                        <b>Avg Contents Coverage:</b> $${insuranceInfo.avgContentsCoverage?.toFixed(2) || "N/A"} <br>
                        <b>Avg Premium:</b> $${insuranceInfo.avgPremium?.toFixed(2) || "N/A"}
                    `;
                    layer.bindPopup(popupContent);
                }
            });
        
            const layer7Checkbox = document.getElementById("layer7");
        
            if (layer7Checkbox) {
                layer7Checkbox.addEventListener("change", function () {
                    const insuranceResultDiv = document.getElementById("insuranceResult"); // Ensure it is retrieved here
                    const resultsDiv = document.getElementById("results");
    
                    if (this.checked) {
                        console.log("Adding ZIP Boundary Layer...");
                        zipBoundaryLayer.addTo(map);
    
                        // Show insurance result div and add message
                        if (insuranceResultDiv) {
                            insuranceResultDiv.innerHTML = `Click on ZIP to view your cost <b>vs</b> the city average of <b>$${cityAvgPremium.toFixed(2)}</b>`;
                            resultsDiv.style.display = "block"; // Make sure the div is visible
                        }
                    } else {
                        console.log("Removing ZIP Boundary Layer...");
                        map.removeLayer(zipBoundaryLayer);
    
                        // Hide insurance result message
                        if (insuranceResultDiv) {
                            insuranceResultDiv.innerHTML = "";
                            resultsDiv.style.display = "none"; 
                        }
                    }
                });
            } else {
                console.error("Error: #layer7 checkbox not found.");
            }
        })
        .catch(error => console.error("Failed to load ZIP GeoJSON layers:", error));
        
    // Green Cover GeoJSON and create a heatmap
    fetch("processed_geojson/nyc_tree_census_100ksample.geojson")
        .then(response => response.json())
        .then(greenCoverData => {
            if (!greenCoverData || !greenCoverData.features) {
                throw new Error("Invalid GeoJSON format.");
            }

            const greenCoverHeatmapData = greenCoverData.features.map(feature => [
                feature.geometry.coordinates[1], // Latitude
                feature.geometry.coordinates[0], // Longitude
                1 // Intensity (Fixed for now)
            ]);

            const greenCoverHeatmap = L.heatLayer(greenCoverHeatmapData, {
                radius: 20,
                blur: 15,
                maxZoom: 17,
                minOpacity: 0.1, // Semi-transparent
                gradient: { 
                    0.1: "#006400",  // Dark Green
                    0.1: "#228B22",  // Forest Green
                    0.1: "#32CD32",  // Lime Green
                    0.1: "#ADFF2F"   // Green Yellow
                }
            });

            const layer5Checkbox = document.getElementById("layer5");
            if (layer5Checkbox) {
                layer5Checkbox.addEventListener("change", function () {
                    if (this.checked) {
                        greenCoverHeatmap.addTo(map);
                    } else {
                        map.removeLayer(greenCoverHeatmap);
                    }
                });
            }
        })
        .catch(error => console.error("❌ Failed to load Green Cover GeoJSON:", error));

    // 🔹 Load the Zoning GeoJSON
    fetch("processed_geojson/Primary Residential Zoning by lot.geojson")
        .then(response => response.json())
        .then(zoningData => {
            const zoneColors = {
                "R": "#008000",  // Green for Residential
                "C": "#FFD700",  // Gold for Commercial
                "M": "#DC143C",  // Red for Manufacturing
                "default": "#808080" // Gray for unknown
            };

            const zoningLayer = L.geoJSON(zoningData, {
                style: function (feature) {
                    let zoneType = feature.properties.zone || "default";
                    return {
                        color: zoneColors[zoneType] || zoneColors["default"],
                        weight: 1,
                        fillOpacity: 0.5
                    };
                },
                onEachFeature: function (feature, layer) {
                    let popupContent = `<b>Zoning Type:</b> ${feature.properties.zone || "Unknown"} <br>
                                        <b>ID:</b> ${feature.properties.id}`;
                    layer.bindPopup(popupContent);
                }
            });

            // Zoning Checkbox
            const layer4Checkbox = document.getElementById("layer4");
            if (layer4Checkbox) {
                layer4Checkbox.addEventListener("change", function () {
                    if (this.checked) {
                        zoningLayer.addTo(map);
                    } else {
                        map.removeLayer(zoningLayer);
                    }
                });
            }
        })
        .catch(error => console.error("❌ Failed to load Zoning GeoJSON:", error));

});

function redirectToAnswerPage() {
    window.location.href = 'report.html';
}