---
layout: post
title:  "Separation algorithms "
description: "Running separation algorithms in parallel to \"Animate\" particle configuration "
date:   2020-12-28 11:15:33 -0400
categories: [docs, atom]
category: Docs
---

Separation algorithms were used to position particles with a smooth motion. similar methods were used for the shells and nucleus with slight variations.

<!--more-->

## Optimizations 

In the actual program a `Parallel.For` loop replaces the first for loop to speed up the calculations.

Each particle loops over all PREVIOUS particles and adds equal opposing forces to each. 

### move to center
Protons and Neutrons in the nucleus are all controlled by the same separation algorithm.
Every particle in the Nucleus moves towards the center.
This force is normalized and then clamped to it's own magnitude so the particles slow on approach

### move away from others
The particle then checks for overlaps with other particles using the radius distances.
If they are overlapping a small separation force is applied.
Each particle **i** only checks particles **[0 - i]** for overlap, removing duplicate overlap checks.

{% highlight c#%}
for (int i = 0, len = particles.Count; i < len; i++)
{
    //find the distance from origin
    Vector3 diffOrgin = transform.position - particles[i].PhysicsObj.Position;
    //calculate the force to center ( clamp is used so particles slow near center
    Vector3 forceToCenter = Vector3.ClampMagnitude(diffOrgin.normalized * (PARTICLE_SPEED * scale), diffOrgin.magnitude);
    particles[i].PhysicsObj.AddForce(forceToCenter);
    for (int j = 0; j < i; j++)
    {
        //find the distance between particles
        Vector3 diffOther = particles[i].PhysicsObj.Position - particles[j].PhysicsObj.Position;
        //calculate the amount of overlap
        float overlap = diffOther.magnitude - (particles[i].Radius ) - (particles[j].Radius );
        //check if actually overlapping
        if (overlap < 0)
        {
            //add force to seperate
            Vector3 forceToSeperate = diffOther.normalized * overlap * PARTICLE_SPEED * scale;
            //apply forces to the particles
            particles[i].PhysicsObj.AddForce(-forceToSeperate);
            particles[j].PhysicsObj.AddForce(forceToSeperate);
        }
    }
}
{% endhighlight %}

## Electron Shell separation 

Similar to the Nucleus separation, except overlap uses a calculated distance to maintain the configuration

### move to radius
Each particle in the shell moves towards the radius distance away from the center.
Using `.sqrMagnitude` speeds up the calculation and also creates much larger forces the further away the electron is. 

### move to orbit
The `diffRadius` vector between the particle and center is rotated 90 degrees to become tangent to the circle.
This can then be used to apply a small orbital force to the particle.

### move to Z=0
Because these particles are moving in 3D space but rotate around a 2D circle a small force is applied to get them aligned on z = 0

### move away from others
Finally, the same method for separation as the Nucleus is used. 
`seperationDistance = 2 * Radius * Mathf.Sin(Mathf.PI / ElectronCount);` is used as an overlap radius to evenly distribute particles around the circle.


{% highlight c#%}

//Euclidean distance between n points on r radius circle (n = ElectronCount, r = Radius)
seperationDistance = 2 * Radius * Mathf.Sin(Mathf.PI / ElectronCount);

for (int i = 0, len = ElectronCount; i < len; i++)
{
    //calculate force to get into orbit
    Vector2 diffRadius = transform.position - particles[i].PhysicsObj.Position;
    Vector2 forceToRadius = diffRadius.normalized * (diffRadius.sqrMagnitude - Radius*Radius) * ALIGNMENT_SPEED;
    particles[i].PhysicsObj.AddForce(forceToRadius);
    //calculate force to maintain orbit
    if (Settings.ORBIT)
    {
        Vector2 forceToOrbit = new Vector2(-diffRadius.y, diffRadius.x).normalized * ORBIT_SPEED * scale;
        particles[i].PhysicsObj.AddForce(forceToOrbit);
    }
    //calculate force to z = 0;
    Vector3 forceToZ = Vector3.back * particles[i].PhysicsObj.Position.z;
    particles[i].PhysicsObj.AddForce(forceToZ);
    for (int j = 0; j < i; j++)
    {
        //find the distance between particles
        Vector2 diffOther = particles[i].PhysicsObj.Position - particles[j].PhysicsObj.Position;
        //rare occurance, but seperate from identical other
        if (diffOther.sqrMagnitude < 0.001) { particles[i].PhysicsObj.AddForce(Random.insideUnitSphere); }
        //calculate the amount of overlap
        float overlap = diffOther.magnitude - seperationDistance;
        if (overlap < 0)
        {
            //add force to seperate
            Vector2 forceToSeperate = diffOther.normalized * overlap * SEPERATION_SPEED ;
            //apply forces to the particles
            particles[i].PhysicsObj.AddForce(-forceToSeperate);
            particles[j].PhysicsObj.AddForce(forceToSeperate);
        }
    }
}
{% endhighlight %}'