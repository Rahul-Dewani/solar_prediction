import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'; // Geocoder CSS
import 'leaflet-control-geocoder'; // Geocoder JS
import 'leaflet-geometryutil'; // Geometry utility for area calculation

const Calc = () => {
  const mapRef = useRef(null);
  const editableLayers = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMarker, setCurrentMarker] = useState(null);
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [areaCoords, setAreaCoords] = useState(null); // Store drawn area coordinates
  const [areaSize, setAreaSize] = useState(0); // Store area size
  const [markerCoords, setMarkerCoords] = useState(null); // Store the clicked marker coordinates
  const navigate = useNavigate(); 
  useEffect(() => {
    if (mapRef.current === null) {
      // Initialize the map with India as the center location
      const map = L.map('map').setView([20.5937, 78.9629], 5); // Coordinates for India
      mapRef.current = map;

      // Adding satellite tile layer
      L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
        {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 19, 
          minZoom: 3,  
        }
      ).addTo(map);

      editableLayers.current = new L.FeatureGroup();
      map.addLayer(editableLayers.current);

      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: editableLayers.current,
        },
      });
      
      map.addControl(drawControl);
      

      // Capture created event from the draw tools
      map.on(L.Draw.Event.CREATED, function (event) {
        const { layer } = event;
        editableLayers.current.addLayer(layer);
        const latLngs = layer.getLatLngs();

        setAreaCoords(latLngs); // Capture the area drawn

        // Calculate the area size
        const area = L.GeometryUtil.geodesicArea(latLngs[0]);
        setAreaSize(area); // Set area size in square meters
      });

      // Capture click event on the map to set a marker and display its coordinates
      map.on('click', function (e) {
        const { lat, lng } = e.latlng;

        if (currentMarker) {
          map.removeLayer(currentMarker);
        }

        const marker = L.marker([lat, lng]).addTo(map)
          .bindPopup(`<strong>Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}</strong>`)
          .openPopup();

        setCurrentMarker(marker); // Update the marker state
        setMarkerCoords({ lat, lng }); // Set marker coordinates
      });
    }

    return () => {
      if (mapRef.current !== null) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const searchLocation = () => {
    if (searchQuery) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&addressdetails=1&limit=1`)
        .then(response => response.json())
        .then(data => {
          if (data.length > 0) {
            const location = data[0];
            const lat = parseFloat(location.lat);
            const lon = parseFloat(location.lon);

            const map = mapRef.current;
            map.setView([lat, lon], 17); // Zoom into the searched location

            if (currentMarker) {
              map.removeLayer(currentMarker);
            }

            const marker = L.marker([lat, lon]).addTo(map)
              .bindPopup(`<strong>${location.display_name}</strong>`)
              .openPopup();

            setCurrentMarker(marker); // Update current marker state

            marker.on('click', function () {
              map.removeLayer(marker);
              setCurrentMarker(null); // Remove marker on click
            });
          } else {
            alert('Location not found. Please try a different search term.');
          }
        })
        .catch(err => console.error('Error fetching location:', err));
    } else {
      alert('Please enter a location.');
    }
  };

  const handleSubmit = () => {
    if (!areaCoords || !selectedPurpose || !markerCoords) {
      alert('Please draw an area, select a purpose, and search for a location.');
      return;
    }
  
    const requestData = {
      area: areaCoords[0].map(latLng => ({ lat: latLng.lat, lon: latLng.lng })),  // Lat/lon of the area
      marker: markerCoords,  // Lat/lon of the clicked marker
      category: selectedPurpose,  // Selected category (Industry, Agriculture, IT, Farming)
      areaSize: areaSize,  // Area size in square meters
    };
  
   
    fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          navigate('/results', { state: data });
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full">
        {/* Search bar */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-[1001] p-4 bg-white shadow-lg rounded-lg flex gap-4">
          <input
            type="text"
            placeholder="Enter city or address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded-lg w-64"
          />
          <button 
            onClick={searchLocation}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>

        {/* Map container */}
        <div id="map" className="h-screen w-full z-1"></div>
      </div>

      {/* Display area size and coordinates */}
      <div className="w-full max-w-xl mt-4 p-4 bg-white shadow-md rounded-lg">
        <h3 className="text-xl font-bold">Area Details</h3>
        {areaSize > 0 && (
          <>
            <p><strong>Area Size:</strong> {Math.round(areaSize)} m²</p>
            <p><strong>Coordinates:</strong></p>
            <ul className="list-disc pl-5">
              {areaCoords && areaCoords[0].map((coord, index) => (
                <li key={index}>{`Lat: ${coord.lat}, Lng: ${coord.lng}`}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Purpose selection and submit */}
      <div className="w-full max-w-xl mt-8 p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Select Purpose</h2>
        <select 
          value={selectedPurpose}
          onChange={(e) => setSelectedPurpose(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4"
        >
          <option value="">Select a purpose</option>
          <option value="Industry">Industry</option>
          <option value="Agriculture">Agriculture</option>
          <option value="IT">IT</option>
          <option value="Domestic">Domestic</option>
        </select>

        <button 
          onClick={handleSubmit}
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Calc;
