let chart2
let xScale2, yScale2, colorScale2, opacityScale2;
let xAxisGroup2, yAxisGroup2;
let xAxisLabel2, yAxisLabel2;

function setupChart2(){
    chart2 = d3.select('#chart2')
      .attr('width', w)
      .attr('height', h);
  
    // X AXIS
    xAxisGroup2 = chart2.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${0}, ${h - margins.bottom})`);
  
    // Y AXIS
    yAxisGroup2 = chart2.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${margins.left}, ${0})`);
  
      // X AXIS LABEL
    xAxisLabel2 = chart2.append('text')
      .attr('transform', `translate(${w/2}, ${h - 20})`)
      .attr('class', 'label')
      .attr('text-anchor', 'middle')  
      .text('');
  
    //Y AXIS LABEL
    yAxisLabel2 = chart2.append('text')
      .attr('transform', `translate(${20}, ${h/2}) rotate(-90)`)
      .attr('text-anchor', 'middle')    
      .attr('class', 'label')
      .text('');
  }
  
//make initial chart with x: study_time, y: grade
  function makeChart2(dataset, gradeType, optionType) {
   
    //grade type select
    function grade(d){
        switch(gradeType){
          case "First Period Grade": return d.grade_1;
          case "Second Period Grade": return d.grade_2;
          case "Final Grade": return d.grade_F;
        }
    }  

    function option(d){
      switch(optionType){
        case "School Support": return d.support_school;
        case "Home Support": return d.support_home;
        case "Extra Paid Classes": return d.paid;
        case "Extra-curricular Activities": return d.activities;
        case "Attended Nursery": return d.nursery;
        case "Internet Access": return d.internet;
        case "Romantic Relationship": return d.romantic;
      }
    }

    //padding for the axis
    const padding = {
      bottom: 0,
      left: 0
    }

    const response = ['yes', 'no'];
    const scores = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]

    let reduced = [];
    for(let s = 0; s < scores.length; s++){
        let r0 = dataset.filter(d => option(d) == response[0] && grade(d) == s).length;
        let r1 = dataset.filter(d => option(d) == response[1] && grade(d) == s).length;
        reduced.push({
            option: response[0],
            grade: s,
            count: r0
        })
        reduced.push({
            option: response[1],
            grade: s,
            count: r1
        })
    }

    let averages = [];
    response.forEach((r) => {
      //filter the array to all elements with that study time
      filtered = reduced.filter(d => d.option == r);
      //get a total by adding up all the counts
      total = filtered.reduce((acc, c) => acc + c.count, 0)
      //add up all the grades and divide by total for average 
      averages.push(filtered.reduce((acc, c) => acc += c.grade * c.count, 0) / total);
    });
  
    xScale2 = d3.scaleBand()
      .domain(response)
      .rangeRound([margins.left + padding.left, w - margins.right]);
  
    yScale2 = d3.scaleBand()
      .domain(scores)
      .rangeRound([h-margins.bottom - padding.bottom, margins.top]);

    let yScaleLin2 = d3.scaleLinear()
      .domain([0,20])
      .rangeRound([h-margins.bottom - padding.bottom, margins.top]);
    
    colorScale2 = d3.scaleLinear()
      .domain([0, d3.max(reduced, d => d.count)])
      .range(['coral', 'orange'])

    opacityScale2 = d3.scaleLinear()
      .domain([0, d3.max(reduced, d => d.count)])
      .range([0,1])
  
    const label = chart2.append('text')
      .attr('transform', `translate(${0}, ${0})`)
      .attr('text-anchor', 'middle') 
      .attr('text-align', 'center')
      .attr('alignment-baseline', 'middle')
      .attr('pointer-events','none')
      .text('');

    chart2.selectAll('rect')
      .data(reduced, d => `${d.option},${d.grade}`)
      .join(
        enter => enter
            .append('rect')
            .attr('x', d => xScale2(d.option))
            .attr('y', d => yScale2(d.grade))
            .attr('width', xScale2.bandwidth())
            .attr('height', yScale2.bandwidth())
            .style('fill', d => colorScale2(d.count))
            .style('opacity', 0)
            .call(enter => enter
                .transition()
                .style('opacity', d => opacityScale2(d.count))
                ),
        update => update
            .call(update => update
                .transition()
                .duration(1000)
                .style('fill', d => colorScale2(d.count))
                .style('opacity', d => opacityScale2(d.count))
                )
        //no exit call because no data point will be removed (only set to 0)
      ).on('mouseover', function(d){
        //show the outline
        d3.select(this)
            .transition()
            .style('stroke', 'black')
            .style('stroke-opacity', 1);
  
        //get the element's attributes
        const xPos = parseFloat(d3.select(this).attr('x'));
        const yPos = parseFloat(d3.select(this).attr('y'));
        const width = parseFloat(d3.select(this).attr('width'));
        const height = parseFloat(d3.select(this).attr('height'));

        //move the label to front and set text to count 
        label.attr('transform', `translate(${xPos + width/2}, ${yPos + height/2})`)
          .moveToFront()
          .text(d.count)
  
      }).on('mouseout', function(d){
        //hide the outline
        d3.select(this)
            .transition()
            .style('stroke-opacity', 0);

        //hide the text
        label.text("");
      });

    //Show the averages on the chart
    chart2.selectAll('circle')
      .data(averages)
      .join(
        enter => enter
          .append('circle')
          .attr('cx', (d, i) => xScale2(response[i]) + xScale2.bandwidth()/2)
          .attr('cy', (d, i) => yScaleLin2(d))
          .attr('r', 7)
          .style('fill', 'white')
          .style('stroke', 'lightgrey'),
        update => update
          .call(update => update
            .transition()
            .duration(1000)
            .attr('cy', (d, i) => yScaleLin2(d)))
      );
  
    //set the axis
    yAxisGroup2.call(d3.axisLeft(yScale2));
    xAxisGroup2.call(d3.axisBottom(xScale2));
  
    //set the labels 
    yAxisLabel2.text(gradeType);
    xAxisLabel2.text(optionType);
  }