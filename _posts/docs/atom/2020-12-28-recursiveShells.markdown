---
layout: post
title:  "Recursive Shell Configuration"
description: "Mimicking Electron configuration using recursion"
date:   2020-12-28 11:15:33 -0400
categories: [docs, atom]
category: Docs
---

The most complicated feature by far was getting electrons to configure properly across shells. Mainly caused by the order in which electrons are added. I assume there are many ways to solve this problem but I felt a recursive solution was the most elegant.

**DISCLAIMER: This doc is about mimicking a real world process with code NOT presenting completely accurate scientific information. I'm not an expert on this.**

<!--more-->

## Setup

### SPDF Blocks

The **s**, **p**, **d**, and **f** blocks indicate energy levels within each shell. Each energy level can hold a certain number of electrons (s 2) (p 6) (d 10) (f 14).
In real atoms, electrons are are added to the lowest energy level available (closest to the center). 

![spdf blocks]({{site.url}}/media/Project/Atom/blocks.png)


In general, the patten is add to the highest available **f** then **d** then **p** then **s** blocks. However, as seen in the configuration order below, the order jumps between shells with the **f** being 3 shells deep by the time electrons get added to it. This meant I wouldn't be adding to the Outermost shell every time.

{% highlight c#%}
/// <summary> The shell directly below this one </summary>
public Shell NextShell { get; set; } 
{% endhighlight %} 

### SPDF Order

![Config order]({{site.url}}/media/Project/Atom/config.png)

Each shell has a Maximum number of electrons based on the energy levels present. For Example shell 1 only has an **s**
block, while shell 3 has **s**, **p**, and **d** blocks. 

{% highlight c#%}
public static int[] sblock = { 2, 2, 2, 2, 2, 2, 2 };
public static int[] pblock = { 0, 6, 6, 6, 6, 6, 6 };
public static int[] dblock = { 0, 0, 10, 10, 10, 10, 0 };
public static int[] fblock = { 0, 0, 0, 14, 14, 0, 0 };

//Amount: 2,  2,  6,  2,  6,  2, 10,  6,  2, 10,  6,  2, 14, 10,  6,  2, 14, 10,  6
//Order: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, 4d, 5p, 6s, 4f, 5d, 6p, 7s, 5f, 6d, 7p

public static int GetMaxElectrons(int shell)
{
    return sblock[shell] + pblock[shell] + dblock[shell] + fblock[shell];
}
{% endhighlight %} 

### Checking blocks

And since most shells don't contain every energy level so checks for whether the shell is full also check the maximum number of particles

{% highlight c#%}
public int ElectronCount => particles.Count; //public get for particles.Count
public bool sBlockFull => ElectronCount >= 2; //checks s block full
public bool pBlockFull => (ElectronCount >= 8 || MaxParticles <= 2) && sBlockFull; //checks p s blocks full
public bool dBlockFull => (ElectronCount >= 18 || MaxParticles <= 8) && pBlockFull; //checks d p s blocks full
public bool fBlockFull => (ElectronCount >= 32 || MaxParticles <= 18) && dBlockFull; //check f d p s blocks full

public int MaxParticles { get; set; } //Assigned by GetMaxElectrons()
{% endhighlight %}    


## Adding Particles

### Add helper

Helper method for handling the shell specific & Unity interactions

{% highlight c#%}
//helper add function for actually adding the particle into a shell
private void Add(Particle particle)
{
    //add the particle
    particles.Add(particle);
    particle.transform.SetParent(transform);
    particle.Radius = scale / 4;
    //calculate the new seperation distance
    CalcSeperationDistance();
    ColorParticles();
}
{% endhighlight %}   

### AddParticle 

Actual method that takes care of the *logic* for configuring particles.
This method is **always called on the Outer Shell** and works it's way down from there.

(skipping step 0 for the end)

- Step 1: Fill the s block of OuterShell (n)
    - first, the s block of the outer shell is filled. 
    - These will be the first 2 particles in the shell so somewhere else in the program an outer shell is created just before calling this method on it. 
- Step 2: Fill the f block of OuterShell.NextShell.NextShell (n-2)
- Step 3: Fill the d block of OuterShell.NextShell (n-1)
- Step 4: Fill the p block of OuterShell (n)
    - The next step will be **Step 1** on a new OuterShell (n+1)
- Step 0: Fill the p block of OuterShell.NextShell (n-1)
    - This step is necessary because electrons can be removed. Step 4 (the p block) on the previous shell must be fulfilled before completing Step 1 (the s block) on the current shell


{% highlight c#%}
/// <summary>
/// Figures out where to Add a particle
/// </summary>
/// <param name="particle">Particle to be added</param>
/// <returns>true if sucessfully added</returns>
public bool AddParticle(Particle particle)
{
    //0 recursively fill in electrons in PREVIOUS LEVEL that MUST be there
    if (NextShell)
    {
        if (!NextShell.pBlockFull)
        {
            return NextShell.AddParticle(particle);
        }
    }
    //1 Fill shell sBlock
    if (!sBlockFull)
    {
        Add(particle);
        return true;
    }
    if(NextShell)
    {
        //2 Fill shell-2 fBlock
        if(NextShell.NextShell && !NextShell.NextShell.fBlockFull)
        {
            NextShell.NextShell.Add(particle);
            return true;
        }
        //3 Fill shell-1 dBlock
        if (!NextShell.dBlockFull) {
            NextShell.Add(particle);
            return true;
        }
    }
    //4 Fill shell blocks
    if(!pBlockFull)
    {
        Add(particle);
        return true;
    }
    //No open place for electron
    return false;
}
{% endhighlight %}    

## Removing Particles
This is where things got really complicated. In the end it's not that much code, but figuring this out took a lot of time and effort. 

### Remove helper

Just like when adding, Helper method for handling the shell specific & Unity interactions

{% highlight c#%}
//helper remove function for actually removing particle
private void Remove(Particle particle)
{
    particles.Remove(particle);
    //calculate the new seperation distance
    CalcSeperationDistance();
    ColorParticles();
}
{% endhighlight %}  

### Transfer helper

Helper method for moving particles between shells.
- Uses the Add and Remove Helper functions

{% highlight c#%}
/// <summary> Helper funtion for moving particles between shells </summary>
/// <param name="from">Shell to take a particle from</param>
/// <param name="to">Shell to add particle to</param>
private void TransferParticle(Shell from, Shell to)
{
    Particle transferParticle = from.particles[0];
    from.Remove(transferParticle);
    to.Add(transferParticle);
}
{% endhighlight %}  

### Fall up

Part of the *Logic* below. Transfers particles from lower energy levels of the **f** and **d** block into the current OuterShell

{% highlight c#%}
//check if sBlock not full (should only occur on outer shell)
if (!sBlockFull && NextShell != null) //
{
    //raise shell-1 dBlock into sBlock
    if (NextShell.ElectronCount > 8)
        TransferParticle(NextShell, this);
    //dBlock empty raise shell-2 fBlock into sBlcok
    else if (NextShell.NextShell != null && NextShell.NextShell.ElectronCount > 18)
        TransferParticle(NextShell.NextShell, this);
}
{% endhighlight %}  

### Remove Particle

Actual method that takes care of the *logic* for configuring particles.
This method is **always called on the Outer Shell** and works it's way down from there.

- Step 0: Remove from this shell 
    - Fall Up is called to refill any **s** block electrons
- Step 1: Remove from next shell 
    - Keep checking down the shells for the removed particle
    - When a particle is removed
        - Transfer a particle from the shell above
        - Fall Up is called to refill any **s** block electrons

{% highlight c#%}
/// <summary>
/// Removes a particle from this shell
/// </summary>
/// <param name="particle">Particle to remove</param>
/// <returns></returns>
public bool RemoveParticle(Particle particle)
{
    //make sure the particle is an electron and actually in this shell
    if (particles.Contains(particle))
    {
        //remove particle from this layer
        Remove(particle);
        particle.transform.SetParent(null);
        FallUp();
        return true;
    }
    //not in shell, check the next one
    else if (NextShell != null)
    {
        //recursively check if particle in next shell
        if (NextShell.RemoveParticle(particle))
        {
            //make sure there are electrons AND NOT (sBlock into dBlock OR pBlock into fBlock)
            if (ElectronCount > 0 && !((ElectronCount <= 2 && NextShell.pBlockFull) || (ElectronCount <= 8 && NextShell.dBlockFull))) {
                //replace the removed partcicle with one from this shell
                TransferParticle(this, NextShell);
                FallUp(); 
            }
            return true;
        }
    }
    return false;
}
{% endhighlight %} 