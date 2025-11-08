const L = window.L; 

let map = null;
let currentMarker = null;

export function createMap(containerId, options = {}) {
  const defaultOptions = {
    center: [-6.175392, 106.827153], 
    zoom: 12,
    zoomControl: false
  };

  const mapOptions = { ...defaultOptions, ...options };

  if (!map) {
    map = L.map(containerId, mapOptions).setView(mapOptions.center, mapOptions.zoom);

    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', function(e) {
      setMarker(e.latlng.lat, e.latlng.lng);
    });
  }

  return map;
}

export function setMarker(latitude, longitude, onDragEnd) {
  if (currentMarker) {
    map.removeLayer(currentMarker);
  }

  currentMarker = L.marker([latitude, longitude], {
    draggable: true,
    autoPan: true
  }).addTo(map);

  currentMarker.on('dragend', function(event) {
    const marker = event.target;
    const position = marker.getLatLng();
    if (onDragEnd && typeof onDragEnd === 'function') {
      onDragEnd(position.lat, position.lng);
    }
  });

  return currentMarker;
}

export function addMarkers(map, reports) {
  if (!map) return;

  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  reports.forEach(report => {
    if (report.latitude && report.longitude) {
      const marker = L.marker([report.latitude, report.longitude])
        .bindPopup(`
          <strong>${report.title}</strong><br>
          ${report.description.substring(0, 100)}...
          <br><br>
          <a href="#/reports/${report.id}">Lihat Detail</a>
        `);
      marker.addTo(map);
    }
  });

  const markers = [];
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      markers.push(layer.getLatLng());
    }
  });

  if (markers.length > 0) {
    map.fitBounds(L.latLngBounds(markers), { padding: [50, 50] });
  }
}

export function createSingleMarker(map, latitude, longitude, popupContent) {
  if (!map || !latitude || !longitude) return;

  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  const marker = L.marker([latitude, longitude]);
  if (popupContent) {
    marker.bindPopup(popupContent);
  }
  marker.addTo(map);

  map.setView([latitude, longitude], 15);
  
  return marker;
}