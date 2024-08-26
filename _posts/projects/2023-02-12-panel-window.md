---
layout: post
title:  "Panel Windows"
description: "Recreation of a windows style OS that handles dragging / resizing / snapping"
date:   2023-02-12 11:15:33 -0400
tags: [C#, Unity]
categories: [projects, featured]
category: Professional
banner_preview: preview-eva.png
banner_image: banner-wip.png
docs-category: panel
---

This system was developed for training applications where the user is learning a specialized program that utilizes multiple configurable windows. It can be used to mimic operating systems where multiple windows can be open, moved around, minimized for later use etc... 


<!--more-->


# Drag Panels

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