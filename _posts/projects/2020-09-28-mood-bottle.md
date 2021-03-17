---
layout: post
title:  "Mood Bottle"
date:   2020-09-28 11:15:33 -0400
tags: [Arduino]
categories: projects
image: /media/class/470/bottlecap.png
---

Completed for IGME 470

The project is a prototype water bottle that lets you know when you haven't drunken water in a while. It's a simple silly concept that let us explore the Ardunio development process. 

<!--more-->

Benjamin Goldfeder: Mockups and Touch Sensor

Dane Sherman: Capacitor and Documentation  

## Inspiration

The initial idea for this project came from thinking about what objects we've started to use more since the quarantine started. Water bottles came to mind because they're something that can be constantly be by your side, without having to really thinking about them. 

Our initial ideas were more practical and were mostly based around a device that yells at you when if you haven't drunken water in a while. This could eventually lead towards giving the water bottle some sort of mood based on how much water it contains, how recently you drank from it, and how much you drank.

## Mockup 

To do this we need to find a way of detecting how much water is in the bottle. 

![Setup]({{site.url}}/media/class/470/mockup.png)

## Capacitor 

We tried to make a capacitor out of a water bottle but quickly realized there would need to be some sort of metal bit touching the water. 

Following this tutorial, 2 versions were built, one with plastic and one with glass

<iframe width="560" height="315" src="https://www.youtube.com/embed/eDYEWQgbT1w" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

|![Setup]({{site.url}}/media/class/470/M1.jpg)|![Setup]({{site.url}}/media/class/470/M2.jpg)|

Then using the instructions for [Project 15 of this tutorial series](https://rees52.com/robots-kits/4771-arduino-uno-project-basic-component-starter-kit-kt1300?search_query=kt1300&results=1#link14) we tested the with an actual capacitor to make sure it worked. Unfortunately when hooking up the water bottle versions, the readings were the same as when nothing is connected at all

## Touch Sensor

Next we tried to use the capacitive touch sensor and a pressure sensor to detect the weight of the bottle. This worked much better and is much less intrusive
 
|![Setup]({{site.url}}/media/class/470/M3.jpg)|![Setup]({{site.url}}/media/class/470/M4.jpg)|)

{% highlight c#%}

#include <CapacitiveSensor.h>

CapacitiveSensor sensor = CapacitiveSensor(2,3);
void setup() {
  sensor.set_CS_AutocaL_Millis(0xFFFFFFFF);
  Serial.begin(9600);
}
void loop() {
  //Capaccitive Touch
  long total = sensor.capacitiveSensor(30);
  Serial.println(total);  

  //Analog
  Serial.println(analogRead(A0));
  
  // print sensor output
  delay(1);                                 
}

{% endhighlight %}

## Mood Code

Finally, we hooked up an LED to indicate the 'Mood' of the water bottle and programmed in some simple behaviors.
- Mood slowly decreases 1 pt per hour
- Drinking from the bottle increases the mood 1 pt
- Refilling the bottle restores in to max mood

{% highlight c#%}

const int analogInPin = A0;
const int ledPin = 9; // LED pin, this pin must be a PWM-capable pin

float mood = 10; //range: [0 - 10]

int prevSensorValue = 0;
int sensorValue = 0;

int storeCounter = 0;
const int STORE_REQ = 20; //required number of readings before data is stored
const int INCREASE_THRESHOLD = 10;
int storedValue = 0;

const float DELAY = 100;
const int RATE = 9600;

void setup() {
  // declare the LED pin to be an output:
  pinMode(ledPin, OUTPUT);
  
  Serial.begin(RATE);
}

void loop() {
  
  sensorValue = analogRead(analogInPin);
  Serial.print(sensorValue);

  if(sensorValue == prevSensorValue){
    storeCounter += 1;
    if(storeCounter >= STORE_REQ){
      //check if water level has increased
      if(storedValue + INCREASE_THRESHOLD < sensorValue){
        mood = 10; //make happy
      }else{
        mood += 1;
        mood = max(mood, 10);
      }
      storedValue = sensorValue;
      Serial.print("\t Stored"); //indicate that the value is stored
    }
  }else{
    storeCounter = 0;
  }

  prevSensorValue = sensorValue; //set the prev 

  Serial.println(); //end the serial line

  mood -= (DELAY / RATE) * (1.0 / 3600); //decrease by 1 every hour
  mood = min(mood, 0);

  analogWrite(ledPin, mood * 255 / 10); //set LED brightness based on mood
  delay(DELAY);                                 
}

{% endhighlight %}

## Reflection

We hope this helps people especially when we're all stuck indoors and want to start improving our health. While the amount of water people drink varies, there is little doubt that remembering to drink water throughout the day can have many positive health benefits. 

Next steps for this project would include adding lights or some sort of speaker to the base for signaling to the user how much water is in the bottle. 