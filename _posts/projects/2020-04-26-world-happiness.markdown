---
layout: post
title:  "2019 World Happiness Report"
date:   2020-04-25 11:15:33 -0400
tags: [d3, js] 
categories:  projects
image: /media/class/Map.png
---

Project for Data Visualization class analyzing and visualizing the 2019 world happiness report
<!--more-->

<script src="{{site.url}}/assets/dataVis/d3.v5.min.js"></script>
<script> 
const datalink = "{{site.url}}/assets/dataVis/projectFinal/world-happiness/2019.csv";
const topolink = "{{site.url}}/assets/dataVis/projectFinal/topo.json";
</script>
<script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>
<script src="http://d3js.org/topojson.v2.min.js"></script>

<style>
div.tooltip {	
  position: absolute;			
  text-align: center;						
  padding: 10px;				
  font: 16px sans-serif;		
  background: whitesmoke;	
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5);
  border: 0px;		
  border-radius: 5px;			
  pointer-events: none;			
}

path {
  stroke: #000;
}

</style>

The Happiness scores and rankings are from the Gallup World Poll. 
Happiness scores were based on the Cantril ladder question where respondents are asked to think of a ladder where 10 is the best possible life for them and 0 is the worst.
Finland scores the highest with 7.769 while South Sudan scoring the lowest with 2.853
<svg id='chart'></svg>

#### Contributions to Happiness

A number of factors were measured in relation to 'Dystopia' a fake county that takes all of the lowest scores from eachfactor.
Below is the percentage of the Happiness that can be explained by each of the factors. 
Percentages are more helpful for picking out at trends as the relative scores are typically greater for countries thathave higher total Happiness

**Residual** refers to the unexplained contributions to the Happiness score.

<div class="buttons">
  <button>GDP</button>
  <button>Social</button>
  <button>Health</button>
  <button>Freedom</button>
  <button>Generosity</button>
  <button>Corruption</button>
  <button>Residual</button>
</div>

<svg id='chart2'></svg>

#### Breakdown by Country

**GDP** appears to have a somewhat positive correlation with happiness. Countries where GDP has a larger positive effect are also happier.
**Social Support** has a stable relationship with happiness scores with most countries hover around 20 - 25%.
**Corruption** has a similarly consistent but low result (with the outlier of Rwanda) indicating that Corruption doesn't help to increase happiness

<svg id='chart3'></svg>

While a large portion of each countries happiness score is residual, GDP per captia, Social Support, and Healthy Life Expectancy seem to be the best predictors of happiness

[Data Source on Kaggle](https://www.kaggle.com/unsdsn/world-happiness)

<script src='{{site.url}}/assets/dataVis/projectFinal/main.js'></script>
