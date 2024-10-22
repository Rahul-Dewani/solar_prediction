import pickle
from joblib import load
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
from pytz import timezone

# Load the Random Forest model from the pickle file
with open('model.pkl', 'rb') as file:
    model = pickle.load(file)

openweatherapikey = '35bfcb7e538a5dd77b3f73e2eaf8f6a3'

# Flask App Initialization
app = Flask(__name__)
CORS(app)

# Convert square feet to square meters
def convert_area_to_sqm(area_in_fts):
    return area_in_fts * 0.092903

# Fetch real-time weather data from OpenWeather API
def get_weather_data(lat, lon, api_key):
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    response = requests.get(url)
    data = response.json()

    if response.status_code == 200:
        temp = data['main']['temp']
        humidity = data['main']['humidity']
        wind_dir = data['wind']['deg']
        wind_speed = data['wind']['speed']
        pressure = data['main']['pressure']

        # Get current time and convert to day of year
        now = datetime.now()
        day_of_year = now.timetuple().tm_yday
        time_of_day_s = 10 * 60 * 60  # Fixed time for 10:00 AM

        return {
            'Temperature': temp,
            'Humidity': humidity,
            'WindDirection': wind_dir,
            'WindSpeed': wind_speed,
            'Pressure': pressure,
            'DayOfYear': day_of_year,
            'TimeOfDay(s)': time_of_day_s
        }
    else:
        print(f"Failed to fetch weather data: {data}")  # Debugging info
        return None

# Prediction function
def predict_solar_energy(temp, humidity, wind_dir, wind_speed, day_of_year, time_of_day_s, pressure, area, panel_power_rating, avg_daily_sun_hours, derate_factor, cost_per_kWh, panel_cost, installation_cost):
    input_data = pd.DataFrame({
        'Temp in Celcius': [temp],
        'Humidity': [humidity],
        'WindDirection(Degrees)': [wind_dir],
        'Speed': [wind_speed],
        'Pressure': [pressure],
        'DayOfYear': [day_of_year],
        'TimeOfDay(s)': [time_of_day_s]
    })

    # Predict solar radiation (kWh/m²/day)
    solar_radiation = model.predict(input_data)[0]
    solar_density = solar_radiation / 24
    total_power_gen_capacity = solar_density * area
    num_solar_panels = total_power_gen_capacity / panel_power_rating
    daily_energy_production = total_power_gen_capacity * avg_daily_sun_hours * derate_factor
    annual_energy_production = daily_energy_production * 365
    annual_cost_savings = annual_energy_production * cost_per_kWh
    total_investment = (num_solar_panels * panel_cost) + installation_cost
    payback_period = total_investment / annual_cost_savings if annual_cost_savings > 0 else float('inf')

    return {
        'solar_radiation (kWh/m²/day)': solar_radiation,
        'solar_density (kWh/m²/hour)': solar_density,
        'total_power_gen_capacity (kW)': total_power_gen_capacity,
        'num_solar_panels': num_solar_panels,
        'daily_energy_production (kWh)': daily_energy_production,
        'annual_energy_production (kWh)': annual_energy_production,
        'annual_cost_savings': annual_cost_savings,
        'total_investment': total_investment,
        'payback_period (years)': payback_period
    }

# Get values based on the purpose
def get_values(purpose):
    purpose = purpose.strip().lower()  # Normalize input for consistency
    if purpose == "industry" or purpose == "agriculture":
        panel_power_rating = 0.3  # kW
        derate_factor = 0.8
        panel_cost = 18000  # ₹ per panel (polysrystalline panel cost in India)
        installation_cost = 50000  # ₹ (installation cost in India)
    elif purpose == "it" or purpose == "domestic":
        panel_power_rating = 0.35  # kW
        derate_factor = 0.85
        panel_cost = 25000  # ₹ per panel (monocrystalline panel cost in India)
        installation_cost = 60000  # ₹ (installation cost in India)
    else:
        raise ValueError("Invalid purpose")
    
    return panel_power_rating, derate_factor, panel_cost, installation_cost

# Flask route for prediction
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    # Fetch data from request payload
    area_in_fts = data.get('areaSize')
    marker_coords = data.get('marker')
    purpose = data.get('category')

    # Validate inputs
    if not area_in_fts or not isinstance(area_in_fts, (int, float)):
        return jsonify({'error': 'Invalid or missing area size'}), 400

    if not marker_coords or not isinstance(marker_coords, dict):
        return jsonify({'error': 'Invalid or missing marker coordinates'}), 400

    lat = marker_coords.get('lat')
    lon = marker_coords.get('lng')

    if lat is None or lon is None:
        return jsonify({'error': 'Invalid marker coordinates'}), 400

    if not purpose:
        return jsonify({'error': 'Missing purpose'}), 400

    # Fetch weather data
    weather_data = get_weather_data(lat, lon, openweatherapikey)

    if not weather_data:
        return jsonify({'error': 'Failed to fetch weather data'}), 500

    # Convert area to square meters (if needed)
    area = area_in_fts

    # Get purpose-specific values
    try:
        panel_power_rating, derate_factor, panel_cost, installation_cost = get_values(purpose)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    # Predict solar energy potential
    result = predict_solar_energy(
        weather_data['Temperature'], weather_data['Humidity'],
        weather_data['WindDirection'], weather_data['WindSpeed'],
        weather_data['DayOfYear'], weather_data['TimeOfDay(s)'],
        weather_data['Pressure'], area, panel_power_rating,
        5, derate_factor, 8, panel_cost, installation_cost
    )
    print(result)
    return jsonify(result)

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
