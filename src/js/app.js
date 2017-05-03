import "../css/main.css";
import * as d3 from "d3";
import * as topojson from "topojson";

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

// Visualization function
function visualization(geoJson, opts) {

    let projection = d3.geoMercator()
                       .scale(opts.scale)
                       .center([16, 57])
                       .translate([opts.width / 2, opts.height / 2]);

    let svgElement;
    let selectedCountry;

    // Selection setter
    render.selection = (s) => {
        if(!arguments.length) return svgElement;
        svgElement = s;
        return render;
    };

    // Main render method
    function render() {
        drawMap();
        interaction();
    }

    // Draws the map
    function drawMap() {
        svgElement.selectAll("path")
           .data(geoJson.features)
           .enter()
           .append("path")
           .attr("d", d3.geoPath(projection))
           .attr("id", (d) => d.properties.name);
    }

    // All event listeners
    function interaction() {
        clickEvents();
        hoverEvents();
    }

    // Event listeners for clicking events
    function clickEvents() {
        clickOnCountry();
    }

    // Event listener for clicking on specific country
    function clickOnCountry() {
        svgElement.selectAll("path")
                 .on("click", onCountryClickHandler);
    }

    // Event handler for clicking on the country
    function onCountryClickHandler() {
        selectedCountry = this;
        highlightSelectedCountry(selectedCountry);
        showInfoBox(selectedCountry);
    }

    // Highlights the selected country
    function highlightSelectedCountry(country) {

        resetFill();

        // Fill the country
        d3.select(country)
            .classed("selectedCountry", true);
    }

    function showInfoBox(country) {
        d3.select("#infoBox")
            .text(country.id);
    }

    // Event listeners for hovering
    function hoverEvents() {
        hoverOverCountry();
    }

    // Event handlers for hovering over the country
    function hoverOverCountry() {
        svgElement.selectAll("path")
            .on("mouseover", hoverOverCountryHandler)
            .on("mouseout", hoverOutCountryHandler);
    }

    // Event handler for hovering over the country
    function hoverOverCountryHandler() {
        d3.select(this)
          .classed("hoverCountry", true);
    }

    // Event handler for hovering out of the country
    function hoverOutCountryHandler() {
        d3.select(this)
            .classed("hoverCountry", false);
    }

    // Resets fill color of all countries
    function resetFill() {
        svgElement.selectAll("path")
            .classed("selectedCountry", false);
    }

    return render;
}


