(function(){
	
	var API_WORLDTIME_KEY = "d6a4075ceb419113c64885d9086d5"; 
	var API_WEATHER_KEY = '5b729a04ded84f97a23636896ffd7c28';
	var API_WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather?APIID=' + API_WEATHER_KEY + '&';
	var IMG_WEAHTER = 'http://openweathermap.org/img/w/';
	var API_WORLDTIME = "htpps://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key=" + API_WORLDTIME_KEY + "&";

	var today = new Date();
	var timenow = today.toLocaleTimeString();

	var $body = $("body");
	var $loader = $(".loader");
	var nombreNuevaCiudad =$("[data-input='cityAdd']");
	var buttonAdd = $("[data-input='add']");
	var buttonLoad = $("[data-saved-cities]");

	var cities = [];
	var cityWeather = {};
	cityWeather.zone;
	cityWeather.icon;
	cityWeather.temp;
	cityWeather.temp_max;
	cityWeather.temp_min;
	cityWeather.main;

	$( buttonAdd ).on("click", addNewCity);
	$( nombreNuevaCiudad ).on("keypress", function(event){
		if(event.which == 13){
			addNewCity(event);
		}
	})

	$(buttonLoad).on("click", loadSavedCities);

	if(navigator.geolocation)	
	{
		navigator.geolocation.getCurrentPosition(getCoords, errorFound);
	}
	else
	{
		alert('actualiza tu navegador')
	}

	function errorFound(error)
	{
		alert('un error ocurrio:' + error.code)
	};

	function getCoords(position)
	{
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;

		/*console.log('Tu posicion es: ' + lat + "," + lon);
		API_WEATHER_URL = API_WEATHER_URL + "lat=" + lat + "&lon=" + lon;*/
		
		$.getJSON(API_WEATHER_URL + "lat=" + lat + "&lon=" + lon, getCurrentWeather);
	};

	function getCurrentWeather(data){
		
		cityWeather.zone = data.name;
		cityWeather.icon = IMG_WEAHTER + data.weather[0].icon + '.png';
		cityWeather.temp = data.main.temp - 273.15;
		cityWeather.temp_max = data.main.temp_max - 273.15;
		cityWeather.temp_min = data.main.temp_min- 273.15;
		cityWeather.main = data.weather[0].main;

		renderTemplate(cityWeather);
	};

	function activateTemplate(id){
		var t = document.querySelector(id);
		return document.importNode(t.content, true);
	};

	function renderTemplate(cityweather, localtime){
		var clone = activateTemplate("#template--city");
		var timeToShow;

		if(localtime){
			timeToShow = localtime;
		}
		else{
			timeToShow = timenow;
		}



		clone.querySelector("[data-time]").innerHTML = timeToShow;
		clone.querySelector("[data-city]").innerHTML = cityWeather.zone;
		clone.querySelector("[data-icon]").src = cityWeather.icon;
		clone.querySelector("[data-temp='max']").innerHTML = cityWeather.temp_max.toFixed(1);
		clone.querySelector("[data-temp='min']").innerHTML = cityWeather.temp_min.toFixed(1);
		clone.querySelector("[data-temp='current']").innerHTML = cityWeather.temp.toFixed(1);

		$( $loader ).hide();
		$( $body ).append(clone);
	};

	function addNewCity(event){
		event.preventDefault(); //anula la funcionalidad default del evento 
		$.getJSON(API_WEATHER_URL + "q=" + $( nombreNuevaCiudad ).val(), getWeatherNewCity);
	};

	function getWeatherNewCity(data){
		//console.log(data);
		$.getJSON(API_WORLDTIME + $(nombreNuevaCiudad).val(), function(response){

			$(nombreNuevaCiudad).val("");			
			cityWeather = {};
			cityWeather.zone = data.name;
			cityWeather.icon = IMG_WEAHTER + data.weather[0].icon + '.png';
			cityWeather.temp = data.main.temp - 273.15;
			cityWeather.temp_max = data.main.temp_max - 273.15;
			cityWeather.temp_min = data.main.temp_min- 273.15;
			cityWeather.main = data.weather[0].main;


			renderTemplate(cityWeather, response.data.time_zone[0].localtime);

			cities.push(cityweather);
			localStorage.setItem("cities", JSON.stringfy(cities))
		});

		
	}

	function loadSavedCities(event){
		event.preventDefault();

		function renderCities(cities){
			cities.forEach(function(city){
				renderTemplate(city);
			});
		};

		var cities = JSON.parse(localStorage.getItem("cities"));

		renderCities(cities);
	}

})();