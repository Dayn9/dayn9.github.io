How you worked with the data.
- Had to do some slight editing of Country names in the Happiness Report to get them synced up with Topo.json

What you analyzed about the data in terms of data variables and how that informed your choice of visualization.
- the data was about contributing factors to the happiness score. This meant I couldn't just plot something like GDP vs Happiness, so instead I used the percentage of the score that could be explained by each variable. This helps to show the influence of each of the factors regardless of the total happiness score 

Your design for the visualization: what channels and marks are in use and why did you choose them? What scales and axes are in use and why did you use them?
     What other information (e.g., legends) did you use and why did you use them?
- I used the map to show the country's to get a feel for geographic location 
    - and point in scatter plot to show relative percentages
- color to show the happiness ( yellow because of it's association)
- length of each bar: happiness
    - segments of bar: each of the factors

What are the interactions in the visualization? Why did you use each one? What aspect of working with data does the interaction address?
- brushing to see the selected countries on the map
- tooltip on countries to show name and score
- tooltip on stacked bars to show individual factors

Your development process.
- I started with the map, which was actually the most challenging part for me as there was a lot of conflicting info and methods on how to set this up.
- I then made the simple factor scatter plot with transitions to see each of the factors
- I added brushing to the scatterplot and linked the selected countries in the choropleth 
- This still wasn't to helpful for seeing all the data at once so I made a stacked bar chart by country to show the overall trend
- I wanted to link the bar chart to the brush somehow but got super lost while trying to figure that one out. 

Overall project experience
