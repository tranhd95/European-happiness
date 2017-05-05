import "../css/main.css";
import * as topojson from "topojson";
import * as d3 from "d3";
import {visualization} from "./visualization";

let opts = {
    mapWidth: 800,
    mapHeight: 500,
    infoBoxWidth: 500,
    infoBoxHeight: 300,
    scale: 500
};

let svg = d3.select("body")
            .append("div").attr("id", "mapContainer")
            .append("svg")
            .attr("viewBox", `0 0 ${opts.mapWidth} ${opts.mapHeight}`)
            .attr("preserveAspectRatio", "xMidYMid")
            .attr("width", "100%")
            .attr("height", "100%");


// Load the geoJson and render the visualization
d3.json("./src/js/europe.json", (json) => {
    let geojson = topojson.feature(json, json.objects.europe);
    d3.csv("./src/csv/europe.csv", (data) => {
        let mapVisualization = visualization(geojson, opts);
        mapVisualization.selection(svg);
        mapVisualization.data(data);
        mapVisualization();
    });
});



