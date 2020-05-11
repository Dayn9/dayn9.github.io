---
layout: post
title:  "Educational Trends"
date:   2020-03-23 11:15:33 -0400
tags: [d3, js] 
categories:  projects
image: /media/class/Study.png
---

Project for Data Visualization class analyzing and visualizing the effect of different variables on student success
<!--more-->

<script src="{{site.url}}/assets/dataVis/d3.v5.min.js"></script>
<script> const datalink = "{{site.url}}/assets/dataVis/project1/student-grade-prediction.csv";</script>


# Educational Trends

The data set is from the UCL Machine Learning Repository and looks at a number of variables in relation to students first period, second period, and final grades.

Use these buttons to look at grades throughout the year:
<div class="buttons">
  <button id = "G1">First Period Grade</button>
  <button id = "G2">Second Period Grade</button>
  <button id = "GF">Final Grade</button>
</div>

A student's academic performance can have a great impact on the life they live after graduation and can also indicate howwell an educational program is working.
Figuring out what works for student and how they learn best should be of great interest to both educators and studentsalike.      
What works for each individual student is different, but looking at overall trends can help us figure out better ways tohelp students learn. 

## Study Time

The amount of time a student spends studying seems like it should be the most obvious indicator of student success. 

<svg id='chart1'></svg>

While there is a slight upwards trend, there isn't a huge difference in average grades as students study for more hours. 
This may be due to diminishing returns after long periods of studying, as evidence by '>10' hours averaging lower than '5 to 10' for the first and final grade. 

## Heatmap responses

The presence of various other factors were measured to see if they had an affect on a student's academic performance. 
<div class="buttons">
  <button id = "B1">School Support</button>
  <button id = "B2">Home Support</button>
  <button id = "B3">Extra Paid Classes</button>
  <button id = "B4">Extra-curricular Activities</button>
  <button id = "B5">Attended Nursery</button>
  <button id = "B6">Internet Access</button>
  <button id = "B7">Romantic Relationship</button>
</div>

<svg id='chart2'></svg>
Most of the factors had little noticeable effect on grades.
However, some of the factors did create some interesting or counterintuitive differences 

### School Support
The greatest effect seems to come from School Support with most of the students indicated that they did not receive anyextra academic support at school. 
Surprisingly, students who don't receive any of this school support seem to achieve better scores.
This is likely the case because students who are already doing well may not seek any extra support from the school.
### Home Support
imilar to the result for school support, student who don't receive extra academic support at home achieve better scores.
his is likely due to similar reasons as school support with support only being given to students who need it. 
### Extra-curricular Activities
There was a fairly even number of responses for both 'yes' and 'no' which should represent both groups better.
While final grade appears to be independent of involvement in Extra-curriculars, during the first period it appears to havea slight positive effect.
### Internet Access
Another factor that has a small but noticeable effect on scores appears to come from having Internet Access at home.
This may give students the ability to find alternate explanations for concepts they don't understand or communicate withclassmates about homework.
It may also provide some distraction to students, but this doesn't appear to negatively impact student grades.
### Romantic Relationship
Having a romantic Relationship was another student doesn't seem to effect student scores in during the first period, butthe second period and final grade are negatively impacted by romantic relationships.
During the later parts of the year when more time is needed student may find themselves wanting to spend time with theirpartner rather than studying.

After looking at the data, it doesn't appear that one single factor seems has a huge impact on student's performance. 
Scores seem to increase when students study more, have internet access at home, participate in Extra-curriculars at thestart of the year, and don't have a romantic Relationship.
It may be the case that a combination of these could yield the highest scores.
Further research could be done looking at what the best combinations of factors work best as there is likely interaction.
Impact on Test scores are also not the only thing to look at when considering these factors. 
It is likely the case that while something like a romantic relationship decreases test scores it increases studentwell-being.

#### [Dataset from Kagle](https://www.kaggle.com/dipam7/student-grade-prediction)

*P. Cortez and A. Silva. Using Data Mining to Predict Secondary School Student Performance. In A. Brito and J. TeixeiraEds., Proceedings of 5th FUture BUsiness TEChnology Conference (FUBUTEC 2008) pp. 5-12, Porto, Portugal, April, 2008,EUROSIS, ISBN 978-9077381-39-7.*

[Web Link](http://www3.dsi.uminho.pt/pcortez/student.pdf")
<script src='{{site.url}}/assets/dataVis/project1/buttons.js'></script>
<script src='{{site.url}}/assets/dataVis/project1/chart1.js'></script>
<script src='{{site.url}}/assets/dataVis/project1/chart2.js'></script>
<script src='{{site.url}}/assets/dataVis/project1/main.js'></script>