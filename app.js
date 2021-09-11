require('dotenv').config();
const express = require("express");
const https = require("https");
const ejs = require("ejs");

const app = express();

app.use(express.urlencoded({extended: true}));

app.get("/", function(req, res){

    res.sendFile(__dirname + "/index.html");

    
});

app.post("/", function(req, res){

    const query = req.body.cityName;
    const apiKey = process.env.APIKEY;
    const unit = "metric";
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=" + apiKey + "&units=" + unit;

    https.get(url, function(response){
        console.log(response.statusCode);

        response.on("data", function(data){
            const weatherData = JSON.parse(data);
            
            const temp = weatherData.main.temp;
            const desc = weatherData.weather[0].description;
            const ic = weatherData.weather[0].icon;
            const imageURL = "http://openweathermap.org/img/wn/" + ic + "@2x.png";

            res.write("<p>The weather is currently " + desc + "</p>" + "<br>");
            res.write("<h1>Temp in " + query + " is " + temp + "</h1>" + "<br>");
            res.write("<img src=" + imageURL + ">");
            res.send();


            //console.log(temp);
            //console.log(desc);



            //const object = {
                //name: "Reza",
                //major: "SWE",
                //age: 21,
            //}

            //console.log(weatherData);



            //console.log(JSON.stringify(object));
        });
    });
});













app.listen(process.env.PORT || 3000, function(){
    console.log("Server is running");
});