#Imports
from flask import Flask, render_template, jsonify
from service.getdata import fetch_charger_data
from dotenv import load_dotenv
import os

#load environment variables from .env file (e.g. MAPBOX_TOKEN)
load_dotenv()

#Initialize the app
app = Flask(__name__)

#Define a route
@app.route('/')
def home():
    mapbox_token = os.getenv("MAPBOX_TOKEN")
    return render_template('index.html', mapbox_token=mapbox_token)

#Telemetry data endpoint
@app.route('/api/chargers')
def getchargers():
    chargers = fetch_charger_data()
    return jsonify(chargers)

if __name__ == '__main__':  
    app.run(debug=True)