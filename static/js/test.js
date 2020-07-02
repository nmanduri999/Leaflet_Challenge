
/// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";
function getColor(d) {
  return d > 7 ? '#800026' :
         d > 6  ? '#BD0026' :
         d > 5  ? '#E31A1C' :
         d > 4  ? '#FC4E2A' :
         d > 5   ? '#FD8D3C' :
         d > 2   ? '#FEB24C' :
         d > 1   ? '#FED976' :
                    '#FFEDA0';
}
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function markerSize(mag) {
  return mag *10000;
}

function createFeatures(earthquakeData) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function addDetails(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "<br>Magnitude: " + feature.properties.mag + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
  function addRadius(feature, latlng) {
    L.circle(feature.geometry.coordinates, {
      fillOpacity: 0.75,
      color: "white",
      fillColor: "purple",
      // Setting our circle's radius equal to the output of our markerSize function
      // This will make our marker's size proportionate to its population
      radius: markerSize(feature.properties.mag)
    })
  }
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: addDetails,
    onEachFeature: addRadius

  });
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}
function createMap(earthquakes) {
  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v9",
    accessToken: API_KEY
  });
  
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
  };
  // Create overlay object to hold our overlay layer
    // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });
  
  L.control.layers(baseMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4, 5, 6, 7],
      labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  
  return div;
  };
  
  legend.addTo(myMap);
}