---
layout: post
title:  "Course Load"
date:   2019-08-15 11:15:33 -0400
tags: [C#, Unity, UI] 
categories: [featured, projects]
image: /media/Project/CourseLoad/CourseLoadLogo.png
---

Course Load is an android app for recording and managing homework assignments created using Unity's UI system and C#

<!--more-->

![Main Scree]({{site.url}}/media/Project/CourseLoad/main.jpg) |![Create Screen]({{site.url}}/media/Project/CourseLoad/creation.jpg) |![Color Screen]({{site.url}}/media/Project/CourseLoad/color.jpg)|
**Main screen** displays all active assignemts in scrollable list|**Create screen** is used to create or edit assignments with name, date, and class|**Color screen** is used to update class names and color labels|

[Github Project](https://github.com/Dayn9/CourseLoad)

## Calendar Select

The calendar selection uses [Zellers Congruence](https://www.geeksforgeeks.org/zellers-congruence-find-day-date/) to figure out which day of the week to start the month on and display a calender view

{% highlight c %}
public void SetDays(int month, int year)
{
    viewingMonth = month;

    int firstDayIndex = Zellercongruence(1, month, year);
    int lastDay = DateTime.DaysInMonth(year, month);

    int week = 0;
    int day = 1;
    //loop over every (row / week) 
    for(week = 0; week < dayTexts.Count; week++)
    {
        //loop over every day in the week
        for (int i = 0; i < dayTexts[week].Length; i++)
        {
            //disable selected
            dayToggles[week][i].interactable = false;
            dayToggles[week][i].enabled = true;
            dayToggles[week][i].isOn = false;
            //set blank in first week before first day
            if (week == 0 && i < firstDayIndex)
            {
                dayTexts[week][i].text = "   ";
                dayToggles[week][i].enabled = false;
            }
            //set day while still not at the last day
            else if (day <= lastDay)
            {
                dayTexts[week][i].text = (day < 10 ? " " : "") + day;
                dayToggles[week][i].interactable = true;


                //select the toggle if it was previously selected
                if (selectedMonth == month && selectedDay == day)
                {
                    dayToggles[week][i].Select();
                    dayToggles[week][i].isOn = true;
                }

                day++;
            }
            else
            {
                dayTexts[week][i].text = "   ";
                dayToggles[week][i].enabled = false;
            }
        }
    }       
}

public void ToggleSelect(Text displayText, Toggle displayToggle)
{
    selectedMonth = viewingMonth;
    int.TryParse(displayText.text, out selectedDay);
}

private int Zellercongruence(int day, int month, int year)
{
    if (month == 1)
    {
        month = 13;
        year--;
    }
    if (month == 2)
    {
        month = 14;
        year--;
    }
    int q = day;
    int m = month;
    int k = year % 100;
    int j = year / 100;
    int h = q + 13 * (m + 1) / 5 + k + k / 4
                             + j / 4 + 5 * j;
    h = h % 7;

    return h;
}

{% endhighlight %}