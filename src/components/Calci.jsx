import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import axios from 'axios';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// Custom Search Component for Geocoding and Address Sync
const SearchControl = ({ setPosition }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: true,
      showPopup: true,
      autoClose: true,
      retainZoomLevel: false,
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (e) => {
      const { x, y } = e.location;
      setPosition([y, x]); // Update map position state
    });

    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
};

const Calci = () => {
  const [area, setArea] = useState(''); // To store calculated area
  const [address, setAddress] = useState(''); // User input address
  const [selectedCategory, setSelectedCategory] = useState(''); // Category selected
  const [position, setPosition] = useState([20, 78]); // Default map position for India
  const navigate = useNavigate();

  const isCalculateDisabled = !area || !address || !selectedCategory;

  // Function to handle address search
  const handleAddressSearch = () => {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}&addressdetails=1&limit=1`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const location = data[0];
          const lat = parseFloat(location.lat);
          const lon = parseFloat(location.lon);
          setPosition([lat, lon]); // Update map position
        } else {
          alert('Location not found. Please try a different search term.');
        }
      })
      .catch((err) => console.error('Error fetching location:', err));
  };

  // Function to get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setPosition([lat, lon]);
        },
        () => alert('Unable to retrieve your location.'),
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Handle when user finishes drawing the polygon
  const handleDrawCreated = (e) => {
    const layer = e.layer;
    const areaSqMeters = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
    setArea(areaSqMeters.toFixed(2)); // Update the area state
  };

  // Handle category button click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category); // Update the selected category
  };

  // Handle calculation button click
  const handleCalculateClick = () => {
    const data = { area: parseFloat(area), address, category: selectedCategory };
    axios
      .post('http://127.0.0.1:5000/calculate', data)
      .then((response) => {
        navigate('/result', {
          state: { potential: response.data.potential, area, address, category: selectedCategory },
        });
      })
      .catch((error) => console.error('There was an error calculating the potential!', error));
  };

  return (
    <div id="calculator-section" className="flex h-screen bg-gradient-to-r from-blue-700 to-purple-800">
      {/* Left Panel: Map */}
      <div className="w-1/2 h-full shadow-lg">
        <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
          {/* Base Map Layer */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Custom Search Control for Address Search */}
          <SearchControl setPosition={setPosition} />

          {/* Drawing Layer */}
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={handleDrawCreated}
              draw={{
                rectangle: false,
                polyline: false,
                circle: false,
                marker: false,
                circlemarker: false,
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>

      {/* Right Panel: Input Form */}
      <div className="w-1/2 p-10 bg-white bg-opacity-90 flex flex-col justify-center items-center rounded-lg shadow-xl">
        <h1 className="font-semibold text-4xl text-blue-700 mb-6 animate-fadeIn">Solar Calculator</h1>
        <div className="flex flex-col gap-4 animate-slideUp">
          {/* Address Search */}
          <input
            className="p-3 w-full text-black rounded-md border-2 border-blue-500 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            type="text"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-300 transform hover:scale-105" onClick={handleAddressSearch}>
              Search
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-300 transform hover:scale-105" onClick={getCurrentLocation}>
              Use Current Location
            </button>
          </div>

          {/* Calculated Area Display */}
          {area && <p className="text-green-600 mt-4">Traced Area: {area} m²</p>}

          {/* Category Selection */}
          <p className="text-xl text-gray-800 mt-4">Please Select Your Consumer Category:</p>
          <div className="flex gap-2 mt-2">
            {['Industry', 'Agriculture', 'IT', 'Domestic'].map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded text-lg transition duration-300 transform hover:scale-105 ${selectedCategory === category ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-black border border-gray-300 hover:bg-gray-100'}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Calculate Button */}
          <button
            className={`text-white text-xl px-8 py-3 rounded mt-8 transform hover:scale-105 transition duration-300 ${
              isCalculateDisabled ? 'bg-red-900 cursor-not-allowed' : 'bg-red-700 hover:bg-red-600'
            }`}
            onClick={handleCalculateClick}
            disabled={isCalculateDisabled}
          >
            Calculate
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calci;
