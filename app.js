require('dotenv').config();
const express = require("express");
const https = require("https");
const mongoose = require('mongoose');
const ejs = require("ejs");
const _ = require("lodash");

const request = require("request-promise");
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

var citySchema = new mongoose.Schema({
    name: String
});

var City = mongoose.model('City', citySchema);

// var london = new City({name : 'London'});
// var paris = new City({name : 'Paris'});
// var ny = new City({name : 'New York'});
// london.save()
// paris.save()
// ny.save()

async function getWeather(cities) {
    var weather_data = [];

    for (var city_obj of cities) {
        var query1 = city_obj.name;
        var apiKey1 = process.env.APIKEY;
        var url = `http://api.openweathermap.org/data/2.5/weather?q=${query1}&units=imperial&appid=${apiKey1}`;

        var response_body = await request(url);

        var weather_json = JSON.parse(response_body);

        var weather = {
            city : query1,
            temperature : Math.round(weather_json.main.temp),
            description : weather_json.weather[0].description,
        };

        weather_data.push(weather);
    }

    return weather_data;
}

app.get('/', function(req, res) {

    City.find({}, function(err, cities) {

        getWeather(cities).then(function(results) {

            

            var weather_data = {weather_data : results};

            res.render('list', weather_data);

        });

    });      

});


app.post("/paris", function(req, res){

    const query = req.body.cityName;
    const apiKey = process.env.APIKEY;
    const unit = "imperial";
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=" + apiKey + "&units=" + unit;

    https.get(url, function(response){
        console.log(response.statusCode);

        response.on("data", function(data){
            const weatherData = JSON.parse(data);
            
            const temp = weatherData.main.temp;
            // const time = weatherData.timezone;
            const feel = weatherData.main.feels_like;
            const tmin = weatherData.main.temp_min;
            const tmax = weatherData.main.temp_max;
            const hum = weatherData.main.humidity;
            const desc = weatherData.weather[0].description;
            const ic = weatherData.weather[0].icon;
            const mai = weatherData.weather[0].main;
            
            // new Date((weatherData.sys.sunrise + weatherData.timezone) * 1000)
            const imageURL = "http://openweathermap.org/img/wn/" + ic + "@2x.png";

            
            res.render("paris", {city: query, t: temp, fe: feel, tm: tmin, tma: tmax, hu: hum, des: desc, igu: imageURL, mm: mai});


        });
    });
});



app.listen(process.env.PORT || 3000, function(){
    console.log("Server is running");
});

