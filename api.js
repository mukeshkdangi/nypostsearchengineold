const express = require('express');
const app = express();
const router = express.Router();
const geohash = require('ngeohash');
const fetch = require("node-fetch");


const request = require('request');
const bodyParser = require('body-parser');

const tktMasterAPIKey = 'A4TlIeloUW72ysAGiyniEoY3D7LI6Dre';
const ggCustomSearchAPIKey = 'AIzaSyCUTHeQWUu4sxTjPOSMs5n1_i6UQhAJrPA';
const ggCX = '000675612509316675512:j5esvfisi4k';
const songKickAPIKey = 'cJXRlNA95ix2MfU4';
const spotifyClientId = '02b81f71e17b4f0bbdc4226b121024d9';
let spotifySecretId = 'cc93d55cf00d4616b1654a00b4e1ec20';
let SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: spotifyClientId,
    clientSecret: spotifySecretId
});

let cors = require('cors')
app.use(cors());
app.set('json spaces', 40);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000
spotyfyStatus = 401
count = 0;

app.use('/api/geohash/:lat/:lon', (req, res) => {
    let geoHash = geohash.encode(req.params.lat, req.params.lon)
    res.setHeader('Content-Type', 'application/json');
    res.set({ 'Content-Type': 'application/json' });
    res.json({ geoHash: geoHash });
});

app.get('/api/ticketmaster/getsuggestion/:keyword', (req, res) => {
    let keyword = req.params.keyword;
    res.header('Access-Control-Allow-Origin', "*");
    let url = 'https://app.ticketmaster.com/discovery/v2/suggest?apikey=' + tktMasterAPIKey + '+&keyword=' + keyword;
    console.log(url);
    request({ uri: url }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.json(JSON.parse(body));
        } else {
            res.json(error);
        }
    });
});

app.get('/api/google/getlatlonbydescription/:locationDescription', (req, res) => {
    let locationDescription = req.params.locationDescription;
    let url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + locationDescription + '&key=AIzaSyD1J5y9ghV6tNxV5PJVs-QOoaesM4TIxQs';
    console.log(url);
    request({ uri: url }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.json(JSON.parse(body));
        } else {
            res.json(error);
        }
    });
});

app.get('/api/ticketmaster/getevents/:attractionid/:categoryid/:distance/:geopoint/:distanceunit', (req, res) => {
    let url = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=' + tktMasterAPIKey
        + '&attractionId=' + req.params.attractionid + '&segmentId='
        + req.params.categoryid + '&radius=' + req.params.distance
        + '&geoPoint=' + req.params.geopoint + '&unit=' + req.params.distanceunit;
    console.log(url);
    request({ uri: url }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.json(JSON.parse(body));
        } else {
            console.log("sending back with error", error);
            res.json(error);
        }
    });
});

app.get('/api/ticketmaster/geteventbyid/:eventid', (req, res) => {
    let url = 'https://app.ticketmaster.com/discovery/v2/events/' + req.params.eventid + '?apikey=' + tktMasterAPIKey;
    console.log(url);
    request({ uri: url }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.json(JSON.parse(body));
        } else {
            res.json(error);
        }
    });
});

app.get('/api/ticketmaster/getvenuebyid/:venueid', (req, res) => {
    let url = 'https://app.ticketmaster.com/discovery/v2/venues/' + req.params.venueid + '?apikey=' + tktMasterAPIKey;
    console.log(url);
    request({ uri: url }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.json(JSON.parse(body));
        } else {
            res.json(error);
        }
    });
})

app.get('/api/google/getimages/:searchqry', (req, res) => {
    let url = 'https://www.googleapis.com/customsearch/v1?q=' + req.params.searchqry 
    + '&cx='+ ggCX + '&imgSize=huge&num=9&searchType=image&key=' + ggCustomSearchAPIKey;
    console.log(url);
    request({ uri: url }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.json(JSON.parse(body));
        } else {
            res.json(error);
        }
    });
});

app.get('/api/songkick/getvenueidbyvenuename/:venuename', (req, res) => {
    let url = 'https://api.songkick.com/api/3.0/search/venues.json?query=+' + req.params.venuename
        + '&apikey=' + songKickAPIKey;
    console.log(url);
    request({ uri: url }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.json(JSON.parse(body));
        } else {
            res.json(error);
        }
    });
});

app.get('/api/songkick/getvenuebyid/:id', (req, res) => {
    let url = 'https://api.songkick.com/api/3.0/venues/' + req.params.id + '/calendar.json?&apikey=' + songKickAPIKey;
    console.log(url);
    request({ uri: url }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.json(JSON.parse(body));
        } else {
            res.send(error);
        }
    });
});

app.get('/api/spotify/getartistbyname/:name', (req, res) => {
    spotifyApi.searchArtists(req.params.name)
        .then((data) => {
            console.log(`Search artists by ${req.params.name}`, data.body);
            res.status(200).send(JSON.stringify(data.body));
        }, function (err) {
            return getArtistDetails(req, res)
        });
});

async function getArtistDetails(req, res) {
    result = await spotifyApi.clientCredentialsGrant();
    console.error("refreshAccessToken Error ", result);
    await spotifyApi.setAccessToken(result.body.access_token);

    spotifyApi.searchArtists(req.params.name)
        .then((data) => {
            console.log(` searchArtists 2 data ${req.params.name}`, data.body);
            res.status(200).send(JSON.stringify(data.body));
        }, function (err) {
            console.error("searchArtists  2", err);
            res.send(err);
        });
    return res;
}

function getArtistInfo(name) {
    spotifyApi.searchArtists(name)
        .then(function (data) {
            console.log(`Search artists by ${name.name}`, data.body);
        }, function (err) {
            reloop(req.params.name);
            console.error(err);
        });
    return data;
}

app.listen(PORT, () => console.log(`listening to port ${PORT}`));
module.exports = router;
