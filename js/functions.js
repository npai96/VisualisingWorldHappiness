/* Helper Functions */

function ready_update(year, country_colors, metric, clicked_elements, metricBycolors) {

  csv_data = yearByStats[year];
  // console.log("CSV Data changed to yearByStats["+year+"]");

  d3.json("js/world_countries.json", function(json) {
      // console.log("COUNTRIES", json);
      for (var i = 0; i < csv_data.length; i++) {
        var dataCountry = csv_data[i].Country;
        var dataHappinessScore = parseFloat(csv_data[i]["Happiness Score"]);
        var dataHappinessRank = parseFloat(csv_data[i]["Happiness Rank"]);
        var dataGDP_per_Capita = parseFloat(csv_data[i]["Economy (GDP per Capita)"]);
        var dataFamily = parseFloat(csv_data[i]["Family"]);
        var dataHealth_Life_Expectancy = parseFloat(csv_data[i]["Health (Life Expectancy)"]);
        var dataFreedom = parseFloat(csv_data[i]["Freedom"]);
        var dataTrust_Government_Corruption = parseFloat(csv_data[i]["Trust (Government Corruption)"]);
        var dataGenerosity = parseFloat(csv_data[i]["Generosity"]);
        var dataDystopiaResidual = parseFloat(csv_data[i]["Dystopia Residual"]);
        var dataYear = parseFloat(csv_data[i]["Year"]);

        for (var j = 0; j < json.features.length; j++) {
          var jsonCountry = json.features[j].properties.name;
          // if (jsonCountry == "Afghanistan" && dataCountry == "Afghanistan") {
          //   console.log("Afghanistan MATCH", json.features[j].properties);
          // }
          if (dataCountry == jsonCountry) {
            json.features[j].properties.HappinessRank = dataHappinessRank;
            json.features[j].properties.HappinessScore = dataHappinessScore;
            json.features[j].properties.EconomyGDPperCapita = dataGDP_per_Capita;
            json.features[j].properties.Family = dataFamily;
            json.features[j].properties.HealthLifeExpectancy = dataHealth_Life_Expectancy;
            json.features[j].properties.Freedom = dataFreedom;
            json.features[j].properties.TrustGovernmentCorruption = dataTrust_Government_Corruption;
            json.features[j].properties.Generosity = dataGenerosity;
            json.features[j].properties.DystopiaResidual = dataDystopiaResidual;
            json.features[j].CountryColor = country_colors[j];
            json.features[j].properties.Year = dataYear;

            break;
          } else if (dataCountry == "United States" && jsonCountry == "United States of America" || 
                dataCountry == "Congo (Kinshasa)" && jsonCountry == "Democratic Republic of the Congo" || 
                dataCountry == "Congo (Brazzaville)" && jsonCountry == "Republic of the Congo" ||
                dataCountry == "Somaliland region" && jsonCountry == "Somaliland" || 
                dataCountry == "Tanzania" && jsonCountry == "United Republic of Tanzania" || 
                dataCountry == "Guinea" && jsonCountry == "Equatorial Guinea" || 
                dataCountry == "Serbia" && jsonCountry == "Republic of Serbia") {
            json.features[j].properties.HappinessRank = dataHappinessRank;
            json.features[j].properties.HappinessScore = dataHappinessScore;
            // json.features[j].properties.StandardError = dataStandardError;
            json.features[j].properties.EconomyGDPperCapita = dataGDP_per_Capita;
            json.features[j].properties.Family = dataFamily;
            json.features[j].properties.HealthLifeExpectancy = dataHealth_Life_Expectancy;
            json.features[j].properties.Freedom = dataFreedom;
            json.features[j].properties.TrustGovernmentCorruption = dataTrust_Government_Corruption;
            json.features[j].properties.Generosity = dataGenerosity;
            json.features[j].properties.DystopiaResidual = dataDystopiaResidual;
            json.features[j].CountryColor = country_colors[j];
            json.features[j].properties.Year = dataYear;
            break;
          } else {
            json.features[j].CountryColor = country_colors[j];
          }
        }
      }

    // console.log("Json data changed to ", year, json)
    var metric_nospecials = metric.replace(/[^A-Z0-9]+/ig, "");
    // console.log("NOSPECIALS: ", metric_nospecials);

    // Join new data with old elements
    var paths = svg.selectAll("path").data(json.features, function(d) { return d; });

    // Exit old elements not present in new data
    paths.exit()
         .remove();

    // Re-render
    svg.selectAll("path.map") 
        .data(json.features)
        .enter() 
        .append("path")
        .attr("class", "path.map")
        .attr("d", path)
        .attr("fill", function(d, i) {
          var year = d.properties.Year;
          var metric_value = d["properties"][metric_nospecials];

          if (d.properties.name in clicked_elements) {
            d3.select(this).classed("selected", true);
            return d.CountryColor;
          }
          if (metric_value && metric_value > -1) {
            return color(metric_value);
          } else {
            return "#4A4A4A";
          }
        })
        .on("mouseover", function(d) {
          // console.log("Mouseover json changed to ", d.properties.Year);
          var country = d.properties.name;
          var metric_value = 0;

          var id = d.properties.name.replace(/[^A-Z0-9]+/ig, "");
          d3.select("#"+id+"_valueline")
             .transition()
             .duration(200)
             .style('stroke-width', "4px");
          d3.selectAll("#"+id+"_dot")
             .transition()
             .duration(200)
             .style('r', "8px");

          d3.selectAll(".line")
            .style("opacity", 0.4);
          d3.select("#"+id+"_valueline")
            .style("opacity", 1);

          d3.selectAll(".compare_chart_circle")
            .style("opacity", 0.4);
          d3.selectAll("#"+id+"_dot")
            .style("opacity", 1);

          d3.select("#small_chart_heading_"+id)
                  .transition()
                  .duration(200)
                  .style("font-size", "18px");

          if (!d["properties"][metric_nospecials] || d["properties"][metric_nospecials] == -1) {
            metric_value = "<b style='color: red;'>Unavailable</b>";
          } else {
            metric_value = d["properties"][metric_nospecials].toFixed(2);
          }


          d3.select(this).style("opacity", 0.4);

          tooltip.transition()
                 .duration(200)
                 .style("opacity", 0.9)
                 .style("left", (d3.event.pageX + 20) + "px")   
                 .style("top", (d3.event.pageY + 5) + "px");

          // console.log("TOOLTIP: ", d);
          if (country == "Antarctica") {
            tooltip.html(function() {
                      return ("<b> Continent: </b>" + country + "</br><b>Year: </b>" + year + "</br><b>" + metric + ": </b>" + metric_value + "</br>")
                    });
          } else {
            tooltip.html(function() {
                      return ("<b> Country: </b>" + country + "</br><b>Year: </b>" + year + "</br><b>" + metric + ": </b>" + metric_value + "</br>")
                    });
          }
      })
      .on("mouseout", function(d) {
        var id = d.properties.name.replace(/[^A-Z0-9]+/ig, "");
        d3.selectAll("#"+id+"_dot")
                     .transition()
                     .duration(200)
                     .style('r', "4px");
        d3.select("#"+id+"_valueline")
           .transition()
           .duration(200)
           .style('stroke-width', "2px");

        d3.selectAll(".line")
          .style("opacity", 1.0);

        d3.selectAll(".compare_chart_circle")
          .style("opacity", 1.0);


        d3.select("#small_chart_heading_"+id)
                  .transition()
                  .duration(200)
                  .style("font-size", "14px");

        d3.select(this).style("opacity", 1.0);

        tooltip.transition()
           .duration(500)
           .style("opacity", 0);
        })
      .on("click", function(d) {
        // https://jsfiddle.net/xcn35ycm/4/
        // console.log("CLICKED ELEMENTS: ", clicked_elements)
        if (!d3.select(this).classed("selected")) {
          d3.select(this).classed("selected", true)
          d3.select(this).transition().attr("stroke", d.CountryColor);
          d3.select(this).transition().attr("fill", d.CountryColor);
          clicked_elements[d.properties.name] = [this, d];
          append_line(d, metric, yearByStats, compare_chart, x, y, compare_chart_tooltip, clicked_elements);
          append_chart(d, metricByRange, yearByStats, metricByChartColor, clicked_elements);
        } else {
          d3.select(this).classed("selected", false);
          d3.select(this).transition().duration(200).attr("stroke", "none");
          d3.select(this).transition().duration(200).attr("fill", function() {
            var metric_value = d["properties"][metric_nospecials];
            if (metric_value) {
            // console.log(year);
            // console.log(d.properties.name, year, value, color(value));
            return color(metric_value);
            } else {
              return "#4A4A4A";
            }
          })
          delete clicked_elements[d.properties.name];
          remove_line(d.properties.name, compare_chart);
          remove_chart(d.properties.name);
        }
        // console.log(clicked_elements);
      });
  });
}




function update_legend() {
  // console.log("RANGE: ", metric, metricByRange[metric][0])
  d3.select("#metric_legend_stop2").attr("stop-color", metricBycolors[metric][1]);
  var legend_label1 = "Least Important";
  var legend_label2 = "Most Important";
  var legend_label1_x = 69;

  if (metric == "Happiness Rank" || metric == "Happiness Score") {
    if (metric == "Happiness Rank") {
      y_legend.domain([0, metricByRange[metric][1]]);
    } else if (metric == "Happiness Score") {
      y_legend.domain(metricByRange[metric].slice().reverse());
    }
    legend_label1 = "Least Happy";
    legend_label2 = "Most Happy";
    legend_label1_x = 55;
  } else {
    y_legend.domain([metricByRange[metric][1], 0]);
  }

  yAxis_legend = d3.axisBottom()
                        .scale(y_legend)
                        .ticks(5);

  d3.select("#legend_axis1").remove();
  d3.select("#legend_axis2").remove();

  key.append("g")
      .attr("class", "y axis")
      .attr("id", "legend_axis1")
      .attr("transform", "translate(10,30)")
      .call(yAxis_legend)
      .append("text")
      .attr("y", -30)
      .attr("x", legend_label1_x)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(legend_label1);

 key.append("g")
      .attr("class", "y axis")
      .attr("id", "legend_axis2")
      .attr("transform", "translate(10,30)")
      .call(yAxis_legend)
      .append("text")
      .attr("y", -30)
      .attr("x", legend_w-10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(legend_label2);
}




function zoomed() {
  svg.selectAll('path')
     .attr('transform', d3.event.transform);
}




function zoomed_chart() {
  d3.selectAll("#compare_chart")
    .attr("transform", d3.event.transform);
  d3.selectAll('.line').style("stroke-width", 5/d3.event.transform.k);
  compare_x_axis_g.call(compare_x_axis.scale(d3.event.transform.rescaleX(x)));
  compare_y_axis_g.call(compare_y_axis.scale(d3.event.transform.rescaleY(y)));
} 




function get_metric_over_years(metric, country, yearByStats) {
  country_metric_by_year = [];
  // console.log(metric, typeof(metric));
  for (var year in yearByStats) {
    csv_data = yearByStats[year];
    var metric_value;
    for (var i = 0; i < csv_data.length; i++) {
        if (country == csv_data[i].Country || 
            csv_data[i].Country == "United States" && country == "United States of America" || 
            csv_data[i].Country == "Congo (Kinshasa)" && country == "Democratic Republic of the Congo" || 
            csv_data[i].Country == "Congo (Brazzaville)" && country == "Republic of the Congo" ||
            csv_data[i].Country == "Somaliland region" && country == "Somaliland" || 
            csv_data[i].Country == "Tanzania" && country == "United Republic of Tanzania" || 
            csv_data[i].Country == "Guinea" && country == "Equatorial Guinea" || 
            csv_data[i].Country == "Serbia" && country == "Republic of Serbia") {
          metric_value = parseFloat(csv_data[i][metric]);
          // console.log("CSV: ", csv_data[i].Country, "JSON: ", country)
          var obj = {"country": csv_data[i].Country, "year": new Date(year, 0, 1), "metric": metric_value};
          // console.log("OBJ: ", obj);
          country_metric_by_year.push(obj);
          break;
        }
    }
  }
  return country_metric_by_year;
}




function append_line(json_d, metric, yearByStats, compare_chart, x, y, compare_chart_tooltip, clicked_elements) {
  // console.log("draw");
  var year = json_d.properties.Year;
  var country = json_d.properties.name;
  var id = country.replace(/[^A-Z0-9]+/ig, "");

  country_metric_by_year = get_metric_over_years(metric, country, yearByStats);
  // console.log("OBBJ: ", country_metric_by_year);
  var formatTime = d3.timeFormat("%Y");

  country_metric_by_year.forEach(function(d) {
                                        d.year = formatTime(d.year);
                                        // console.log(d.year);
                                        d.metric = +d.metric;
                                    });

  var valueline = d3.line().defined(function(d) { return d.metric > -1; })
                    .x(function(d) { return x(d.year); })
                    .y(function(d) { return y(d.metric); });

  compare_chart.append("path")
                .attr('clip-path', 'url(#clip)')
                .attr("id", function() { return id+"_valueline"; } )
                .attr("class", "line")
                .attr("stroke", function() { return json_d.CountryColor; })
                .attr("d", valueline(country_metric_by_year))
                .on("mouseover", function(d) {
                  compare_chart_tooltip.transition().duration(250).style('opacity', 0.9);
                  compare_chart_tooltip.html("<b>" + country + "</b>")
                    .style('left', (d3.event.pageX) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px')

                  d3.selectAll(".line")
                    .transition()
                    .duration(100)
                    .style("opacity", 0.4);
                  d3.select(this)
                    .style("opacity", 1);

                  d3.select(this)
                     .transition()
                     .duration(200)
                     .style('stroke-width', "4px");
                     
                  d3.selectAll(".compare_chart_circle")
                    .transition()
                    .duration(100)
                    .style("opacity", 0.4);
                  d3.selectAll("#"+id+"_dot")
                    .style("opacity", 1);

                  d3.selectAll("#"+id+"_dot")
                     .transition()
                     .duration(200)
                     .style('r', "6px")

                  d3.select("#small_chart_heading_"+id)
                    .transition()
                    .duration(200)
                    .style("font-size", "18px");
                })
                .on("mouseout", function(d) {
                  compare_chart_tooltip.transition()
                                        .duration(500)
                                        .style('opacity', 0);

                  d3.selectAll(".compare_chart_circle")
                    .style("opacity", 1.0);
                  d3.selectAll(".line")
                    .style("opacity", 1.0);


                  d3.selectAll(".line")
                     .style('stroke-width', "2px");

                  d3.selectAll(".compare_chart_circle")
                     .style('r', "3px");

                  d3.selectAll("circle")
                     .style('r', "3px");

                  d3.select("#small_chart_heading_"+id)
                    .transition()
                    .duration(200)
                    .style("font-size", "14px");
                });
                                    

  compare_chart.selectAll("dot")  
                .attr('clip-path', 'url(#clip)')
                .data(country_metric_by_year.filter(function(d) { return d.metric > -1 }))     
                .enter().append("circle") 
                .attr("class", "compare_chart_circle")
                .attr("id", id+"_dot")              
                .attr("r", 4)   
                .attr('fill', json_d.CountryColor)
                .attr("cx", function(d) { return x(d.year); })     
                .attr("cy", function(d) { return y(d.metric); }) 
                .on("mouseover", d => {
                  compare_chart_tooltip.transition().duration(250).style('opacity', 0.9);
                  compare_chart_tooltip.html("<b>Country: </b>" + d.country + "</b><br/><b>Year: </b>" + d.year + "</br><b>Value: </b>" + d.metric.toFixed(2))
                    .style('left', (d3.event.pageX) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px');

                  d3.selectAll(".compare_chart_circle")
                    .transition()
                    .duration(100)
                    .style("opacity", 0.4);
                  d3.selectAll("#"+id+"_dot")
                    .style("opacity", 1.0);

                  d3.selectAll("#"+id+"_dot")
                     .transition()
                     .duration(200)
                     .style('r', "8px");


                  d3.selectAll(".line")
                    .transition()
                    .duration(100)
                    .style("opacity", 0.4);
                  d3.select("#"+id+"_valueline")
                    .style("opacity", 1.0);

                  d3.select("#"+id+"_valueline")
                     .transition()
                     .duration(200)
                     .style('stroke-width', "4px");
                  d3.select(clicked_elements[country][0])
                    .transition()
                    .duration(200)
                    .style("opacity", 0.4);
                  d3.select("#small_chart_heading_"+id)
                    .transition()
                    .duration(200)
                    .style("font-size", "18px");
                })
                .on("mouseout", d => {
                  compare_chart_tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);

                  d3.selectAll(".compare_chart_circle")
                    .style("opacity", 1.0)
                  d3.selectAll(".line")
                    .style("opacity", 1.0)

                  d3.selectAll(".compare_chart_circle")
                     .style('r', "4px");
                  d3.selectAll(".line")
                     .style('stroke-width', "2px");

                  d3.selectAll(".compare_chart_circle")
                     // .transition()
                     // .duration(200)
                     .style('r', "3px");

                  d3.select(clicked_elements[country][0])
                    .transition()
                    .duration(200)
                    .style("opacity", 1.0);

                  d3.select("#small_chart_heading_"+id)
                    .transition()
                    .duration(200)
                    .style("font-size", "14px");
                });
}




function remove_line(json_country, compare_chart) {
  // console.log("remove");
  // var country = json_d.properties.name;
  var id = json_country.replace(/[^A-Z0-9]+/ig, "");
  // console.log("JSON NAME: ", json_country);

  compare_chart.selectAll("#"+id+"_valueline")
               .remove();

  compare_chart.selectAll("#"+id+"_dot")
               .remove();
}




function generate_country_colors() {
  /* https://stackoverflow.com/questions/22503297/create-an-array-of-colors-about-100-in-javascript-but-the-colors-must-be-quit */
  var country_colors = [];

  while (country_colors.length < 177) {
    do {
        var color = Math.floor((Math.random()*1000000)+1);
    } while (country_colors.indexOf(color) >= 0);
    country_colors.push("#" + ("0000AFA" + color.toString(16)).slice(-6));
  }

  return country_colors;
}




function append_line_small_chart(json_d, metric, yearByStats, metric_chart_color, small_chart, x, y, clicked_elements, small_chart_tooltip/*, min, max*/) {
  // console.log("draw");
  var country = json_d.properties.name;
  var title_id = country.replace(/[^A-Z0-9]+/ig, "");
  var id = (country+metric).replace(/[^A-Z0-9]+/ig, "");
  var compare_id = country.replace(/[^A-Z0-9]+/ig, "");

  country_metric_by_year = get_metric_over_years(metric, country, yearByStats);
  
  var formatTime = d3.timeFormat("%Y");

  country_metric_by_year.forEach(function(d) {
                                        d.year = formatTime(d.year);
                                        // console.log(d.year);
                                        d.metric = +d.metric;
                                    });

  var valueline = d3.line().defined(function(d) { return d.metric > -1; })
                    .x(function(d) { return x(d.year); })
                    .y(function(d) { return y(d.metric); });

  small_chart.append("path")
                .attr("id", function() { /*console.log("ID: ", id);*/ return id+"_small_valueline"; } )
                .attr("class", "small_chart_line")
                .attr("stroke", function() { /* console.log("COLOR: ", json_d.CountryColor); */ return metric_chart_color; })
                .attr("d", valueline(country_metric_by_year))
                .on("mouseover", function(d) {
                  small_chart_tooltip.transition().duration(250).style('opacity', 0.9);
                  small_chart_tooltip.html("<b>" + metric + "</b>")
                    .style('left', (d3.event.pageX) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px')
                  d3.select(this)
                     .transition()
                     .duration(200)
                     .style('stroke-width', "4px");
                  d3.selectAll("#"+id+"_dot")
                     .transition()
                     .duration(200)
                     .style('r', "6px");

                  // compare_chart_tooltip.transition().duration(250).style('opacity', 0.9);
                  // compare_chart_tooltip.html("<b>" + country + "</b>")
                  d3.select("#"+compare_id+"_valueline")
                     .transition()
                     .duration(200)
                     .style('stroke-width', "4px");
                  d3.selectAll("#"+compare_id+"_dot")
                     .transition()
                     .duration(200)
                     .style('r', "8px");
                  d3.select(clicked_elements[country][0])
                    .style("opacity", 0.4);

                  d3.selectAll(".line")
                    .transition()
                    .duration(100)
                    .style("opacity", 0.4);
                  d3.select("#"+compare_id+"_valueline")
                    .style("opacity", 1);

                  d3.selectAll(".compare_chart_circle")
                    .transition()
                    .duration(100)
                    .style("opacity", 0.4);
                  d3.selectAll("#"+compare_id+"_dot")
                    .style("opacity", 1);

                  // d3.selectAll(".small_chart_line")
                  //   .transition()
                  //   .duration(100)
                  //   .style("opacity", 0.4);
                  // d3.select(this)
                  //   .style("opacity", 1);
                })
                .on("mouseout", function(d) {
                  small_chart_tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
                  d3.select(this)
                     .transition()
                     .duration(200)
                     .style('stroke-width', "2px");
                  d3.selectAll("#"+id+"_dot")
                     // .transition()
                     // .duration(200)
                     .style('r', "3px");

                  var compare_id = country.replace(/[^A-Z0-9]+/ig, "");
                  d3.select("#"+compare_id+"_valueline")
                     .transition()
                     .duration(200)
                     .style('stroke-width', "2px");
                  d3.selectAll("#"+compare_id+"_dot")
                     .transition()
                     .duration(200)
                     .style('r', "4px");
                  d3.select(clicked_elements[country][0])
                    .transition()
                    .duration(200)
                    .style("opacity", 1.0);

                  d3.selectAll(".line")
                    .transition()
                    .duration(100)
                    .style("opacity", 1.0);
                  d3.selectAll("circle")
                    .transition()
                    .duration(100)
                    .style("opacity", 1.0);
                  // d3.selectAll(".small_chart_line")
                  //   .transition()
                  //   .duration(100)
                  //   .style("opacity", 1.0);

                });
                                    

  small_chart.selectAll("dot")  
                .data(country_metric_by_year.filter(function(d) { return d.metric > -1 }))    
                .enter().append("circle")
                // .attr("class", "small_chart_circle")
                .attr("id", id+"_dot")              
                .attr("r", 3)   
                .attr('fill', metric_chart_color)
                .attr("cx", function(d) { return x(d.year); })     
                .attr("cy", function(d) { return y(d.metric); }) 
                .on("mouseover", d => {
                  small_chart_tooltip.transition().duration(250).style('opacity', 0.9);
                  small_chart_tooltip.html("<b>Year: </b>" + d.year + "</br><b>" + metric + ": </b>" + d.metric.toFixed(2))
                    .style('left', (d3.event.pageX) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px');

                  d3.selectAll("#"+id+"_dot")
                     .transition()
                     .duration(200)
                     .style('r', "6px");
                  d3.select("#"+id+"_small_valueline")
                     .transition()
                     .duration(200)
                     .style('stroke-width', "4px");

                  // compare_chart_tooltip.transition().duration(250).style('opacity', 0.9);
                  // compare_chart_tooltip.html("<b>" + country + "</b>")
                  d3.select("#"+compare_id+"_valueline")
                     .transition()
                     .duration(200)
                     .style('stroke-width', "4px");
                  d3.selectAll("#"+compare_id+"_dot")
                     .transition()
                     .duration(200)
                     .style('r', "8px");
                  d3.select(clicked_elements[country][0])
                    .transition()
                    .duration(200)
                    .style("opacity", 0.4);

                  d3.selectAll(".line")
                    .transition()
                    .duration(100)
                    .style("opacity", 0.4);
                  d3.select("#"+compare_id+"_valueline")
                    .style("opacity", 1);

                  d3.selectAll(".compare_chart_circle")
                    .transition()
                    .duration(100)
                    .style("opacity", 0.4);
                  d3.selectAll("#"+compare_id+"_dot")
                    .style("opacity", 1);

                })
                .on("mouseout", function(d) {
                  small_chart_tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);

                  d3.selectAll("#"+id+"_dot")
                     // .transition()
                     // .duration(200)
                     .style("r", "3px");

                  d3.select("#"+id+"_small_valueline")
                     .transition()
                     .duration(200)
                     .style('stroke-width', "2px");


                  d3.select("#"+compare_id+"_valueline")
                     .transition()
                     .duration(200)
                     .style('stroke-width', "2px");
                  d3.selectAll("#"+compare_id+"_dot")
                     .transition()
                     .duration(200)
                     .style('r', "4px");

                  d3.select(clicked_elements[country][0])
                    .transition()
                    .duration(200)
                    .style("opacity", 1.0);

                  d3.selectAll(".line")
                    .transition()
                    .duration(100)
                    .style("opacity", 1.0);
                  d3.selectAll("circle")
                    .transition()
                    .duration(100)
                    .style("opacity", 1.0);
                });


  small_chart.on("mouseover", function() {
      d3.select("#"+compare_id+"_valueline")
         .transition()
         .duration(200)
         .style('stroke-width', "4px");
      d3.selectAll("#"+compare_id+"_dot")
         .transition()
         .duration(200)
         .style('r', "8px");
      d3.select(clicked_elements[country][0])
        .transition()
        .duration(200)
        .style("opacity", 0.4);

      d3.select("#small_chart_heading_"+compare_id)
        .transition()
        .duration(200)
        .style("font-size", "18px");

      // d3.selectAll(".line")
      //   .transition()
      //   .duration(100)
      //   .style("opacity", 0.4);
      // d3.select("#"+compare_id+"_valueline")
      //   .style("opacity", 1.0);

      // d3.selectAll("circle")
      //   .transition()
      //   .duration(100)
      //   .style("opacity", 0.4);
      // d3.selectAll("#"+compare_id+"_dot")
      //   .style("opacity", 1.0);

    })
    .on("mouseout", function() {
      // compare_chart_tooltip.transition().duration(250).style('opacity', 0.9);
      // compare_chart_tooltip.html("<b>" + country + "</b>")
      d3.select("#"+compare_id+"_valueline")
         .transition()
         .duration(200)
         .style('stroke-width', "2px");
      d3.selectAll("#"+compare_id+"_dot")
         .transition()
         .duration(200)
         .style('r', "4px");
      d3.select(clicked_elements[country][0])
        .transition()
        .duration(200)
        .style("opacity", 1.0);

      d3.select("#small_chart_heading_"+compare_id)
        .transition()
        .duration(200)
        .style("font-size", "14px");

      // d3.selectAll(".line")
      //   .transition()
      //   .duration(100)
      //   .style("opacity", 1.0);
      // d3.selectAll("circle")
      //   .transition()
      //   .duration(100)
      //   .style("opacity", 1.0);
    })
}




function append_chart(d, metricByRange, yearByStats, metricByChartColor, clicked_elements) {
  var formatTime = d3.timeFormat("%Y");

  var margin = {top: 20, right: 10, bottom: 20, left: 30},
                width = 200 - margin.left - margin.right,
                height = 200 - margin.top - margin.bottom;

  var json_country = d.properties.name;
  var id = json_country.replace(/[^A-Z0-9]+/ig, "");

  var small_chart_height = height + 100;
  var small_chart_width = width;

  // set the ranges
  var x = d3.scaleLinear().range([0, small_chart_height-50]);
  var y = d3.scaleLinear().range([small_chart_width, 0]);

  x.domain([2014, 2019]);
  y.domain([-0.5, 4.0]); /* SCALE THIS ACCORDING TO MIN/MAX OF metric -- use a dictionary of metric: range */

  var small_chart = d3.select("#small_chart_area")
                        .append("svg")
                        .attr("class", "small_chart_class")
                        .attr("id", "small_chart_"+id)
                        .attr("width", small_chart_width + 150)
                        .attr("height", small_chart_height)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var small_chart_tooltip = d3.select("body")
                              .append("tooltip")
                              .attr("class", "small_chart_tooltip")
                              .style("opacity", 0);

  small_chart.append("text")
              .attr("id", "small_chart_heading_"+id)
              .attr("x", (small_chart_width / 2)+50)             
              .attr("y", 0 - ((margin.top / 2)-3))
              .attr("text-anchor", "middle")  
              .style("font-size", "14px")
              .style("font-weight", "bold")
              .style("fill", d.CountryColor)
              .text(json_country);

  var tickvalues = ["2014", "2015", "2016", "2017", "2018", "2019"];

  small_chart.append("g")
               .attr("id", "small-x-axis-"+id)
               .attr("class", "axis")
               .attr("transform", "translate(" + 15 + "," + (small_chart_height/2 + 25) + ")")
               .call(d3.axisBottom(x).ticks(6).tickValues(tickvalues).tickFormat(d3.format("d")));

  small_chart.append("text")             
              .attr("transform", "translate(" +  ((small_chart_width+70)/2) + "," + ((small_chart_height/2)+60) + ")")
              .style("text-anchor", "middle")
              .style("font-weight", "bold")
              .style("font-size", 10)
              .style("font-family", "Avenir")
              .style("fill", "#414141")
              .text("Year");     

  small_chart.append("g")
             .attr("id", "small-y-axis-"+id)
             .attr("class", "axis")
             .attr("transform", "translate(" + (small_chart_width/7 - 8) + ", 0)")
             .call(d3.axisLeft(y).ticks(5));

  
  for (var metric in metricByChartColor) {
    // console.log("APPENDING ", metric);
    append_line_small_chart(d, metric, yearByStats, metricByChartColor[metric], small_chart, x, y, clicked_elements, small_chart_tooltip/*, min, max*/);
  }

  small_chart.append("text")
                .attr("id", "small_y_label_"+id)
                .attr("transform", "rotate(-90)")             
                .attr("y", -14)
                .attr("x", 5 - (small_chart_width / 2))
                .style("text-anchor", "middle")
                .style("font-weight", "bold")
                .style("font-size", 10)
                .style("font-family", "Avenir")
                .style("fill", "#414141")
                .text("Country Metrics");  
}




function remove_chart(json_name) {
  // console.log("remove");
  // var country = json_d.properties.name;
  var id = json_name.replace(/[^A-Z0-9]+/ig, "");
  // console.log("REMOVING JSON NAME: ", id);

  d3.selectAll("#small_chart_"+id)
               .remove();
}




function clear_all(clicked_elements) {
  for (var clicked_country in clicked_elements) {
    // console.log("CLICKED COUNTRIES UPON CHANGE: ", clicked_country);
    remove_line(clicked_country, compare_chart);
    remove_chart(clicked_country);
    delete clicked_elements[clicked_country]
  }
  color = d3.scaleLinear()
                  .domain(metricByRange[metric]) 
                  .range(metricBycolors[metric]); 
  ready_update(year_slider.value, country_colors, metric, clicked_elements, metricBycolors);
}




/* Variables */

var country_colors = generate_country_colors();


var metricBycolors = { "Happiness Score": ["#ffffff", "#1d00ff"], 
                       "Happiness Rank": ["#ffffff", "#9103c2"],
                       "Economy (GDP per Capita)": ["#ffffff", "#0072f5"],
                       "Family": ["#ffffff", "#fc5a03"],
                       "Health (Life Expectancy)": ["#ffffff", "#008f68"],
                       "Freedom": ["#ffffff", "#ffa400"],
                       "Trust (Government Corruption)": ["#ffffff", "#ed0239"],
                       "Generosity": ["#ffffff", "#fc03ca"],
                       "Dystopia Residual": ["#ffffff", "#696969"] };

var metricByRange = { "Happiness Score": [2, 8], 
                      "Happiness Rank": [-5, 160], 
                      "Economy (GDP per Capita)": [0.0, 2.8], 
                      "Family": [0.0, 1.8],
                      "Health (Life Expectancy)": [0.0, 1.3], 
                      "Freedom": [-0.2, 1.0], 
                      "Trust (Government Corruption)": [-0.1, 1.0],
                      "Generosity": [-0.05, 0.9],
                      "Dystopia Residual": [-0.05, 3.5] };

var metricByChartColor = { "Economy (GDP per Capita)": "#0072f5", 
                           "Family": "#fc5a03",
                           "Health (Life Expectancy)": "#008f68", 
                           "Freedom": "#ffa400", 
                           "Trust (Government Corruption)": "#ed0239",
                           "Generosity": "#fc03ca",
                           "Dystopia Residual": "#696969" };

const metricByExplanation = {
                               "Happiness Score": "National happiness metrics are based on the averaged results of a Candril Ladder survey. Specifically, representative samples of respondents are asked to rate their lives on a scale of 0 to 10, 0 being their least desired quality of life, and 10 being the best possible lives for them. The sum total of all residuals in a specific country results in its Happiness Score.", 
                               "Happiness Rank": "An overall ranking of each country based on Happiness Scores, 1 signifying the happiest country.",
                               "Economy (GDP per Capita)": "GDP per Capita is a calculation of Purchasing Power Parity (PPP) adjusted to constant 2011 international dollars and extended for later years using country-specific forecasts of real GDP growth. Data is sourced from the November 2018 editions of the World Bank World Development Indicators (WDI) and the OECD Economic Outlook No.14 respectively. Figures are adjusted for population growth.",
                               "Family": "This measure of social support represented by the national average of binary answers to the question 'If you were in trouble, do you have relatives or friends you can count on to help you whenever you need them?' - 0 being 'No' and 1 being 'Yes'.",
                               "Health (Life Expectancy)": "Life Expectancy measures the number of healthy years a child at birth is estimated to live. It is based on extrapolations & interpolations of data calculated by the WHO in 2005, 2010, 2015, & 2016.",
                               "Freedom": "A measure of the freedom to make life choices. Specifically, it represents the average of the binary responses to the question 'Are you satisfied or dissatisfied with your freedom to choose what to do with your life?' - 0 being 'No' and 1 being 'Yes'.",
                               "Trust (Government Corruption)": "Trust levels represent the national average of binary answers to 2 questions: 1) 'Is corruption widespread throughout the government or not?' and 2) 'Is corruption widespread within businesses or not?' - 0 being 'No' and 1 being 'Yes'. ",
                               "Generosity": "Represents the national average of binary responses to the question 'Have you donated money to charity in the past month?' - 0 being 'No' and 1 being 'Yes'.",
                               "Dystopia Residual": "Dystopia represents a hypothetical country with the world's least-happy people - lowest GDP per capita, least freedom to make life choices, etc. It is used as a benchmark against which all countries can be favourably compared to."
                              }


var possible_metrics = document.getElementById("metric_selector");

var metric = "Happiness Score";

d3.select("#start_button").classed('button_pressed', true);

d3.select("#metric_details").html("<p style='font-size: 14px; padding-left: 30px; padding-right: 30px; padding-bottom: 3px;'>" + metricByExplanation[metric] + "</p>");



var margin = {top: 10, right: 10, bottom: 50, left: 20},
            width = 800 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;



/* Line Chart Code
 * References:
 * https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0
 * https://bl.ocks.org/d3noob/13a36f70a4f060b97e41 
 * https://bl.ocks.org/jonsadka/19f1366db3ff25195e650ec90d404092
 * Zooming Reference: https://bl.ocks.org/deristnochda/1ffe16ccf8bed2035ea5091ab9bb53fb
 */

var chart_zoom = d3.zoom()
  .scaleExtent([1, 3])
  .extent([100, 100], [compare_chart_width-100, compare_chart_height-100])
  .on("zoom", chart_zoomed);

function chart_zoomed() {
  compare_chart.selectAll(".line").attr("transform", d3.event.transform);
  compare_chart.selectAll(".compare_chart_circle").attr("transform", d3.event.transform);
  d3.selectAll('.line').style("stroke-width", 2/d3.event.transform.k);
  d3.selectAll('.compare_chart_circle').style("stroke-width", 2/d3.event.transform.k);
  compare_x_axis_g.call(compare_x_axis.scale(d3.event.transform.rescaleX(x)));
  compare_y_axis_g.call(compare_y_axis.scale(d3.event.transform.rescaleY(y)));
}


var compare_chart_height = height/2 + 100;
var compare_chart_width = width;

var x = d3.scaleLinear().range([0, compare_chart_width-50]);
var y = d3.scaleLinear().range([compare_chart_height, 0]);

x.domain([2014, 2019]);
y.domain(metricByRange[metric]);


var compare_chart = d3.select("#compare_area")
                      .append("svg")
                      .attr("id", "compare_chart")
                      .attr("width", compare_chart_width + 20 + 10)
                      .attr("height", compare_chart_height + margin.top + margin.bottom)
                      .call(chart_zoom)
                      .append("g")
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// Clipping
compare_chart.append('clipPath')
             .attr('id', 'clip')
             .append('rect')
             .attr("x", margin.left)
             .attr("y", margin.top)
             .attr("width", compare_chart_width)
             .attr("height", compare_chart_height);

compare_chart.append('g')
             .attr('class', 'main')
             .attr('clip-path', 'url(#clip)');

var compare_chart_tooltip = d3.select("body")
                              .append("tooltip")
                              .attr("class", "compare_chart_tooltip")
                              .style("opacity", 0);

var tickvalues = ["2014", "2015", "2016", "2017", "2018", "2019"];

var compare_x_axis = d3.axisBottom(x);
var compare_y_axis = d3.axisLeft(y);


var compare_x_axis_g = compare_chart.append("g")
                                     .attr("id", "x-axis")
                                     .attr("class", "x axis")
                                     .attr("transform", "translate(" + 30 + "," + (compare_chart_height/2 + 160) + ")")
                                     .call(compare_x_axis.ticks(6).tickValues(tickvalues).tickFormat(d3.format("d")));

compare_chart.append("text")             
              .attr("transform", "translate(" +  (compare_chart_width/2) + "," + (compare_chart_height/2 + 195) + ")")
              .style("text-anchor", "middle")
              .style("font-weight", "bold")
              .style("font-size", 14)
              .style("fill", "#414141")
              .text("Year"); 

var compare_y_axis_g = compare_chart.append("g")
                                     .attr("id", "y-axis")
                                     .attr("class", "y axis")
                                     .attr("transform", "translate(" + (compare_chart_width/7 - 80) + ", 0)")
                                     .call(compare_y_axis.ticks(10));

compare_chart.append("text")
              .attr("id", "y_label")
              .attr("transform", "rotate(-90)")             
              .attr("y", -5)
              .attr("x",0 - (compare_chart_height / 2))
              .style("text-anchor", "middle")
              .style("font-weight", "bold")
              .style("font-size", 14)
              .style("fill", "#414141")
              .text(metric);  


/* Map Code */

var projection = d3.geoMercator()
                   .scale(128)
                   .translate([(width/2)+10, (height/1.5)]);


var path = d3.geoPath()
        .projection(projection);


var color = d3.scaleLinear()
                  .domain(metricByRange[metric])
                  .range(metricBycolors[metric]); 

/* Limiting Zoom Translation Source: https://gist.github.com/emepyc/7218bc9ea76951d6a78b0c7942e07a00 */
// var dims = {
//     width: 800,
//     height: 300,
//     svg_dx: 100,
//     svg_dy: 100
// };

var zoom = d3.zoom()
             // .extent([[dims.svg_dx, dims.svg_dy], [dims.width-(dims.svg_dx*2), dims.height-dims.svg_dy]])
             .scaleExtent([1, 10])
             // .translateExtent([[dims.svg_dx, dims.svg_dy], [dims.width-(dims.svg_dx*2), dims.height-dims.svg_dy]])
             .on('zoom', zoomed);


var svg = d3.select("#map_area")
            .append("svg")
            .attr("id", "map")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("tranform", "translate(0" + margin.left + "," + margin.top + ")");


svg.call(zoom);



var tooltip = d3.select("body")
                .append("tooltip")
                .attr("class", "tooltip")
                .style("opacity", 0);


var yearByStats = {};
var clicked_elements = {};

d3.queue()
    .defer(d3.csv, "world-happiness/2015.csv")
    .defer(d3.csv, "world-happiness/2016.csv")
    .defer(d3.csv, "world-happiness/2017.csv")
    .defer(d3.csv, "world-happiness/2018.csv")
    .defer(d3.csv, "world-happiness/2019.csv")
    .await(function(error, d2015, d2016, d2017, d2018, d2019) {
        yearByStats['2015'] = d2015;
        yearByStats['2016'] = d2016;
        yearByStats['2017'] = d2017;
        yearByStats['2018'] = d2018;
        yearByStats['2019'] = d2019;
        ready('2015', country_colors, metric, clicked_elements);
    });



/* Legend References:
 * https://bl.ocks.org/duspviz-mit/9b6dce37101c30ab80d0bf378fe5e583
 */

  var legend_w = 300, legend_h = 50;

  var key = d3.select("#metric_legend")
              .append("svg")
              .attr("width", legend_w)
              .attr("height", legend_h);

  var metric_legend = key.append("defs")
                          .append("svg:linearGradient")
                          .attr("id", "gradient")
                          .attr("x1", "0%")
                          .attr("y1", "100%")
                          .attr("x2", "100%")
                          .attr("y2", "100%")
                          .attr("spreadMethod", "pad");

  metric_legend.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "white")
                .attr("stop-opacity", 1);

  metric_legend.append("stop")
              .attr("id", "metric_legend_stop2")
              .attr("offset", "100%")
              .attr("stop-color", metricBycolors[metric][1])
              .attr("stop-opacity", 1);

  key.append("rect")
        .attr("width", legend_w)
        .attr("height", legend_h - 30)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(0,10)");

  var y_legend = d3.scaleLinear()
                    .range([300, 0])
                    .domain(metricByRange[metric].slice().reverse());

  var yAxis_legend = d3.axisBottom()
                        .scale(y_legend)
                        .ticks(5);

  key.append("g")
      .attr("class", "y axis")
      .attr("id", "legend_axis1")
      .attr("transform", "translate(10,30)")
      .call(yAxis_legend)
      .append("text")
      .attr("y", -30)
      .attr("x", 55)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Least Happy");

 key.append("g")
      .attr("class", "y axis")
      .attr("id", "legend_axis2")
      .attr("transform", "translate(10,30)")
      .call(yAxis_legend)
      .append("text")
      .attr("y", -30)
      .attr("x", legend_w-10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Most Happy");




function ready(year, country_colors, metric, clicked_elements) {
  
  csv_data = yearByStats[year];
  // console.log("CSV Data changed to yearByStats["+year+"]");

  d3.json("js/world_countries.json", function(json) {
      // console.log("COUNTRIES", json);
      for (var i = 0; i < csv_data.length; i++) {
        var dataCountry = csv_data[i].Country;
        var dataHappinessScore = parseFloat(csv_data[i]["Happiness Score"]);
        var dataHappinessRank = parseFloat(csv_data[i]["Happiness Rank"]);
        // var dataStandardError = parseFloat(csv_data[i]["Standard Error"]);
        var dataGDP_per_Capita = parseFloat(csv_data[i]["Economy (GDP per Capita)"]);
        var dataFamily = parseFloat(csv_data[i]["Family"]);
        var dataHealth_Life_Expectancy = parseFloat(csv_data[i]["Health (Life Expectancy)"]);
        var dataFreedom = parseFloat(csv_data[i]["Freedom"]);
        var dataTrust_Government_Corruption = parseFloat(csv_data[i]["Trust (Government Corruption)"]);
        var dataDystopiaResidual = parseFloat(csv_data[i]["Dystopia Residual"]);
        var dataGenerosity = parseFloat(csv_data[i]["Generosity"]);
        var dataYear = parseFloat(csv_data[i]["Year"]);
        // console.log(dataHappinessScore);
        for (var j = 0; j < json.features.length; j++) {
          var jsonCountry = json.features[j].properties.name;
          if (dataCountry == jsonCountry) {
            // console.log(dataYear, dataCountry, jsonCountry, dataHappinessScore);
            json.features[j].properties.HappinessRank = dataHappinessRank;
            json.features[j].properties.HappinessScore = dataHappinessScore;
            // json.features[j].properties.StandardError = dataStandardError;
            json.features[j].properties.EconomyGDPperCapita = dataGDP_per_Capita;
            json.features[j].properties.Family = dataFamily;
            json.features[j].properties.HealthLifeExpectancy = dataHealth_Life_Expectancy;
            json.features[j].properties.Freedom = dataFreedom;
            json.features[j].properties.TrustGovernmentCorruption = dataTrust_Government_Corruption;
            json.features[j].properties.DystopiaResidual = dataDystopiaResidual;
            json.features[j].properties.Generosity = dataGenerosity;
            // console.log(j);
            json.features[j].CountryColor = country_colors[j];
            json.features[j].properties.Year = dataYear;
            break;
          } else if (dataCountry == "United States" && jsonCountry == "United States of America" || 
                dataCountry == "Congo (Kinshasa)" && jsonCountry == "Democratic Republic of the Congo" || 
                dataCountry == "Congo (Brazzaville)" && jsonCountry == "Republic of the Congo" ||
                dataCountry == "Somaliland region" && jsonCountry == "Somaliland" || 
                dataCountry == "Tanzania" && jsonCountry == "United Republic of Tanzania" || 
                dataCountry == "Guinea" && jsonCountry == "Equatorial Guinea" || 
                dataCountry == "Serbia" && jsonCountry == "Republic of Serbia") {
            json.features[j].properties.HappinessRank = dataHappinessRank;
            json.features[j].properties.HappinessScore = dataHappinessScore;
            // json.features[j].properties.StandardError = dataStandardError;
            json.features[j].properties.EconomyGDPperCapita = dataGDP_per_Capita;
            json.features[j].properties.Family = dataFamily;
            json.features[j].properties.HealthLifeExpectancy = dataHealth_Life_Expectancy;
            json.features[j].properties.Freedom = dataFreedom;
            json.features[j].properties.TrustGovernmentCorruption = dataTrust_Government_Corruption;
            json.features[j].properties.Generosity = dataGenerosity;
            json.features[j].properties.DystopiaResidual = dataDystopiaResidual;
            json.features[j].CountryColor = country_colors[j];
            json.features[j].properties.Year = dataYear;
            break;
          } else {
            json.features[j].CountryColor = country_colors[j];
          }
        }
      }

    // console.log("Json data changed to ", year, json)
    var metric_nospecials = metric.replace(/[^A-Z0-9]+/ig, "");
    // console.log("NOSPECIALS: ", metric_nospecials);
    // console.log(json["features"][0]["properties"][metric_nospecials]);
    // console.log(json.features[0].properties.TrustGovernmentCorruption);

    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("class", "path.map")
        .attr("d", path)
        .attr("fill", function(d) {
          var year = d.properties.Year;
          var metric_value = d["properties"][metric_nospecials];
          // console.log('METRIC VALUE: ', metric_value);
          if (metric_value && metric_value > -1) {
            return color(metric_value);
          } else {
            return "#4A4A4A";
          }
        })
        .on("mouseover", function(d) {
          // console.log("Mouseover json changed to ", d.properties.Year);
          var country = d.properties.name;
          var metric_value = 0;

          if (!d["properties"][metric_nospecials]) {
            metric_value = "<b style='color: red;'>Unavailable</b>";
          } else {
            metric_value = d["properties"][metric_nospecials].toFixed(2);
          }


          d3.select(this).style("opacity", 0.4);

          var id = d.properties.name.replace(/[^A-Z0-9]+/ig, "");
          d3.select("#"+id+"_valueline")
             .transition()
             .duration(200)
             .style('stroke-width', "4px");
          d3.selectAll("#"+id+"_dot")
             .transition()
             .duration(200)
             .style('r', "8px");

          d3.selectAll(".line")
            .style("opacity", 0.4);
          d3.select("#"+id+"_valueline")
            .style("opacity", 1);

          d3.selectAll(".compare_chart_circle")
            .style("opacity", 0.4);
          d3.selectAll("#"+id+"_dot")
            .style("opacity", 1);

          d3.select("#small_chart_heading_"+id)
                  .transition()
                  .duration(200)
                  .style("font-size", "18px");

          tooltip.transition()
                 .duration(200)
                 .style("opacity", 0.9)
                 .style("left", (d3.event.pageX + 20) + "px")   
                 .style("top", (d3.event.pageY + 5) + "px");

          // console.log("TOOLTIP: ", d);
          if (country == "Antarctica") {
            tooltip.html(function() {
                      return ("<b> Continent: </b>" + country + "</br><b>Year: </b>" + year + "</br><b>" + metric + ": </b>" + metric_value + "</br>")
                    });
          } else {
            tooltip.html(function() {
                      return ("<b> Country: </b>" + country + "</br><b>Year: </b>" + year + "</br><b>" + metric + ": </b>" + metric_value + "</br>")
                    });
          }
      })
      .on("mouseout", function(d) {
        var id = d.properties.name.replace(/[^A-Z0-9]+/ig, "");
        d3.selectAll("#"+id+"_dot")
                     .transition()
                     .duration(200)
                     .style('r', "4px");
        d3.select("#"+id+"_valueline")
           .transition()
           .duration(200)
           .style('stroke-width', "2px");

        d3.selectAll(".line")
            .style("opacity", 1.0);

        d3.selectAll(".compare_chart_circle")
            .style("opacity", 1.0);


        d3.select("#small_chart_heading_"+id)
                  .transition()
                  .duration(200)
                  .style("font-size", "14px");

        d3.select(this).style("opacity", 1.0)

        tooltip.transition()
           .duration(500)
           .style("opacity", 0);

        compare_chart_tooltip.transition().duration(200).style('opacity', 0);
      })
      .on("click", function(d) {
        // https://jsfiddle.net/xcn35ycm/4/
        if (!d3.select(this).classed("selected")) {
          d3.select(this).classed("selected", true)
          d3.select(this).transition().attr("fill", d.CountryColor);
          clicked_elements[d.properties.name] = [this, d];
          append_line(d, metric, yearByStats, compare_chart, x, y, compare_chart_tooltip, clicked_elements);
          append_chart(d, metricByRange, yearByStats, metricByChartColor, clicked_elements);
        } else {
          d3.select(this).classed("selected", false);
          d3.select(this).transition().attr("stroke", "none");
          d3.select(this).transition().attr("fill", function() {
            var metric_value = d["properties"][metric_nospecials];
            if (metric_value) {
            // console.log(year);
            // console.log(d.properties.name, year, value, color(value));
            return color(metric_value);
            } else {
              return "#4A4A4A";
            }
          })
          delete clicked_elements[d.properties.name];
          remove_line(d.properties.name, compare_chart);
          remove_chart(d.properties.name);
        }
        // console.log(clicked_elements);
      });
  });
}


/* Update Functions */

var slider = d3.select('#year_slider');

slider.on('change', function() { 
  ready_update(this.value, country_colors, metric, clicked_elements, metricBycolors);
});



possible_metrics.onclick = function (e) { 
  // console.log(e);
  metric = e.target.title;
  // console.log("METRIC CHANGE: ", metric);
  y.domain(metricByRange[metric]); 
  d3.select("#y-axis").call(d3.axisLeft(y).ticks(10));
  compare_chart.select("#y_label")
                .text(metric);
  clear_all(clicked_elements);
  d3.selectAll(".button").classed('button_pressed', false);
  d3.select(e.target).classed('button_pressed', true);
  d3.select("#metric_details").html("<p style='font-size: 14px; padding-left: 30px; padding-right: 30px; padding-bottom: 10px;'>" + metricByExplanation[metric] + "</p>");
  d3.select("#metric_header").html("<h1 style='font-size:18px; color:" + metricBycolors[metric][1] + ";'>" + metric + "</h1>")
  update_legend();
  ready_update(year_slider.value, country_colors, metric, clicked_elements, metricBycolors);
};
