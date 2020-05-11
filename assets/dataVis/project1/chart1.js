let chart1
let xScale1, yScale1, colorScale1, freqScale1;
let xAxisGroup1, yAxisGroup1;
let xAxisLabel1, yAxisLabel1;

function setupChart1(){
    chart1 = d3.select('#chart1')
      .attr('width', w)
      .attr('height', h);
  
    // X AXIS
    xAxisGroup1 = chart1.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${0}, ${h - margins.bottom})`);
  
    // Y AXIS
    yAxisGroup1 = chart1.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${margins.left}, ${0})`);
  
      // X AXIS LABEL
    xAxisLabel = chart1.append('text')
      .attr('transform', `translate(${w/2}, ${h - 20})`)
      .attr('class', 'label')
      .attr('text-anchor', 'middle')  
      .text('Study Time');
  
    //Y AXIS LABEL
    yAxisLabel1 = chart1.append('text')
      .attr('transform', `translate(${20}, ${h/2}) rotate(-90)`)
      .attr('text-anchor', 'middle')    
      .attr('class', 'label')
      .text('');
  }
  
  //make initial chart with x: study_time, y: grade
  function makeChart1(dataset, gradeType) {
   
    //grade type select
    function grade(d){
      switch(gradeType){
        case "First Period Grade": return d.grade_1;
        case "Second Period Grade": return d.grade_2;
        case "Final Grade": return d.grade_F;
      }
    }
  
    const MAX_RADIUS = 15; //maximum circle radius
    const AVG_WIDTH = 70; //width for the average indicators
  
    //padding for the axis
    const padding = {
      bottom: MAX_RADIUS + 5,
      left: 0
    }
  
    //reduce the dataset down to counts for each of the data points
    let reduced = dataset.reduce((acc, c) =>{
      let index = acc.findIndex(v => v.study_time === c.study_time && v.grade === grade(c))
      if(index == -1){
        acc.push({
          study_time: c.study_time,
          grade: grade(c),
          count: 1
        });
      }else{
        acc[index].count++;
      }
      return acc;
    }, []);
  
    //const times = [1, 2, 3, 4];
    const times = ["<2", "2-5", "5-10", ">10"] //TODO
  
    let averages = [];
    times.forEach((t) => {
      //filter the array to all elements with that study time
      filtered = reduced.filter(v => v.study_time == t);
      //get a total by adding up all the counts
      total = filtered.reduce((acc, c) => acc + c.count, 0)
      //add up all the grades and divide by total for average 
      averages.push(filtered.reduce((acc, c) => acc += c.grade * c.count, 0) / total);
    });
  
    xScale1 = d3.scaleBand()
      .domain(times)
      .rangeRound([margins.left + padding.left, w - margins.right]);
  
    yScale1 = d3.scaleLinear()
      .domain([0, 20])
      .rangeRound([h-margins.bottom - padding.bottom, margins.top]);
  
    colorScale1 = d3.scaleOrdinal()
      .domain(times)
      .range(['#A0A0E0','#6060A0','202060','000020']);

    freqScale1 = d3.scaleSqrt()
      .domain([1, d3.max(reduced, (d) => d.count)])
      .range([3, MAX_RADIUS]);
  
    const label = chart1.append('text')
      .attr('transform', `translate(${0}, ${0})`)
      .text('');
     
    //Show the averages on the chart
    chart1.selectAll('rect')
      .data(averages)
      .join(
        enter => enter
          .append('rect')
          .attr('x', (d, i) => xScale1(times[i]) - (AVG_WIDTH - xScale1.bandwidth()) / 2)
          .attr('y', (d, i) => yScale1(d))
          .attr('width', AVG_WIDTH)
          .attr('height', 3)
          .style('fill', 'grey'),
        update => update
          .call(update => update
            .transition()
            .duration(1000)
            .attr('y', (d, i) => yScale1(d)))
      ).on('mouseover', function(d, i){
        d3.select(this)
            .transition()
            .style('stroke', 'black')
            .style('stroke-opacity', 1);
  
        const xPos = parseFloat(d3.select(this).attr('x'));
        const yPos = parseFloat(d3.select(this).attr('y'));
  
        label.attr('transform', `translate(${xPos + AVG_WIDTH + 5}, ${yPos})`)
        .text(d.toPrecision(4))
  
      }).on('mouseout', function(d, i){
        d3.select(this)
            .transition()
            .style('stroke-opacity', 0);
  
        label.text('');
      });
  
    chart1.selectAll('circle')
      .data(reduced, d => `${d.study_time},${d.grade}`)
      .join(
        enter => enter
            .append('circle')
            .attr('cx', d => xScale1(d.study_time) + xScale1.bandwidth() / 2)
            .attr('cy', d => yScale1(d.grade))
            .attr('r', 0)
            .style('fill', d => colorScale1(d.study_time))
            .style('opacity', 0)
            .call(enter => enter
                .transition()
                .duration(1000)
                .attr('r', d => freqScale1(d.count))
                .style('opacity', 1)
                ),
        update => update
            .call(update => update
                .transition()
                .duration(1000)
                .attr('cx', d => xScale1(d.study_time) + xScale1.bandwidth() / 2)
                .attr('cy', d => yScale1(d.grade))
                .attr('r', d => freqScale1(d.count))
                .style('fill', d => colorScale1(d.study_time))
                .style('opacity', 1)
                ),
        exit => exit
            .call(exit => exit
                .transition()
                .duration(1000)
                .attr('r', 0)
                .style('opacity', 0)
                .remove()
                )
      ).on('mouseover', function(d, i){
        d3.select(this)
            .moveToFront()
            .transition()
            .style('stroke', 'black')
            .style('stroke-opacity', 1);
  
        const xPos = parseFloat(d3.select(this).attr('cx'));
        const yPos = parseFloat(d3.select(this).attr('cy'));
        const radius = parseFloat(d3.select(this).attr('r'));
  
        label.attr('transform', `translate(${xPos + radius + 5}, ${yPos})`)
        .text(d.count)
  
      }).on('mouseout', function(d, i){
        d3.select(this)
            .transition()
            .style('stroke-opacity', 0);
  
        label.text("");
      });
  
    yAxisGroup1.call(d3.axisLeft(yScale1));
    xAxisGroup1.call(d3.axisBottom(xScale1));
  
    yAxisLabel1.text(gradeType);
    xAxisLabel.text("Study Time");
  }