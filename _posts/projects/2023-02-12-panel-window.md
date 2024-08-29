---
layout: post
title:  "Panel Windows"
description: "Recreation of a windows style OS that handles dragging / resizing / snapping"
date:   2023-02-12 11:15:33 -0400
tags: [C#, Unity]
categories: [projects, featured]
category: Professional
banner_preview: preview-panel-window.png
banner_image: banner-wip.png
---

This demo was extracted and trimmed down from a training simulation I'm working on. The application features multiple configurable widgets that mimic a kind of Windows OS. 

<!--more-->

## Demo

<iframe width="560" height="315" src="https://www.youtube.com/embed/yXGjl_vUYnU?si=BOS194lT3DVz2RDt" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

or play the demo here:

<iframe frameborder="0" src="https://itch.io/embed/1919346" width="552" height="167"><a href="https://daneisalive.itch.io/panel-window-demo">Panel Window Demo by DaneIsAlive</a></iframe>

## Code sample: Dragging

Here I used the built in pointer interfaces to receive messages from the UI system about the mouse position when interacting with the panel. Each drag is tracked from it's original position and resolved using the difference in mouse position from when the drag began to the current mouse position. The position is then clamped to stay within it's parent. In the source code, additional complexity is added to allow the panels to snap to each other as well as allow dragging between valid "drag areas".

*position = original position  + (mouse position - original mouse position)*

{% highlight c#%}
public class DragPanel : MonoBehaviourUI, IPointerDownHandler, IDragHandler, IPointerUpHandler
{
    private Vector2 localPointOrigin;
    private Vector2 localPositionOrigin;
    public bool IsDragging { get; private set; }

    public void OnPointerDown(PointerEventData eventData)
    {
        if (IsLeftClick(eventData))
        {
            localPositionOrigin = rectTransform.localPosition;
            localPointOrigin = GetLocalPoint(eventData);
            rectTransform.SetAsLastSibling();
            IsDragging = true;
        }
    }

    public void OnDrag(PointerEventData eventData)
    {
        if (IsLeftClick(eventData))
        {
            // offset local position by difference from origin
            Vector2 localPosition = localPositionOrigin + (GetLocalPoint(eventData) - localPointOrigin);
            rectTransform.localPosition = localPosition;

            ClampToParent();
        }
    }

    public void OnPointerUp(PointerEventData eventData)
    {
        IsDragging = false;
    }
   
    private bool IsLeftClick(PointerEventData eventData) => eventData.pointerId == -1;

    /// <summary> limit this rectTransform to stay within the draggable area </summary>
    private void ClampToParent()
    {
        Vector2 pos = rectTransform.localPosition;
        pos = pos.Clamp(
            min: parentRectTransform.rect.min - rectTransform.rect.min, 
            max: parentRectTransform.rect.max - rectTransform.rect.max);
        rectTransform.localPosition = pos;
    }
}
{% endhighlight %}

The drag panel utilizes this base class I created to be used throughout our UI systems. We reference the RectTransform quite a lot, so this class caches it and the parent's for easy access. 

{% highlight c#%}
[RequireComponent(typeof(RectTransform))]
public class MonoBehaviourUI : MonoBehaviour
{
    /// <summary>  The RectTransform attached to this GameObject </summary>
    public RectTransform rectTransform { get; private set; }

    /// <summary> The parent RectTransform of the RectTransform </summary>
    public RectTransform parentRectTransform { get; private set; }

    /// <summary> access the local point </summary>
    /// <param name="eventData"></param>
    /// <returns></returns>
    protected Vector2 GetLocalPoint(PointerEventData eventData)
    {
        RectTransformUtility.ScreenPointToLocalPointInRectangle(
            parentRectTransform,
            eventData.position,
            eventData.pressEventCamera,
            out Vector2 localPoint);
        return localPoint;
    }
}
{% endhighlight %}