

const displayMap = locations => {
  // Create the map and attach it to the #map
  const map = L.map('map', {
    zoomControl: false,
    dragging: false, // Disable dragging the map
    touchZoom: false, // Disable zooming on touch devices
    doubleClickZoom: false, // Disable zooming on double click
    boxZoom: false, // Disable zooming with a box selection
  });

  // Add a tile layer to add to our map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Create icon using the image provided by Jonas
  const greenIcon = L.icon({
    iconUrl: '/img/pin.png',
    iconSize: [32, 40], // size of the icon
    iconAnchor: [16, 40], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -50], // point from which the popup should open relative to the iconAnchor
  });

  // Add locations to the map
  if (locations.length === 0) {
    console.error('No locations provided');
    return;
  }

  const points = locations.map(loc => [loc.coordinates[1], loc.coordinates[0]]);

  points.forEach((point, index) => {
    L.marker(point, { icon: greenIcon })
      .addTo(map)
      .bindPopup(`<p>Day ${locations[index].day}: ${locations[index].description}</p>`, {
        autoClose: false,
        className: 'mapPopup',
      })
      .openPopup();
  });

  // Set map bounds to include all points
  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);

  // Disable scroll on map
  map.scrollWheelZoom.disable();
};

export default displayMap;
