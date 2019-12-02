---
layout: post
title:  "Particle Pursuit"
date:   2018-12-11 11:15:33 -0400
categories: theItch
---

The explosion of particles that seek a point is probably the coolest effect in the game and was also one of the trickiest to figure out.

<!--more-->

RELEVANT CODE AT BOTTOM

## TL;DR
Regular Emission and Explosion Emission are different 
[ParticleSystems](https://docs.unity3d.com/ScriptReference/ParticleSystem.html) 
to allow manual control of just Explosion 
[Particles](https://docs.unity3d.com/ScriptReference/ParticleSystem.Particle.html). There is a `SendParticlesTo` method that 
[Emits](https://docs.unity3d.com/ScriptReference/ParticleSystem.Emit.html) the particles and starts the controlling process in `Update`. The controlling process uses 
[GetParticles](https://docs.unity3d.com/ScriptReference/ParticleSystem.GetParticles.html) to gain acess to individual particles , applies [Reynolds's Pursuit Algorithm](https://www.red3d.com/cwr/steer/) to each of them, and then uses 
[SetParticles](https://docs.unity3d.com/ScriptReference/ParticleSystem.SetParticles.html) to apply the changes. When particles get to close to the target, they're set to stop moving and disappear. 

## Two different particle systems
The first thing to note is that the player actually has two different particle effects. One for regular emission and another for the explosions. Splitting up the two particle behaviors became necessary when I needed to control the explosion without affecting the regular emission as well as give the explosion particles a greater speed and altered noise function. Both particle systems are simulated in **World Space**. 

See: [Unity ParticleSystem](https://docs.unity3d.com/ScriptReference/ParticleSystem.html)

### Regular 
The regular emission is as simple as calling Play and Stop on the ParticleSystemwhen the mouse is being clicked. These particles are emitted from a circle at a random angle and collide with the player; this causes the subtle effect of the player pushing particles out of the way. The particles also fade in and out slightly and have a small noise function. All this is controlled in the inspector through the ParticleSystem Component 

![Regular]({{sit.url}}/media/TheItch/Regular.gif)

### Explosion 
Identical to the Regular Emission but with a greater initial speed and a much stronger noise function. Emission and movement are controlled almost entirely through a script. 

![Explosion]({{sit.url}}/media/TheItch/Explosion.gif)

## How to Explode
### Fields related to the particle system

`ParticleSystem part;`Reference to the ParticleSystem Component 

`ParticleSystem.Particle[] particles;` Array of all the particles being controlled. Assigned to an empty array with length part.main.maxParticles in Awake().

See: 
[Unity ParticleSystem.Particle](https://docs.unity3d.com/ScriptReference/ParticleSystem.Particle.html), 
[Unity ParticleSystem.main](https://docs.unity3d.com/ScriptReference/ParticleSystem-main.html)

`int sentParticles` Keeps track of how many particles still need to reach the target 

`bool sending;` True when the particles are being sent to the target

### Fields related to the target
`Vector2 target` current world space position of the target

`bool moving` True when the target is a moving target

`Transform stillTarget` Target Transform when moving == false

`MovingObject movingTarget` (Contains move velocity information) Target MovingObject when moving == true

### Send Particles To 
There are two versions of the _SendParticlesTo_ method:

`void SendParticlesTo(Transform target, int minNum)` and `void SendParticlesTo(MovingObject target, int minNum)`

The first Transform version sets `moving = false` and the **stillTarget** while the second MovingObject version sets `moving = false` and the **movingTarget**. 

They both set `sending = true` and emit particles `part.Emit(minNum * particleMultiplier);`

`sentParticles += minNum * particleMultiplier;` is also **increased** in order to account for a second explosion occurring while existing particles are still seeking

See: [Unity ParticleSystem.Emit()](https://docs.unity3d.com/ScriptReference/ParticleSystem.Emit.html)

![Run]({{sit.url}}/media/TheItch/Run.gif)

### Update
#### Setup 
After checking if `sending == true` it makes sure the particle system is playing `if (part.isPaused) { part.Play(); }`

the Vector2 target is set by either the `stillTarget.transform.position` or by `movingTarget.transform.position + (Vector3)movingTarget.MoveVelocity' This allows the particles to **pursue** the future position of a moving target and **seek** the current position of a still target

`part.GetParticles(particles)` is then used to get the particle data and return the number of active particles which are then looped over. `part.particleCount` would have also worked for getting the number of particles but doesn't give access to the individual particles. 

See: [Unity ParticleSystem.GetParticles()](https://docs.unity3d.com/ScriptReference/ParticleSystem.GetParticles.html)

#### Reynold's Seek and Pursuit 
For each individual `ParticleSystem.Particle particle = particles[i];` a move vector from it's current `particle.position` to the target is calculated. 

That move vector is then used to calculate a new `particle.velocity += ((moveVector.normalized * particleSpeed) - particle.velocity) * Time.deltaTime;`

See: [Reynolds Algorithms](https://www.red3d.com/cwr/steer/)

when the particle is close enough to the target it's `particle.remainingLifetime = 0;` and `particle.velocity = Vector3.zero;`. sent particles is also decremented to keep track of how many particles have arrived. This effectivly removes the particle from the system.

![Moving Target]({{sit.url}}/media/theItch/Moving.gif) 

#### Final steps 
In order to apply the changes to the individual particle it must be assigned back into `particles[i] = particle;`

One final check is made it see if `sentParticles <= 0`, in which case `sending = false;` and `part.Stop();` just in case

To apply changes to the actual particle system `part.SetParticles(particles, numParticles);` and the new particle velocities are set

See: [Unity ParticleSystem.SetParticles()](https://docs.unity3d.com/ScriptReference/ParticleSystem.SetParticles.html)

## Relevant Code
Note: Use of access modifiers was due to external and inheriting classes. Some irrelevant code was also left out. 
{% highlight c %}
[SerializeField] private float particleSpeed;
private const int particleMultiplier = 3;
private const float overshoot = 0.75f;
private const float slowRadius = 6;

protected ParticleSystem part; //ref to this objects particle system
protected ParticleSystemRenderer partRend;
protected ParticleSystem.Particle[] particles; //array of particles being controlled 

protected int sentParticles;
protected bool sending; //true when particles arde being sent to a location

protected Vector2 target;
private bool moving = false;
protected Transform stillTarget;
private MovingObject movingTarget;

protected virtual void Awake() 
{
     part = GetComponent<ParticleSystem>();
     particles = new ParticleSystem.Particle[part.main.maxParticles];
     part.Stop();
}

/// <summary>
/// Send Particles to a specified world positions
/// </summary>
/// <param name="target">target transform</param>
/// <param name="minNum">minimum number of particles</param>
public void SendParticlesTo(Transform target, int minNum)
{
     stillTarget = target;
     moving = false;

     //emit additional particles 
     part.Emit(minNum * particleMultiplier);
     sentParticles += minNum * particleMultiplier;

     //start sending particles to point
     sending = true;
}

/// <summary>
/// Send Particles to a specified world positions
/// </summary>
/// <param name="targets">target moving object</param>
/// <param name="minNum">minimum number of particles</param>
public void SendParticlesTo(MovingObject target, int minNum)
{
     movingTarget = target;
     moving = true;

     //emit additional particles 
     part.Emit(minNum * particleMultiplier);
     sentParticles += minNum * particleMultiplier;

     //start sending particles to point
     sending = true;
}

protected void MoveParticles()
{
     if (sending)
     {
          if (part.isPaused) { part.Play(); }

          //loop through all particles
          int numParticles = part.GetParticles(particles); 
          target = moving ? (movingTarget.transform.position + (Vector3)movingTarget.MoveVelocity) : stillTarget.position;
          for (int i = 0; i < numParticles; i++)
          {
               ParticleSystem.Particle particle = particles[i];
               //particle.remainingLifetime += Time.deltaTime; //keep particle alive
               Vector3 moveVector = ((Vector3)target - particle.position);
               moveVector += moveVector.normalized * overshoot;

               particle.velocity += ((moveVector.normalized * particleSpeed) - particle.velocity) * Time.deltaTime;
               particle.velocity *= Mathf.Clamp((moveVector.magnitude + slowRadius) / 10 , slowRadius * 0.1f , 1);

               if (moveVector.magnitude - overshoot < 1f)
               {
                    particle.remainingLifetime = 0;
                    particle.velocity = Vector3.zero;
                    sentParticles -= 1;
               }
               particles[i] = particle; //set the particle's data back into particles array
                               
          }

          if (sentParticles <= 0 || numParticles <= 0)
          {
               sentParticles = 0;
               sending = false;
               part.Stop();
          }
          part.SetParticles(particles, numParticles); //apply changes to particle system
     }
}
{% endhighlight %}

The final verison of this script can be found [Here](https://github.com/Dayn9/TheItch/blob/master/PlatformerBase/Assets/Scripts/Object/BloodParticle.cs)
