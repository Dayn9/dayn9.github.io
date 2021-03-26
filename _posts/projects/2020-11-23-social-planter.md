---
layout: post
title:  "Social Planter"
date:   2020-11-23 11:15:33 -0400
tags: [Arduino]
categories: projects
image: /media/class/470/pmini.jpg
---

Completed for IGME 470

The social planter encourages individuals living in the city and other small apartments to have plants for fresh air combatting urban pollution. By monitoring the condition of plants the maintenance will be minimal, just water when directed to do so. Many find gardening lonely, but social planter allows for sharing results with your friends. Even if you are away or otherwise unable to care for your plants, their conditions will be accessible and shareable to friends for help. 

<!--more-->

Dylan Gomer and Dane Sherman

Social Planter demonstrates our knowledge of digital and analog I/O, serial and network communication alongside physical design. We implemented a social aspect to an otherwise solitary activity.


# Concept
![Concept]({{site.url}}/media/class/470/Concept.png)

# A very sophisticated jar of dirt
The first prototype we got working was recording data from the moisture sensor and passing the data along to a web server. These were the two parts we struggled the most with to get working so it was good to get them done early. 
![Plant 0]({{site.url}}/media/class/470/F0.jpg)

# Final Circuit 
The final circuit design also included a photocell
On the Right: Moisture Sensor
On the Left: Light and Photocell
![Circuit]({{site.url}}/media/class/470/Circuit.PNG)

# Final Result
The final built out circuit with a plant
![Plant 1]({{site.url}}/media/class/470/F1.jpg)
![Plant 2]({{site.url}}/media/class/470/F2.jpg)
![Plant 2]({{site.url}}/media/class/470/F3.jpg)

# Web Site

# Code

#### secrets.h

{% highlight c++ %}

#define SECRET_SSID "RIT-Guest"
#define SECRET_PASS ""

{% endhighlight %}

#### plant.ino 

{% highlight c++ %}
#include <SPI.h>
#include <WiFiNINA.h>

#include "arduino_secrets.h" 
///////please enter your sensitive data in the Secret tab/arduino_secrets.h
char ssid[] = SECRET_SSID;        // your network SSID (name)
char pass[] = SECRET_PASS;    // your network password (use for WPA, or use as key for WEP)
int keyIndex = 0;                 // your network key Index number (needed only for WEP)

int status = WL_IDLE_STATUS;
WiFiServer server(80);

int moistPin = 0;
int moistVal = 0;
int tooDry = 150; //set low parameter for plant
int tooWet = 400; //set high parameter for plant

int water = 2;

int lightVal = 0;

void setup() {
  Serial.begin(9600);      // initialize serial communication
  pinMode(9, OUTPUT);      // set the LED pin mode

  // check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true);
  }

  String fv = WiFi.firmwareVersion();
  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
    Serial.println("Please upgrade the firmware");
  }

  // attempt to connect to Wifi network:
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);                   // print the network name (SSID);

    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
    status = WiFi.begin(ssid, pass);
    // wait 10 seconds for connection:
    delay(10000);
  }
  server.begin();                           // start the web server on port 80
  printWifiStatus();                        // you're connected now, so print out the status
}

void loop() {

  moistVal = analogRead(moistPin);
  lightVal = analogRead(A1);
  
  Serial.println(moistVal);
  Serial.println(lightVal);
  int percent = 2.718282 * 2.718282 * (.008985 * moistVal + 0.207762); //calculate percent for probes about 1 - 1.5 inches apart
  Serial.println("% Moisture ");
  if (moistVal <= tooDry) {
    digitalWrite(4, HIGH); //Red LED
    digitalWrite(3, LOW);
    digitalWrite(2, LOW);
    water = 1;
  }
  else if (moistVal >= tooWet) {
    digitalWrite(4, LOW);
    digitalWrite(3, HIGH); //Blue LED
    digitalWrite(2, LOW);
    water = 3;
  }
  else {
    digitalWrite(4, LOW);
    digitalWrite(3, LOW);
    digitalWrite(2, HIGH); //+-Green LED
    water = 2;
  }
  
  WiFiClient client = server.available();   // listen for incoming clients

  if (client) {                             // if you get a client,
    Serial.println("new client");           // print a message out the serial port
    String currentLine = "";                // make a String to hold incoming data from the client
    while (client.connected()) {            // loop while the client's connected
      if (client.available()) {             // if there's bytes to read from the client,
        char c = client.read();             // read a byte, then
        Serial.write(c);                    // print it out the serial monitor
        if (c == '\n') {                    // if the byte is a newline character

          //send response
          if (currentLine.length() == 0) {
            //prep for HTML
            client.println("HTTP/1.1 200 OK"); //send response code
            client.println("Content-type:text/html"); 
            
            client.println();

            //Print out Webpage 
            client.print("<!DOCTYPE html><html lang=\"en\"><head>    <meta charset=\"UTF-8\">    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">    <title>Social Planter</title>    <style>        body{            font-family: Helvetica, sans-serif;            text-align: center;            background: rgb(117,158,30);            background: linear-gradient(90deg, rgba(117,158,30,0.72919590199361) 3%, rgba(28,115,13,1) 100%, rgba(255,255,255,1) 100%);        }        h1{            font-size: 150px;        }        h2{            font-size: 50px;        }        #light {            float: left;            margin-left: 15%;            margin-top: 5%;        }        #moisture {            float: right;            margin-right: 15%;            margin-top: 5%;        }        .sensor {            padding: 10px;            background-color: white;            border-radius: 25px;        }    </style></head><body>    <h1>Social Planter</h1>    <div id=\"light\" class=\"sensor\">        <h2>Light Sensor</h2>        <p id=\"lLabel\"></p>        <label for=\"lSensor\">Dark</label>        <input type=\"range\" min=\"0\" max=\"1\" value=\"0.5\" step=\"0.01\" class=\"slider\" id=\"lSensor\">        <label for=\"lSensor\">Bright</label>    </div>    <div id=\"moisture\" class=\"sensor\">        <h2>Moisture Sensor</h2>        <p id=\"mLabel\"></p>        <label for=\"mSensor\">Dry</label>        <input type=\"range\" min=\"0\" max=\"1\" value=\"0.5\" step=\"0.01\" class=\"slider\" id=\"mSensor\">        <label for=\"mSensor\">Wet</label>    </div>    <div id=\"status\" class=\"sensor\">    </div></body><script>    window.onload = function(e){        let light = ");
            client.print(lightVal / 1023.0); //normalize and send light value
            client.print("; let moisture = ");
            client.print(percent / 100.0); //normalize and send moisture value
            client.print("; let mMeter = ");
            client.print(water);
            client.print("; document.querySelector(\"#lSensor\").value = light;        document.querySelector(\"#mSensor\").value = moisture;        document.querySelector(\"#lSensor\").disabled = true;        document.querySelector(\"#mSensor\").disabled = true;        if((light * 100) > 30){            document.querySelector(\"#lLabel\").innerHTML = \"Good light\";        }else{            document.querySelector(\"#lLabel\").innerHTML = \"Needs light\";                }        switch(mMeter){            case 1:                document.querySelector(\"#mLabel\").innerHTML = \"Needs water\";                break;            case 2:                document.querySelector(\"#mLabel\").innerHTML = \"Enough water\";                break;            case 3:                document.querySelector(\"#mLabel\").innerHTML = \"Do not water\";                break;        }        if(((light * 100) < 30) && (mMeter == 1)){            document.querySelector(\"#status\").innerHTML = '<img src=\"https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/facebook/65/loudly-crying-face_1f62d.png\" width=\"300\" height=\"300\">';        }else if(((light * 100) > 30) && (mMeter > 1)){            document.querySelector(\"#status\").innerHTML = '<img src=\"https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/facebook/65/grinning-face_1f600.png\" width=\"300\" height=\"300\">';        }else{            document.querySelector(\"#status\").innerHTML = '<img src=\"https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/facebook/65/disappointed-but-relieved-face_1f625.png\" width=\"300\" height=\"300\">';        }    }</script></html>");
            client.println();
            break;
          } else {    // if you got a newline, then clear currentLine:
            currentLine = "";
          }
        } else if (c != '\r') {  // if you got anything else but a carriage return character,
          currentLine += c;      // add it to the end of the currentLine
        }

        // Check to see if the client request was "GET /H" or "GET /L":
        if (currentLine.endsWith("GET /H")) {
          digitalWrite(9, HIGH);               // GET /H turns the LED on
        }
        if (currentLine.endsWith("GET /L")) {
          digitalWrite(9, LOW);                // GET /L turns the LED off
        }
      }
    }
    // close the connection:
    client.stop();
    Serial.println("client disonnected");
  }
}

void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your board's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
  // print where to go in a browser:
  Serial.print("To see this page in action, open a browser to http://");
  Serial.println(ip);
}
{% endhighlight %}

#### HTML in expanded form

{% highlight html %}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Social Planter</title>
    <style>
        body{
            font-family: Helvetica, sans-serif;
            text-align: center;
            background: rgb(117,158,30);
            background: linear-gradient(90deg, rgba(117,158,30,0.72919590199361) 3%, rgba(28,115,13,1) 100%, rgba(255,255,255,1) 100%);
        }
        h1{
            font-size: 150px;
        }
        h2{
            font-size: 50px;
        }
        #light {
            float: left;
            margin-left: 15%;
            margin-top: 5%;
        }
        #moisture {
            float: right;
            margin-right: 15%;
            margin-top: 5%;
        }
        .sensor {
            padding: 10px;
            background-color: white;
            border-radius: 25px;
        }
    </style>
</head>
<body>
    <h1>Social Planter</h1>
    <div id="light" class="sensor">
        <h2>Light Sensor</h2>
        <p id="lLabel"></p>
        <label for="lSensor">Dark</label>
        <input type="range" min="0" max="1" value="0.5" step="0.01" class="slider" id="lSensor">
        <label for="lSensor">Bright</label>
    </div>
    <div id="moisture" class="sensor">
        <h2>Moisture Sensor</h2>
        <p id="mLabel"></p>
        <label for="mSensor">Dry</label>
        <input type="range" min="0" max="1" value="0.5" step="0.01" class="slider" id="mSensor">
        <label for="mSensor">Wet</label>
    </div>
    <div id="status" class="sensor">
    </div>
</body>
<script>
    window.onload = function(e){
        let light = 0;      //ENTER LIGHT VALUE HERE 
        let moisture = 0;   //ENTER MOISTURE VALUE HERE
        let mMeter = 0;      //ENTER WATER VALUE HERE

        document.querySelector("#lSensor").value = light;
        document.querySelector("#mSensor").value = moisture;
        document.querySelector("#lSensor").disabled = true;
        document.querySelector("#mSensor").disabled = true;

        if((light * 100) > 30){
            document.querySelector("#lLabel").innerHTML = "Good light";
        }else{
            document.querySelector("#lLabel").innerHTML = "Needs light";        
        }

        switch(mMeter){
            case 1:
                document.querySelector("#mLabel").innerHTML = "Needs water";
                break;
            case 2:
                document.querySelector("#mLabel").innerHTML = "Enough water";
                break;
            case 3:
                document.querySelector("#mLabel").innerHTML = "Do not water";
                break;
        }

        if(((light * 100) < 30) && (mMeter == 1)){
            document.querySelector("#status").innerHTML = '<img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/facebook/65/loudly-crying-face_1f62d.png" width="300" height="300">';
        }else if(((light * 100) > 30) && (mMeter > 1)){
            document.querySelector("#status").innerHTML = '<img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/facebook/65/grinning-face_1f600.png" width="300" height="300">';
        }else{
            document.querySelector("#status").innerHTML = '<img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/facebook/65/disappointed-but-relieved-face_1f625.png" width="300" height="300">';
        }


    }
</script>
</html>

{% endhighlight %}