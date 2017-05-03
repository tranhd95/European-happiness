import "../css/main.css";
import * as topojson from "topojson";
import * as d3 from "d3";
import {visualization} from "./visualization";

let opts = {
    width: 800,
    height: 500,
    scale: 500
};

let svg = d3.select("body")
            .append("div").attr("id", "mapContainer")
            .append("svg")
            .attr("viewBox", `0 0 ${opts.width} ${opts.height}`)
            .attr("preserveAspectRatio", "xMidYMid")
            .attr("width", "100%");

// Load the geoJson and render the visualization
d3.json("./src/js/europe.json", function (json) {
    let geojson = topojson.feature(json, json.objects.europe);
    let mapVisualization = visualization(geojson, opts);
    mapVisualization.selection(svg);
    mapVisualization();
});


