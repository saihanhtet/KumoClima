document.addEventListener("DOMContentLoaded", () => {
  const cityInput = document.getElementById("city");
  const promptList = document.querySelector(".prompt-box");
  const container = document.querySelector(".cardContainer");
  const image = document.getElementById("image0");
  const content = document.querySelector(".container");
  const downloadBtn = document.getElementById("downloadBtn");

  cityInput.addEventListener("input", async (event) => {
    const userInput = event.target.value.trim().toLowerCase();
    var flag = false;
    content.classList.add("justify-content-start");
    // Fetch the CSV file (replace 'world-cities.csv' with your file path)
    const response = await fetch("static/world-cities.csv");
    const csvData = await response.text();

    // Parse the CSV data
    const rows = csvData.split("\n").map((row) => row.trim());
    const headers = rows[0].split(",").map((header) => header.trim());

    // Convert CSV data to an array of objects
    const cities = rows.slice(1).map((row) => {
      const values = row.split(",").map((value) => value.trim());
      const city = {};
      headers.forEach((header, index) => {
        city[header] = values[index];
      });
      return city;
    });
    // Get city names from the array of objects
    const cityNames = cities.map((city) => city.name || "");
    const countryNames = cities.map((city) => city.country || "");
    const allNames = [...new Set(cityNames.concat(countryNames))];
    const filteredSuggestions = allNames
      .filter((name) => name.toLowerCase().includes(userInput.toLowerCase()))
      .slice(0, 5); // Limit to the first 5 matches

    promptList.innerHTML = ""; // Clear previous suggestions
    filteredSuggestions.forEach((suggestion) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.setAttribute("class", "btn w-100");
      a.textContent = suggestion;
      a.addEventListener("click", () => {
        cityInput.value = suggestion;
        getWeather();
        promptList.classList.add("hidden");
        flag = true;
      });
      li.appendChild(a);
      promptList.appendChild(li);
    });

    // Show or hide the prompt list based on user input
    if (userInput.length == 0) {
      content.classList.remove("justify-content-start");
    }
    if (
      filteredSuggestions.length > 0 &&
      userInput.length > 0 &&
      flag == false
    ) {
      promptList.classList.remove("hidden");
      container.classList.add("hidden");
    } else {
      promptList.classList.add("hidden");
      container.classList.add("hidden");
    }
  });

  downloadBtn.addEventListener("click", async () => {
    try {
      const city = document.getElementById("city").value.trim();
      const response = await fetch("/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city: city }),
      });

      const data = await response.json();
      const jsonData = JSON.stringify(data);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "weather_data.json";
      a.style.display = "none";

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading weather data:", error);
    }
  });

  async function getWeather() {
    promptList.classList.add("hidden");
    const city = document.getElementById("city").value.trim();
    const cityName = document.querySelector(".city");
    const weather = document.querySelector(".weather");
    const temp = document.querySelector(".temp");
    const tempmin = document.querySelector(".minTemp");
    const tempmax = document.querySelector(".maxTemp");
    try {
      const response = await fetch("/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city: city }),
      });

      const data = await response.json();
      cityName.innerHTML = data.location.country;
      weather.innerHTML = data.current.condition.text;
      temp.innerHTML = data.forecast.forecastday[0].day.avgtemp_c + "°";
      tempmin.innerHTML = data.forecast.forecastday[0].day.mintemp_c + "°";
      tempmax.innerHTML = data.forecast.forecastday[0].day.maxtemp_c + "°";
      image.setAttribute("href", data.current.condition.icon);
      container.classList.remove("hidden");
      content.classList.remove("justify-content-start");
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }

  function handleEnter(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      getWeather();
      promptList.classList.add("hidden");
    }
  }

  cityInput.addEventListener("keydown", handleEnter);
});
