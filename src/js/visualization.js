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

    let mapSvgElement;
    let data;
    let maxValues;
    let zoomableLayer;


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
            "Trust": d3.max(data, (d) => {
                return +d.Trust;
            }),
            "Generosity": d3.max(data, (d) => {
                return +d.Generosity;
            }),
            "Happiness": d3.max(data, (d) => {
                return +d.Happiness;
            })
        };

        return render;
    };

    // Selection setter
    render.selection = (s) => {
        if (!arguments.length) return mapSvgElement;
        mapSvgElement = s;
        return render;
    };

    // Main render method
    function render() {
        drawMap();
        mapInteraction();
    }

    // Draws the map
    function drawMap() {
        zoomableLayer = mapSvgElement.append("g");
        zoomableLayer.selectAll("path")
                     .data(geoJson.features)
                     .enter()
                     .append("path")
                     .attr("d", d3.geoPath(projection))
                     .attr("id", (d) => d.properties.name);

        gradient("Happiness");
    }

    // All event listeners
    function mapInteraction() {
        zooming();
        clickEvents();
        hoverEvents();
    }

    function zooming() {
        let zoom = d3.zoom()
                     .on("zoom", () => zoomableLayer.attr("transform", d3.event.transform));
        mapSvgElement.call(zoom);
    }

    // Event listeners for clicking events
    function clickEvents() {
        clickOnCountry();
        clickOnBar();
    }

    // Event listener for clicking on specific country
    function clickOnCountry() {
        mapSvgElement.selectAll("path")
                     .on("click", onCountryClickHandler);
    }

    // Event handler for clicking on the country
    function onCountryClickHandler() {
        highlightSelectedCountry(this);
        showInfoBox(this);
    }

    // Event listener for clicking on category bar (Happiness, Health, ...)
    function clickOnBar() {
        d3.select("#infoBox")
          .selectAll(".barGroup")
          .on("click", onBarClickHandler);
        d3.select(".happinessBarGroup")
          .on("click", onBarClickHandler);

    }

    // Event handler for clicking on the category bar
    function onBarClickHandler() {
        let barId = this.id;
        gradient(barId);
        d3.select("#categorySelected")
          .text("Selected category: " + barId);
    }

    function gradient(category) {
        mapSvgElement
            .selectAll("path")
            .transition()
            .duration(700)
            .ease(d3.easeExp)
            .style("fill", function () {
                let country = d3.select(this).attr('id');
                let countryData = getCountryData(country);
                if (countryData !== null) {
                    let value = countryData[category];

                    let gradient = d3.scaleLinear()
                                     .domain([0, maxValues[category]/2, maxValues[category]])
                                     .range(["#e5f5e0", "#a1d99b", "#31a354"]);
                    return gradient(value);
                } else {
                    return "grey";
                }
            });
        hoverEvents();
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
        mapSvgElement.selectAll("path")
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
        mapSvgElement.selectAll("path")
                     .classed("selectedCountry", false);
    }

    function barChart(countryName, countryData) {

        if (countryData === null) {
            d3.select("#countryName")
              .text(countryName + " NO DATA");
            // Remove previous country data
            d3.select("#barChart")
              .select("svg")
              .remove();
            return;
        }

        let data = [
            {"variable": "Economy", "value": +countryData.Economy, "max": maxValues.Economy},
            {"variable": "Trust", "value": +countryData.Trust, "max": maxValues.Trust},
            {"variable": "Generosity", "value": +countryData.Generosity, "max": maxValues.Generosity},
            {"variable": "Family", "value": +countryData.Family, "max": maxValues.Family},
            {"variable": "Health", "value": +countryData.Health, "max": maxValues.Health},
            {"variable": "Freedom", "value": +countryData.Freedom, "max": maxValues.Freedom}
        ];

        // Remove previous country data
        d3.select("#barChart")
          .select("svg")
          .remove();

        // Happiness
        d3.select("#countryName")
          .text(countryName)
          .style("padding-left", "100px")
          .append("hr");

        d3.select("#happinessScore")
          .text("Happiness score: " + countryData.Happiness)
          .style("text-align", "center")
          .style("margin-top", "20px")
          .style("margin-left", "80px");

        // Add svg element to #infoBox
        let svg = d3.select("#barChart")
                    .append("svg")
                    .attr("width", opts.infoBoxWidth)
                    .attr("height", opts.infoBoxHeight);

        let margin = {top: 50, right: 20, bottom: 30, left: 100};
        let width = opts.infoBoxWidth - margin.left - margin.right;
        let height = opts.infoBoxHeight - margin.top - margin.bottom;

        let yScale = d3.scaleBand()
                       .range([height, 0])
                       .domain(data.map((d) => d.variable))
                       .padding(0.1);

        let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        function xScale(value, max) {
            let x = d3.scaleLinear().range([0, width]);
            x.domain([0, max]);
            return x(value);
        }

        g.append("g")
         .attr("class", "yaxis")
         .style("font-size", "18px")
         .call(d3.axisLeft(yScale));

        let happinessBarGroup = g.append("g")
                                 .attr("transform", "translate(0, -50)")
                                 .attr("class", "happinessBarGroup")
                                 .attr("id", "Happiness");


        // Happiness background chart
        happinessBarGroup
            .append("rect")
            .attr("class", "happinessBarBg")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", 30)
            .attr("width", xScale(10, 10));

        // Happiness
        happinessBarGroup
            .append("rect")
            .attr("class", "happinessBar")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", 30)
            .transition()
            .duration(700)
            .ease(d3.easeExp)
            .attr("width", () => xScale(countryData.Happiness, 10));

        g.append("g")
         .attr("transform", "translate(0, -25)")
         .call(d3.axisBottom(d3.scaleLinear().range([0, width]).domain([0, 10])).ticks(5));

        let groups = g.selectAll(".barBg")
                      .data(data)
                      .enter()
                      .append("g")
                      .attr("class", "barGroup")
                      .attr("id", (d) => d.variable);


        groups.append("rect")
              .attr("class", "barBg")
              .attr("x", 0)
              .attr("height", yScale.bandwidth())
              .attr("y", (d) => yScale(d.variable))
              .attr("width", (d) => xScale(d.max, d.max));

        groups.append("rect")
              .attr("class", "bar")
              .attr("x", 0)
              .attr("height", yScale.bandwidth())
              .attr("y", (d) => yScale(d.variable))
              .transition()
              .duration(700)
              .ease(d3.easeExp)
              .attr("width", (d) => xScale(d.value, d.max));

        groups.append("text")
              .attr("class", "value")
              .attr("x", (d) => 0)
              .attr("y", (d) => yScale(d.variable) + 25)
              .transition()
              .duration(700)
              .ease(d3.easeExp)
              .attr("x", (d) => (xScale(d.value, d.max) < 36) ? xScale(d.value, d.max) + 15 : xScale(d.value, d.max) - 35)
              .attr("y", (d) => yScale(d.variable) + 25)
              .text((d) => Math.round(d.value * 100) / 100)
              .style("font-size", "18px")
              .style("fill", "black");

        d3.select("#barHelp")
          .style("display", "block");
        d3.select("#categorySelected")
          .style("display", "block");

        clickOnBar();


    }

    return render;
}