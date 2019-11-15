---
layout: post
title:  "NPC Creation"
date:   2019-02-11 11:15:33 -0400
categories: theItch
---

To save time and achive a consistent look, all of the NPC's override the player animation controller

<!--more-->

## Concept

I started the NPC design process by not so quickly sketching out 36 possible characters that I could possibly include in the main basophil town area. Trying to come up with unique hairstyles that still looked believable was probably the hardest part, but I really like how most of them turned out.

I made sure to include some characters that fit the specific roles that I needed in the game

![36 characters]({{site.url}}/media/theItch/CharWall10x.png)

After drawing out the concepts I picked out the ones that I thought would best fit into the game world and be distinct from one another. 

## Animation

To save time, most of the NPC's in this game are drawn and animated off of the original player sprite. The damage and death animations are the same so I only didn't have to recreate those every time. 

The amount of animation given to a character was based on the amount of movement they have in the game.  
* Every character receives an idle animation
* Characters that jump are given a jump up and down animation
* Characters that walk back and forth are given a running animation
* Any special animations are also done 

![Priest Spritesheet]({{site.url}}/media/theItch/PriestBase2.png)

## Unity Animator

With the original player animations, I created a base NPC [Animator Controller](https://docs.unity3d.com/Manual/Animator.html) which receives the same parameters as the player controller but has simplified transitions. I then used [Animation Override Controllers](https://docs.unity3d.com/Manual/AnimatorOverrideController.html) for each of the NPC's to override the necessary animations for each character. This saved a lot of time setting up animators and was easily tested by giving the player the Override Controller. 

![Boppin]({{site.url}}/media/theItch/Boppin.gif)

## Not Mario
![not mario]({{site.url}}/media/theItch/notMario.png)
