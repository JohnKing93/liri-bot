// require modules
require("dotenv").config();
var keys =  require('./keys.js');
var request = require("request");
var fs = require("fs");
var Spotify = require('node-spotify-api');
var moment = require('moment');

// get keys
var bandsInTown = keys.bandsInTown.key;
var spotify = new Spotify(keys.spotify);
var omdb = keys.omdb.key;

// handle cli inputs
var command = process.argv[2];
var query = process.argv.slice(3).join(" ");

// read inputs
function run(command) {
    switch (command) {
        case "concert-this":
            concertThis(query);
            break;
        case "spotify-this-song":
            spotifyThisSong(query);
            break;
        case "movie-this":
            movieThis(query);
            break;
        case "do-what-it-says":
            doWhatItSays();
            break;
    }
}

// request functions
function concertThis(query) {
    var parseConcertQuery = query.split(' ').join('+');
    var concertRequestURL = "https://rest.bandsintown.com/artists/" + parseConcertQuery + "/events?app_id=" + bandsInTown;
    request(concertRequestURL, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var returnedConcert = JSON.parse(body);
            for (var x = 0; x < returnedConcert.length; x++) {
                console.log(
                    "\nVenue: " + returnedConcert[x].venue.name +
                    "\nLocation: " + returnedConcert[x].venue.city + ", " + returnedConcert[x].venue.country +
                    "\nDate/Time: " + moment(returnedConcert[x].datetime).format("MM-DD-YYYY h:mm A") +
                    "\n----------------------------------------"
                );
            }
        } else {
            return console.error("Error occurred: " + error)
        }
    });
}

function spotifyThisSong(query) {
    spotify.search({ type: 'track', query: query }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        } else {
            var returnedSong = data.tracks.items[0];
            console.log(
            "\nArtist: " + returnedSong.artists[0].name +
            "\nSong: " + returnedSong.name +
            "\nLink: " + returnedSong.external_urls.spotify +
            "\nAlbum: "  + returnedSong.album.name +
            "\n----------------------------------------"
            );
        }
    });
}

function movieThis(query) {
    var parseMovieQuery = query.split(' ').join('+');
    var concertRequestURL = "http://www.omdbapi.com/?t=" + parseMovieQuery + "&apikey=" + omdb;
    request(concertRequestURL, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var returnedMovie = JSON.parse(body);
            console.log(
                "\nTitle: " + returnedMovie.Title +
                "\nYear: " + returnedMovie.Year +
                "\nIMDB Rating: " + returnedMovie.imdbRating +
                "\nRotten Tomatoes Rating: " + returnedMovie.Ratings[0].Value +
                "\nCountry: " + returnedMovie.Country +
                "\nLanguage(s): " + returnedMovie.Language +
                "\nPlot: " + returnedMovie.Plot +
                "\nActors: " + returnedMovie.Actors +
                "\n----------------------------------------"
                );
        } else {
            return console.error("Error occurred: " + error)
        }
    });
}

function doWhatItSays() {
    fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) {
            console.log(error);
        } else {
            var parseFileData = data.split(',');
            query = parseFileData[1].replace('"', "");
            command = parseFileData[0];
            run(command);
        }
    });
}

run(command);