var margin_h = { top: 80, right: 0, bottom: 30, left: 75 },
    row_num = cluster_names.length,
    col_num = marker_names.length,
    width_h = width_window*0.6 - margin_h.left - margin_h.right,  //
    height_h = height_window*0.45 - margin_h.top - margin_h.bottom, //
    gridSize = Math.min(width_h / col_num, height_h/row_num),
    legendWidth = gridSize ;

    margin_h.top = Math.max(margin_h.top, (height_h + margin_h.top + margin_h.bottom)/2 - cluster_names.length * gridSize/2);

 
 //color -> mean 

var maxMean = d3.max(d3.max(mean_matrix))[0],
    maxMean = Math.floor(maxMean)+1,
    colors_h = ["#006837","#1a9850","#66bd63","#a6d96a","#d9ef8b","#fee08b","#fdae61","#f46d43","#d73027","#a50026"];
var colorScale_h = d3.scale.quantile()    // is a function
    .domain([0, maxMean])
    .range(colors_h);
    

var heatmap_group = d3.selectAll("svg")
        .append("g")
        .attr("id","heatmap")
        .attr("width", width_h)
        .attr("height", height_h)      
        .attr("transform", "translate(" + margin_h.left + "," + margin_h.top + ")");

// initial
data_heatmap = DataForHeatmap(hcrow, hccol);
data_rowlabel = DataForRowLabel(hcrow);
data_collabel = DataForColLabel(hccol);
draw_heatmap(data_heatmap, data_rowlabel, data_collabel);

function clearHeatmap() {

        d3.selectAll(".marker_names").remove();
        d3.selectAll(".cluster_names").remove();
        d3.selectAll(".square").remove();
  
}
function RefreshHeatmap() {
  draw_heatmap(data_heatmap, data_rowlabel, data_collabel);
  d3.select("#highlight").classed("hidden", true); 
}

function draw_heatmap(x_heatmap, y_rowlabel, z_collabel)
{
  clearHeatmap();
  var rowLabels = heatmap_group.append("g")
      .selectAll(".rowLabel")
      .data(y_rowlabel)
      .enter().append("text")
        .text(function (d) { return d.name; })
        .attr("x", 0)
        .attr("y", function (d) { return d.sort * gridSize; })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", function (d,i) { return "cluster_names mono r" + i;})
        .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
        .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
        .on("click", function(d,i) {
        // i = d.sort
        //console.log(d.index);
        ShowChordCluster(d.index);
        showParallelCluster(d.index);
        //ClickLegendParallel(d.index);

        //ClusterSorting
        newhccol = ClusterSorting(d.index);
        data_newcollabel = DataForColLabel(newhccol);
        data_clustersorting = DataForHeatmap(hcrow, newhccol); 
 
        draw_heatmap(data_clustersorting, data_rowlabel, data_newcollabel);
          //update highlight position
        d3.select("#highlight")
               .style("height", (gridSize) + "px")
               .style("width", (gridSize * col_num ) + "px")
               .style("left", (margin_h.left + gridSize * 0.25) + "px")
               .style("top", (margin_h.top + (i+0.3)*gridSize ) + "px");
        
             //Show the highlight
        d3.select("#highlight").classed("hidden", false);  
        })

  //marker x axis -> col labels    
  var colLabels = heatmap_group.append("g")
      .selectAll(".colLabel")
      .data(z_collabel)
      .enter().append("text")
      .text(function(d) { return d.name; })
      .attr("x", 0)
      .attr("y", function (d) { return d.sort * gridSize;})//return d.sort * gridSize; })
      .style("text-anchor", "left")
      .attr("transform", "translate(" + gridSize / 1.5 + ", -6) rotate(-90)") 
      .attr("class", function (d,i) { return "marker_names mono r" + i;})
      .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
      .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
      .on("click", function(d,i) {
        ShowChordMarker(d.index);

        newhcrow = MarkerSorting(d.index);
        //data_rowlabel
        data_newrowlabel = DataForRowLabel(newhcrow);
        data_markersorting = DataForHeatmap(newhcrow, hccol);

        draw_heatmap(data_markersorting, data_newrowlabel, data_collabel);
        //update highlight position 
        d3.select("#highlight")
               .style("height", (gridSize * row_num ) + "px")
               .style("width", (gridSize) + "px")
               .style("left", (margin_h.left + (i+0.5)*gridSize) + "px")
               .style("top", (margin_h.top + gridSize/2) + "px");
        
             //Show the highlight
        d3.select("#highlight").classed("hidden", false);       
      })

  var heatMap = heatmap_group.append("g")
      .selectAll(".heatMap")
      .data(x_heatmap)
      .enter().append("rect")
      .attr("x", function(d) { return ((d.dim_col)  + (1-Math.sqrt(d.variance_nor ))/2 ) * gridSize; })
      .attr("y", function(d) { return ((d.dim_row)  + (1-Math.sqrt(d.variance_nor))/2) * gridSize; })
      .attr("rx", 1)
      .attr("ry", 1)
      .attr("class", "dim2 bordered")
      .attr("width", function(d){ return gridSize * Math.sqrt(d.variance_nor)})  
      .attr("height", function(d){ return gridSize * Math.sqrt(d.variance_nor)}) 
      .style("fill", '#aaa')
      .attr("class", "square")
      .on('mouseover', function(d) {
               //Update the tooltip position and value
               d3.select("#tooltip")
                 .style("left", (d3.event.pageX+10) + "px")
                 .style("top", (d3.event.pageY-10) + "px")
                 .select("#value")
                 .text("mean：" + d.mean + "\nvariance:" + d.variance);  
               //Show the tooltip
               d3.select("#tooltip").classed("hidden", false);

               //highlight text
               d3.select(this).classed("cell-hover",true);
               d3.selectAll(".cluster_names").classed("text-highlight", function(r,ri){ return ri==(d.dim_row);});
               d3.selectAll(".marker_names").classed("text-highlight", function(c,ci){ return ci==(d.dim_col);});
          })
      .on('mouseout', function(){
               d3.select(this).classed("cell-hover",false);
               d3.selectAll(".cluster_names").classed("text-highlight",false);
               d3.selectAll(".marker_names").classed("text-highlight",false);
               d3.select("#tooltip").classed("hidden", true);
             });        

    heatMap.transition()
        .style("fill", function(d) { return colorScale_h(d.mean); });
  }

  var legend = heatmap_group.selectAll(".legend")
      .data(colors_h)
      .enter().append("g")
      .attr("class", "legend");

  var margin_h_legend = margin_h.top - (height_h + margin_h.top + margin_h.bottom)/2 + colors_h.length/2 * legendWidth;

  legend.append("rect")
        .attr("x", gridSize * (col_num + 1))
        .attr("y", function(d, i) { return gridSize * i/1.5 - margin_h_legend ; })
        .attr("width", gridSize/1.5)
        .attr("height", gridSize/1.5)
        .style("fill", function(d) { return d; })
        //.attr("class", "square");


  var low = heatmap_group.append("text")
        .attr("class", "low")
        .attr("x", gridSize * (col_num + 2) )
        .attr("y", gridSize/2 - margin_h_legend)     
        .text("Low");
  var high = heatmap_group.append("text")
        .attr("class", "high")
        .attr("x", gridSize * (col_num + 2) )
        .attr("y", gridSize * 10/1.5 - margin_h_legend)     
        .text("High");

