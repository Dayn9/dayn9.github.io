---
layout: post
title:  "User Interface"
date:   2018-12-10 11:15:33 -0400
categories: [docs, theItch]
---

In order to get collected items to easily enter/exit the inventory, utilize the same background fade on UI and world objects, and maintain a consistent pixel size I decided to write my own UI anchors that could be utilized as child objects of the Main Camera. 

<!--more-->

## UI Anchors

### Anchors
`enum Anchor { topLeft, topCenter, topRight, middleLeft, middleCenter, middleRight, bottomLeft, bottomCenter, bottomRight }` The standard anchor positions that any UI element should be able to achor to

### Fields 
`Anchor anchor` place on the screen this element is anchored to 

`Vector2 offset` offset from the anchor point

`bool snapToPixel` when true, causes the element to snap to a pixel-perfect position (usually true)

### Set Position
Called from both Awake and a Set Method. Calculates where the UI element should be.

The first step is to find the `cameraHeight = MainCamera.GetComponent<BaseCamera>().CamHeight` and 
`cameraWidth = MainCamera.GetComponent<BaseCamera>().CamWidth`. The base camera is the base class for every version of the camera I created and calculates `camWidth = ppc.refResolutionX / (2.0f * pixelsPerUnit)` and `camHeight = ppc.refResolutionY / (2.0f * pixelsPerUnit)` (ppc : Pixel Perfect Camera Component).

Next, the position of the element is set to have the same x and y position of the camera while maintaining it's z position. 

Then 2 `switch(anchor)`'s are used to properly the element vertically and horizontally based on the camera dimensions and individual offsets. For example the Heartrate meter is anchored in the top left of the screen with an offset of 1 unit right and 1 unit down: 

{% highlight c %}
case Anchor.topLeft:
case Anchor.middleLeft:
case Anchor.bottomLeft:
   transform.position += Vector3.right * (-cameraWidth + offset.x);
   break;
{% endhighlight %}

{% highlight c %}
case Anchor.topLeft:
case Anchor.topCenter:
case Anchor.topRight:
   transform.position += Vector3.up * (cameraHeight + offset.y);
   break;
{% endhighlight %}

Finally snap to pixel if selected. The nearest pixel-perfect position is calculated with the following formula applied to the current X and Y positions. 
`pixelSize = 1.0f / pixelsPerUnit`
`return origional - (origional % pixelSize) + (origional % pixelSize > pixelSize / 2 ? pixelSize : 0)`
