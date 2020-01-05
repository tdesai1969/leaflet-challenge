// Create the tile layer that will be the background of our map
var lightmap = L.tileLayer("https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
});

var satellitemap = L.tileLayer("https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-satellite",
    accessToken: API_KEY
});

var outdoorsmap = L.tileLayer("https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
});

// Create the map with our layers
var map = L.map("map", {
    center: [40.73, -94.5],
    zoom: 3,
    layers: [lightmap,satellitemap,outdoorsmap]
});

// Add our 'lightmap' tile layer to the map
lightmap.addTo(map);

var tectonicplates = new L.layerGroup();
var earthquakes = new L.layerGroup();

var overlays = {
    "Tectonic Plates ": tectonicplates,
    "Earthquakes" : earthquakes
}
var basemaps = {
    Grayscale: lightmap,
    Satellite: satellitemap,
    Outdoors: outdoorsmap
}
L.control.layers(basemaps,overlays).addTo(map)

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (data) {
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }
    function getColor(magnitude) {
        switch (true) { 
            case magnitude > 5: return "#EA2C2C"; 
            case magnitude > 4: return "#EA822C"; 
            case magnitude > 3: return "#EE9C00"; 
            case magnitude > 2: return "#EECC00"; 
            case magnitude > 1: return "#D4EE00"; 
            default: return "#98EE00"; }
    }

    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 5;
    }
    L.geoJson(data, {
        pointToLayer: function (feature, latlon) {
            return L.circleMarker(latlon);
        }, style: styleInfo,
        onEachFeature: function (feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br> Location:  " + feature.properties.place);
        }

    }).addTo(earthquakes)
    earthquakes.addTo(map)

    var legend = L.control({
        position: "bottomright"
    })
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        var grades = [0,1,2,3,4,5];
        // lables = [];
        var colors = ["#98EE00","#D4EE00","#EECC00","#EE9C00","#EA822C","#EA2C2C"];
        for(var i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style = 'background: " + colors[i]+"'></i>" + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    }
    legend.addTo(map);

    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(data) {
        L.geoJson(data, {
            color:"orange",
            weight: 2
        }).addTo(tectonicplates)
        tectonicplates.addTo(map)
    })
});