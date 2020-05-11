Data collected from:
https://www.kaggle.com/dipam7/student-grade-prediction

# Acquire and Clean Data Set

The dataset was mostly clean to begin with. Since the data was collected from a number of countries I'm guessing that it was sent out as an online survey.

There were a couple of variables that contained data that coded for other variables
For example, study time was "weekly study time (numeric: 1 - <2 hours, 2 - 2 to 5 hours, 3 - 5 to 10 hours, or 4 - >10 hours)"
I thought about using OpenRefine to rename the variables to the value they coded for but instead opted for converting within the row converter using a dictionary

# Analyze the Data Set

My Dependent Variable was always going to be the discrete variable for scores

The other variables that might affect scores were all Nominal so I decided to go with the 'yes' / 'no' response questions because they seemed the most likely to me to produce an effect. 

I also wanted to make a separate section for test scores because that seemed like a given for impacting scores and wanted to at least make sure that worked.

# Develop your visualization

I didn't want to just reduce the groups down to a single average so I decided to show the counts for each each grade.
I wasn't sure the best way to go about that so I started with a heatmap and them moved on to using circles for study time which to me seems like the stronger visualization. For interactivity I showed the count for each grade when it's hovered over

# Iterate 

I then went back and made it work with all 3 grades to help me see if the data changed over time
I struggled a lot with the data binding part of this but finally managed to figure out how to make each data point map well to itself for a smooth transition. 

# Finalizing Design

I broke the visualization and interpretations into sections to help group them together and hopefully make the page a little clearer