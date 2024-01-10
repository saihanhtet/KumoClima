from flask import flash
import os
from flask import Flask, render_template, request, jsonify
import requests
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_KEY')


@app.route("/", methods=['POST', 'GET'])
def home():
    return render_template("index.html")


@app.route('/weather', methods=['POST'])
def get_weather():
    city = request.json['city']
    api_key = os.getenv('API_KEY')
    weather_api_url = f"https://api.weatherapi.com/v1/forecast.json?key={api_key}&q={city}&days=1&aqi=no&alerts=yes"
    response = requests.get(weather_api_url)
    return jsonify(response.json())


if __name__ == "__main__":
    app.run(debug=False)
