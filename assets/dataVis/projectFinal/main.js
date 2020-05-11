const mapProp = { 
    width: 960, height: 500 
}
const plotProp = { 
    width: 500, height: 500,
    top: 10, right: 10, bottom: 75, left: 75,
    padding: 10
}
const barsProp = {
    width: 900, height: 1500,
    top: 10, right: 10, bottom: 75, left: 200,
    padding: 5
}

const projection = d3.geoNaturalEarth1();
const path = d3.geoPath().projection(projection);
const graticule = d3.geoGraticule()

const svg_map = d3.select('#chart')
  .attr('width', mapProp.width)
  .attr('height', mapProp.height);

const svg_plot = d3.select('#chart2')
  .attr('width', plotProp.width)
  .attr('height', plotProp.height);

const svg_bars = d3.select('#chart3')
    .attr('width', barsProp.width)
    .attr('height', barsProp.height);

let brushedCountries = []
  
// DATA LOADING -------------------------------------------------------------

let data = d3.map();
var promises = [
    d3.json(topolink),
    d3.csv(datalink, row => { //SOCIAL,HEALTH,FREEDOM,GENEROSITY,CORRUPTION
        let score = parseFloat(row.SCORE), gdp = parseFloat(row.GDP), social = parseFloat(row.SOCIAL), health = parseFloat(row.HEALTH), 
            freedom = parseFloat(row.FREEDOM), generosity = parseFloat(row.GENEROSITY), corruption = parseFloat(row.CORRUPTION);
        data.set(row.COUNTRY, {
            'name': row.COUNTRY, //storage for bars
            'score': score,
            'gdp': gdp, //gdp per capita
            'social': social, //social support
            'health': health, //healthy life expectancy
            'freedom': freedom, //freedom to make life choices
            'generosity': generosity, //generosity
            'corruption': corruption, //perceptions of corruption
            'residual': score - gdp - social - health - freedom - generosity - corruption
        })
    })
]

Promise.all(promises).then(ready)

let colorScale = d3.scaleLinear();

// MAIN MAP -------------------------------------------------------------

const world = svg_map.append("g");
const coords = world.append("g")
const countries = world.append("g");

let tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 1);

let c; //temp maped country data for null checks

function ready([topo])
{
    colorScale.domain(d3.extent(data.values(), d => d.score ))
        .range(['darkred', 'yellow'])
    
    coords.append("path")
        .datum(graticule)
        .attr("d", path)
        .style('stroke', 'lightgrey')
        .style('fill', 'none');
        
    coords.append("path")
        .datum(graticule.outline)
        .attr("d", path)
        .style('fill', 'none');

    countries
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style('fill', 'black')
        //tooltip functions
        .on('mouseenter', (d) => tooltip.transition()
            .style("opacity", 1)
            .text(d.properties.name + " " + 
                ((c = data.get(d.properties.name)) != null ? c.score : "--")))
        .on('mousemove', () => tooltip
            .style("top", (d3.event.pageY + 10)+"px")
            .style("left",(d3.event.pageX + 10)+"px"))
        .on('mouseout', () => tooltip.transition()
            .style("opacity", 0))
    selectCountries();
    makePlot();
    makeBars();
}

function selectCountries(){
    countries.selectAll('path')
        .transition()
        .duration(100)
        .style('fill', d => {
            //check if name exists in lookup
            if((c = data.get(d.properties.name)) != undefined){
                //apply color when in brush (or no brush)
                return brushedCountries.includes(d.properties.name) || brushedCountries.length == 0
                    ? colorScale(c.score)
                    : 'grey';
            }else{
                return 'rgb(60,60,60)'; //dark grey color for NO DATA
            }
        });
}

// MAP PAN/ZOOM -------------------------------------------------------------

const zoom = d3.zoom()
    .scaleExtent([1, 6])
    .translateExtent([[0, 0], [mapProp.width, mapProp.height]])
    .on('zoom', d => {
        //pan and zoom the world 
        world.attr("transform", d3.event.transform)
        //maintain stroke width
        world.selectAll("path")
            .style('stroke-width', 1 / d3.event.transform.k)
    });
svg_map.call(zoom);

//BUTTONS -------------------------------------------------------------

let f = "GDP"; //factor

let buttons = document.getElementsByTagName('button');
for(let i = 0; i< buttons.length; i++){
    //each button sets factor and adjusts plot
    buttons[i].addEventListener('click', function(){
        f = buttons[i].innerHTML;
        makePlot()
        showBarFactor(f.toLowerCase())
    })
}

//get data property by factor f
function factor(d){
    switch(f){
      case "Happiness":  return d.score;
      //adjusted to percentage
      case "GDP":        return d.gdp / d.score;
      case "Social":     return d.social / d.score;
      case "Health":     return d.health / d.score;
      case "Freedom":    return d.freedom / d.score;
      case "Generosity": return d.generosity / d.score;
      case "Corruption": return d.corruption / d.score;
      case "Residual":   return d.residual / d.score;
    }
}

// CHART 2 SETUP -------------------------------------------------------------

const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

const xAxis = svg_plot.append('g')
    .attr('transform', `translate(${0}, ${plotProp.height - plotProp.bottom})`);

const yAxis = svg_plot.append('g')
    .attr('transform', `translate(${plotProp.left}, ${0})`);

const xAxisLabel = svg_plot.append('text')
    .attr('transform', `translate(${plotProp.width/2}, ${plotProp.height - plotProp.bottom/2})`)
    .attr('text-anchor', 'middle');

const yAxisLabel = svg_plot.append('text')
    .attr('transform', `translate(${plotProp.left/2}, ${plotProp.height/2}) rotate(-90)`)
    .attr('text-anchor', 'middle')    

const points = svg_plot.append("g")
    .style('stroke-width', 1)
    .style('stroke', 'black')

//BRUSH -------------------------------------------------------------
let x0, y0, x1, y1; //brush coords

const brush = d3.brush().on('start.color brush.color end.color', () => {
    const selection = d3.event.selection;
      if (selection){
        [[x0, y0], [x1, y1]] = selection;
        brushedCountries = []
        points.selectAll('circle')
            .style('stroke-opacity', d => brushSelection(d) ? 1 : 0.2) 

        selectCountries();
      }
});

//checks if country is within the brush
function brushSelection(d){
    let x = parseFloat(xScale(factor(data.get(d))))
    let y = parseFloat(yScale(data.get(d).score));
    let contains = x0 <= x && x <= x1 && y0 <= y && y <= y1
    if(contains){ 
        brushedCountries.push(d);
    }
    return contains;
}

const brushStartingExtent = [[100, 10], [140, 50]];    

svg_plot.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, brushStartingExtent);

// CHART 2 -------------------------------------------------------------

//display the plot of selected factor
function makePlot(){
    xScale.domain(d3.extent(data.values(), d => factor(d) ))
        .range([plotProp.left + plotProp.padding, plotProp.width - plotProp.right - plotProp.padding]);

    yScale.domain(d3.extent(data.values(), d => d.score))
        .range([plotProp.height - plotProp.bottom - plotProp.padding,  plotProp.top + plotProp.padding]);

    brushedCountries = []

    points.selectAll('circle')
        .data(data.keys(), d => d)
        .join(
            enter => enter
                .append('circle')
                    .attr('cx', d => xScale(factor(data.get(d))))
                    .attr('cy', d => yScale(data.get(d).score))
                    .attr('r', 5)
                    .style('fill', d => colorScale(data.get(d).score)),
            update => update
                .call(update => update
                    .transition()
                    .duration(500)
                    .delay((d, i) => i * 2)
                    .attr('cx', d => xScale(factor(data.get(d))))
                    .style('stroke-opacity', d => brushSelection(d) ? 1 : 0.2) //update the brush selection
                )
        );

    selectCountries();

    yAxis.call(d3.axisLeft(yScale));
    xAxis.call(d3.axisBottom(xScale));
      
    yAxisLabel.text("Happiness");
    xAxisLabel.text(f + "%");
}

//BARS -------------------------------------------------------------

let keys = ["gdp", "social", "health", "freedom", "generosity", "corruption", "residual"]

const xScale2 = d3.scaleLinear();
const yScale2 = d3.scaleBand().padding([0.05]);

const xAxis2 = svg_bars.append('g')
    .attr('transform', `translate(${0}, ${barsProp.height - barsProp.bottom})`);

const yAxis2 = svg_bars.append('g')
    .attr('transform', `translate(${barsProp.left}, ${0})`);

let inf = (t) => d3.interpolateOrRd(t);
const cScale2 = d3.scaleOrdinal()
    .domain(keys)
    .range([inf(0.16), inf(0.32), inf(0.48), inf(0.54), inf(0.7), inf(0.86), inf(1)])

//kacky way that gets the key from fill
const cScale2Inv = d3.scaleOrdinal()
    .domain([inf(0.16), inf(0.32), inf(0.48), inf(0.54), inf(0.7), inf(0.86), inf(1)])
    .range(keys)

//deselect rect
svg_bars.append('rect').attr('x', -20).attr('y', -20).attr('width', barsProp.width+40).attr('height', barsProp.height+40)
    .style('opacity', 0)
    .on('click', () => {
        console.log("DUDE");
        showBarFactor(null)
    })

    let bars = svg_bars.append('g');

function makeBars(){

    xScale2.domain([0, d3.max(data.values(), d => d.score)])
        .range([barsProp.left + barsProp.padding, barsProp.width - barsProp.right - barsProp.padding]);

    yScale2.domain(data.keys())
        .range([barsProp.height - barsProp.bottom - barsProp.padding,  barsProp.top + barsProp.padding]);

    bars.selectAll("g")
        .data(d3.stack().keys(keys)(data.values()))
        .join(
            enter => enter.append("g")
                .attr("fill", d => cScale2(d.key))
                .selectAll("rect")
                .data(d => d)
                .enter()
                .append("rect")
                .attr("y", d => yScale2(d.data.name))	    
                .attr("x", d =>  xScale2(d[0]))			    
                .attr("width", d=> xScale2(d[1]) - xScale2(d[0]))
                .attr("height", yScale2.bandwidth())
                .on('mouseenter', function(d, i){
                    d3.select(this).style('opacity', 0.75);
                    let k = cScale2Inv(d3.select(this).style('fill')); //get key
                    tooltip.transition()
                        .style("opacity", 1)
                        .text(d.data.name + " " + k + ":"+ d.data[k].toFixed(2));
                })
                .on('mousemove', () => tooltip
                    .style("top", (d3.event.pageY + 10)+"px")
                    .style("left",(d3.event.pageX + 10)+"px"))
                .on('mouseout', function(){
                    d3.select(this).style('opacity', 1)
                    tooltip.transition()
                        .style("opacity", 0)
                })      
        );

    yAxis2.call(d3.axisLeft(yScale2));
    xAxis2.call(d3.axisBottom(xScale2));
}

//BARS LEGEND -------------------------------------------------------------

const boxSize = 20
let legend = svg_bars.append("g")
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys)
    .enter().append("g")
    .attr("transform", (d, i) => "translate(0," + i * (boxSize) +")");

legend.append("rect")
    .attr("x", barsProp.width - boxSize)
    .attr("width", boxSize)
    .attr("height", boxSize)
    .attr("fill", d=> cScale2(d))
    .on('mouseover', function(){d3.select(this).style('opacity', 0.75)})
    .on('mouseout', function(){d3.select(this).style('opacity', 1)})
    .on('click', (d) => showBarFactor(d));

legend.append("text")
    .attr("x", barsProp.width - boxSize-2)
    .attr("y", boxSize/2)
    .attr("dy", "0.32em")
    .text(d => d);

function showBarFactor(f){
    bars.selectAll('g')
        .transition()
        .duration(500)
        .style('fill', d => d.key == f || f == null ? cScale2(d.key) : 'white')
}