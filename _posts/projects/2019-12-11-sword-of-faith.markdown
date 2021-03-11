---
layout: post
title:  "Sword of Faith"
date:   2019-12-20 11:15:33 -0400
tags: [Unity, C#] 
categories:  projects
image: /media/class/Sword/SoFicon.png
---

2 player cooperation game about 

<!--more-->

![Sword of Faith Logo]({{site.url}}/media/class/Sword/SoF.png)

I was the team lead for this project and was tasked with keeping our design document and rule-sheet were up to date, as well as making sure everyone knew what they were working on and when it needed to get done.

## Menu Transitions

Using a simple Lerp and Quaternion Slerp function, I added in some cool menu in-world menu transitions.

![Sword of Faith Logo]({{site.url}}/media/class/Sword/menu.gif)

## Edge of screen arrow


A challenging math problem I faced was getting arrows to track on the outside of the screen and point towards objectives.
The algorithm I went with utilized clamping functions so that the arrow would also stay with the object once it got close.
The fade out was also added as a nice aesthetic change, but mainly to hide the quickly changing direction that looked bad when you got close.

![Sword of Faith Logo]({{site.url}}/media/class/Sword/arrow.gif)

## Sword Swap

One of the main mechanics of this game is that both player share the same sword that they pass between back and forth. 
We didn't want the sword to just vanish and reappear, so instead I created an animation between the 2 cameras.

![Sword of Faith Logo]({{site.url}}/media/class/Sword/swap.gif)

To achieve this, the position of the sword is first **translated into viewport coordinates**.

{% highlight c#%}
//calculate the viewport start position
Vector3 playerStartPosition = dir ? playerOne.position : playerTwo.position;
startCam = (dir ? playerOneCamera : playerTwoCamera);
Vector3 viewportStartPos = startCam.WorldToViewportPoint(playerStartPosition);
viewportStartPos.x *= startCam.rect.width;
viewportStartPos.y *= startCam.rect.height;
viewportStartPos += (Vector3)startCam.rect.position;
{% endhighlight %}

then **animated to move using viewport coordinates** 

{% highlight c#%}
//modify p to start fast and slow down
p = Mathf.Sin(p * Mathf.PI * 0.5f); 
//calculate viewport space position of the sword
Vector3 viewportPos = Vector3.Lerp(viewportStartPos, viewportEndPos, p);
{% endhighlight %}

during the animation the coordinates are **translating back into worldSpace depending on which side of the screen it's on**. Along with some additional effects 

{% highlight c#%}
Vector3 worldPosition;
//when p < 0.5 get position in Start Camera viewport
if (p < 0.5f)
    worldPosition = startCam.ViewportToWorldPoint(viewportPos);
else
    worldPosition = endCam.ViewportToWorldPoint(viewportPos);

worldPosition.y = swordY + (5 * (-Mathf.Cos(2 * Mathf.PI * p) / 2 + 0.5f)); //rise and fall with wave
sword.localScale = Vector3.one * ((5 * (-Mathf.Cos(2 * Mathf.PI * p) / 2 + 0.5f)) + 1); //grow and shrink with wave
sword.position = worldPosition;

{% endhighlight %}

[Full Code on Github](https://github.com/Njz2587/DresdenProject/blob/Master/SwordOfFaith/Assets/Scripts/Gameplay/SwordSwap.cs)