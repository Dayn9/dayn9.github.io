---
layout: post
title:  "PhysicsObj"
date:   2020-12-28 11:15:33 -0400
categories: [docs, atom]
---

With 'collision' being handled by the separation algorithms, a simple Physics Object class was developed to replecate some basic rigid body functionality. 

<!--more-->

{% highlight c#%}
public class PhysicsObject : MonoBehaviour
{
    /// <summary>
    /// Handles basic physics calculations
    /// </summary>
    //TODO make get porpertys and method for apply forces so that these are hidden
    public Vector3 Position { get; private set; } //current postion of the object
    public Vector3 Velocity { get; private set; } //current velocity of the object
    [SerializeField] [Range(0, 1)] private float drag; //amout to slow velocity by every update
    private void Start()
    {
        Position = transform.position;
    }
    public void AddForce(Vector3 force)
    {
        Velocity += force;
    }
    private void FixedUpdate()
    {
        //get the current position
        Position = transform.position;
        //move by velocity
        Position += Velocity * Time.deltaTime;
        //apply to transform
        transform.position = Position;
        //apply drag
        Velocity *= 1 - drag;
    }
}
{% endhighlight %}