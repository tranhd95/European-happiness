/**
 * Created by tran on 3.5.17.
 */
// Visualization function
import * as d3 from "d3";

export function visualization(geoJson, opts) {

    let projection = d3.geoMercator()
                       .scale(opts.scale)
                       .center([16, 57])
                       .translate([opts.width / 2, opts.height / 2]);

    let svgElement;
    let data;

    render.data = (d) => {
        data = d;
        return render;
    };

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
        highlightSelectedCountry(this);
        showInfoBox(this);
    }

    // Highlights the selected country
    function highlightSelectedCountry(country) {

        resetFill();

        // Fill the country
        d3.select(country)
          .classed("selectedCountry", true);
    }

    function showInfoBox(country) {
        let selectedCountryName = d3.select(country).attr("id");
        let isDataAvailable = false;
        let countryData;
        for (let i = 0; i < data.length; i++) {
            if (data[i].Country == selectedCountryName) {
                isDataAvailable = true;
                countryData = data[i];
                break;
            }
        }

        if (!isDataAvailable) {
            console.log("No data.");
        }

        d3.select("#infoBox")
            .html(`Country: ${countryData.Country}<br>
                    Region: ${countryData.Region}<br>
                    GDP per capita: ${countryData.Economy}<br>
                    Happiness: ${countryData["Happiness Score"]} <br>
                    Corruption: ${countryData.Corruption} <br>
                    Family: ${countryData.Family} <br>
                    Health: ${countryData.Health} <br>
                    Freedom: ${countryData.Freedom} <br>
                    Generosity: ${countryData.Generosity}`);

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