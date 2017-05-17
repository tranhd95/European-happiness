/**
 * Created by tran on 3.5.17.
 */
// Visualization function
import * as d3 from "d3";

export function visualization(geoJson, opts) {

    let projection = d3.geoMercator()
                       .scale(opts.scale)
                       .center([16, 57])
                       .translate([opts.mapWidth / 2, opts.mapHeight / 2]);

    let svgElement;
    let data;
    let maxValues;

    render.data = (d) => {
        data = d;

        maxValues = {
            "Economy": d3.max(data, (d) => {
                return +d.Economy;
            }),
            "Family": d3.max(data, (d) => {
                return +d.Family;
            }),
            "Health": d3.max(data, (d) => {
                return +d.Health;
            }),
            "Freedom": d3.max(data, (d) => {
                return +d.Freedom;
            }),
            "Corruption": d3.max(data, (d) => {
                return +d.Corruption;
            }),
            "Generosity": d3.max(data, (d) => {
                return +d.Generosity;
            })
        };

        return render;
    };

    // Selection setter
    render.selection = (s) => {
        if (!arguments.length) return svgElement;
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

    function showInfoBox(countryElement) {
        let selectedCountryName = d3.select(countryElement).attr("id");
        let countryData = getCountryData(selectedCountryName);
        barChart(selectedCountryName, countryData);
    }

    // Finds the country data with country name
    // Returns null if no data found otherwise returns country data
    function getCountryData(countryName) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].Country === countryName) {
                return data[i];
            }
        }
        return null;
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
        //#TODO tooltip
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

    function barChart(countryName, countryData) {

        if (countryData === null) {
            //#TODO No data available case (Andorra, San Marino, Vatican)
            d3.select("#countryName")
              .text(countryName + " NO DATA");
            // Remove previous country data
            d3.select("#infoBox")
              .select("svg")
              .remove();
            return;
        }

        let data = [
            {"variable": "Economy", "value": +countryData.Economy, "max": maxValues.Economy},
            {"variable": "Corruption", "value": +countryData.Corruption, "max": maxValues.Corruption},
            {"variable": "Generosity", "value": +countryData.Generosity, "max": maxValues.Generosity},
            {"variable": "Family", "value": +countryData.Family, "max": maxValues.Family},
            {"variable": "Health", "value": +countryData.Health, "max": maxValues.Health},
            {"variable": "Freedom", "value": +countryData.Freedom, "max": maxValues.Freedom}
        ];

        // Remove previous country data
        d3.select("#infoBox")
          .select("svg")
          .remove();

        d3.select("#countryName")
            .text(countryName + " Happiness: " + countryData.Happiness);

        // Add svg element to #infoBox
        let svg = d3.select("#infoBox")
                    .append("svg")
                    .attr("width", opts.infoBoxWidth)
                    .attr("height", opts.infoBoxHeight);

        let margin = {top: 20, right: 20, bottom: 30, left: 80};
        let width = opts.infoBoxWidth - margin.left - margin.right;
        let height = opts.infoBoxHeight - margin.top - margin.bottom;

        let yScale = d3.scaleBand()
                       .range([height, 0])
                       .domain(data.map(function (d) {
                           return d.variable;
                       }))
                       .padding(0.1);

        let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        function xScale(value, max) {
            let x = d3.scaleLinear().range([0, width]);
            x.domain([0, max]);
            return x(value);
        }

        g.append("g")
         .attr("class", "y axis")
         .call(d3.axisLeft(yScale));

        g.selectAll(".bar")
         .data(data)
         .enter().append("rect")
         .attr("class", "bar")
         .attr("x", 0)
         .attr("height", yScale.bandwidth())
         .attr("y", function (d) {
             return yScale(d.variable);
         })
         .transition()
         .duration(700)
         .ease(d3.easeExp)
         .attr("width", function (d) {
             return xScale(d.value, d.max);
         });
    }

    return render;
}