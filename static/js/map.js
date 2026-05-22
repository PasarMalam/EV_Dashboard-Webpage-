mapboxgl.accessToken = window.MAPBOX_TOKEN;

//Singapore overview map settings
const overviewMap = {
    center: [103.8198, 1.3521],
    zoom: 11.5,
    pitch: 45,
    bearing: -10, 
}

const openedPopup = new Set();

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/standard",
    center: overviewMap.center,
    zoom: overviewMap.zoom,
    pitch: overviewMap.pitch,
    bearing: overviewMap.bearing,
    config: {
        antialias: true,
        lightPreseet: "night",
        showPointOfIntrestLabels: true
    }

});

// Add navigation controls to the map (zoom and rotation)   
map.addControl(new mapboxgl.NavigationControl());

// Fetch charger data from the backend API
async function loadChargers() { 
    try 
    {
        const response = await fetch('/api/chargers');
        const data = await response.json();
        
        updateSummaryCards(data);

        data.forEach(charger => {addChargerMarker(charger)});
    } 
    catch (error) 
    {
        console.error('Error fetching charger data:', error);
    }
}

// Update the summary cards with the latest charger data
function updateSummaryCards(chargers) {
    const totalChargers = chargers.length;

    const availableChargers = chargers.filter(charger => {
        return charger.status === "Available";
    }).length;

    const chargingChargers = chargers.filter(charger => {
        return charger.status === "Charging";
    }).length;

    const faultChargers = chargers.filter(charger => {
        return charger.status === "Faulty";
    }).length;

    const totalPower = chargers.reduce((total, charger) => {
        return total + charger.power_kw;
    }, 0);

    document.getElementById("total-chargers").textContent = totalChargers;
    document.getElementById("available-chargers").textContent = availableChargers;
    document.getElementById("charging-chargers").textContent = chargingChargers;
    document.getElementById("fault-chargers").textContent = faultChargers;
    document.getElementById("total-power").textContent = totalPower.toFixed(1) + " kW";
}

function getMarkerColor(status) {
    const statusColors = {
        available: "#22c55e", // Green
        charging: "#f59e0b", // Orange  
        faulty: "#ef4444", // Red
    };
    return statusColors[status.toLowerCase()] || "#64748b"; // Default to gray if status is unknown
}

function addChargerMarker(charger) {
    // Create a popup with charger details
    const popup = new mapboxgl.Popup({
        offset: 35,
        closeOnClick: false
    }).setHTML(`
        <div class="popup-content"> 
            <h3>${charger.name}</h3>
            <p><strong>ID:</strong> ${charger.charger_id}</p>
            <p><strong>Status:</strong> ${charger.status}</p>
            <p><strong>Power:</strong> ${charger.power_kw} kW</p>
            <p><strong>Alert:</strong> ${charger.alert}</p>
            <p><strong>Last Updated:</strong> ${charger.last_updated}</p>
        </div>
    `);
    
    // Create a marker with color based on charger status
    const marker = new mapboxgl.Marker({
        color: getMarkerColor(charger.status),
        scale: 1.5
    })
        .setLngLat([charger.lng, charger.lat])
        .setPopup(popup)
        .addTo(map);

    // zoom in to the charger location when the popup is opened, and zoom back out when closed
    popup.on("open", function() {
        openedPopup.add(popup);
        map.flyTo({
            center: [charger.lng, charger.lat],
            zoom: 18,
            pitch: 0,
            bearing: 0,
            duration: 1200
        });
    });

    popup.on("close", function() {
        openedPopup.delete(popup);

        if (openedPopup.size === 0) {
            map.flyTo({
                center: overviewMap.center,
                zoom: overviewMap.zoom,
                pitch: overviewMap.pitch,
                bearing: overviewMap.bearing,
                duration: 1200
            });
        }
    });
}

loadChargers();