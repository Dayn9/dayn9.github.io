---
layout: post
title:  "Custom Physics"
description: "Dynamic climbing on ramped and curved surfaces"
date:   2018-12-12 11:15:33 -0400
categories: [docs, theItch]
category: Docs
---

This is actually where this entire project started. I was curious about 2D physics and wanted to try my hand at writing it myself. 

Based off [Unity 2D Platformer Character Controller Tutorial](https://www.youtube.com/watch?v=wGI2e3Dzk_w&t=9s) but heavily modified for specific use

<!--more-->

## Why create custom physics?
I was experimenting with the Unity Physics System but I was having trouble understanding how it worked and getting it to work properly. I was also interested in learning how collision handling might be done and building it myself seemed like much more fun than scrolling through the Unity documentation. 

## General Concept
I actually do two collision checks every frame; a gravity (vertical) and movement (horizontal) check. This helps with determining if the object is grounded as well as with handling corners and sloped surfaces. All the collisions are calculated in FixedUpdate. 

### Rigidbody2D Cast
For each check, a Rigidbody2D cast is made in the direction of the moving vector. A ContactFilter2D that has been set from the Physics2D settings in the Start method is applied to the cast; this helps later on with things like one-way platforms.
The collision data is output to a RaycastHit2D array which will get looped through. A max move distance is also passed in that has the magnitude of the move vector clamped to the max Gravity or Movement speeds.

`numCollisions = rb2D.Cast(moveVector, filter, hits, distance);`

See: [Unity Rigidbody2D.Cast](https://docs.unity3d.com/ScriptReference/Rigidbody2D.Cast.html), [Unity ContactFilter2D](https://docs.unity3d.com/ScriptReference/ContactFilter2D.html), [Unity RaycastHit2D](https://docs.unity3d.com/ScriptReference/RaycastHit2D.html)

The cast returns the number of collisions that actually occurred (usually 0-2) that will hill be the condition for stopping iterating over the collision data.

### Looping through each collision
Once there is actually a collision the first thing to check for is if the object is already inside the collision object or is colliding with a perpendicular surface. Both cases should cause the loop to ignore that particular collision.
 
`if (hits[i].distance != 0 && Vector2.Dot(gravity, hits[i].normal) '!= 0)`

If the distance to that collision is shorter than the current distance, the shortest distance to a collision needs to be updated. 

`distance = hits[i].distance < distance ? hits[i].distance : distance;`

### Move to collide 
Finally, the Rigidbody2D is moved the shortest distance found minus a small buffer to prevent overlap

`rb2D.position += moveVector.normalized * (distance - buffer);`

## Gravity Collision Pseudocode
* Gravity vector added to ‘vertical’ velocity
* Cast the colliders out along gravity velocity
* Loop through objects collided with
  * Make sure not inside or colliding with perpendicular 
  * Grounded if object moving downwards (in direction of gravity)
  * Set vertical velocity to zero 
  * Check if the collision is closer than the current shortest collision 
    * Set the shortest distance to collision
    * Set the ground normal to object’s normal vector
* Move the shortest distance along original ‘vertical’ velocity vector 

## Movement Collisions Pseudocode
* Get input velocity from the player or any other outside source (done in Update)
* Project input velocity onto vector perpendicular ground normal
* Cast the colliders out along projected input velocity
* Loop through objects collided with
  * Check if the collision is closer than the current shortest collision 
    * Set the shortest distance to collision
* Move the shortest distance along the original input velocity vector 
