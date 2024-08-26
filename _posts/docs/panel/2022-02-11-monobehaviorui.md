---
layout: post
title:  "MonoBehaviorUI"
description: "Common Unity UI base class"
date:   2020-12-28 11:15:33 -0400
categories: [docs, panel]
category: Docs
---

This is a common class I use when developing UI systems is this MonoBehaviorUI script which bundles together functions I found useful across Unity UI development. 

## RectTransform and ParentRectTransform
allows quick access of the **RectTransform** component as well as the **parent RectTransform**. Here casting is used over caching so that re-parenting does not cause any issues. **RequireComponent** is also used to guarantee a successful cast. 

#### Get Local Point 
wrapper for RectTransformUtility.ScreenPointToLocalPointInRectangle which is helpful for translating mouse position into local coordinates. Raw mouse position as eventData.position will work for Screen Space UI's, but will break on World-Space UI's. Using this simple function accounts for both while keeping the logic the same. 

#### AdjustPivot 
Slightly more technical, but it essentially lets me set the pivot while keeping the RectTransform in place on the screen.

Full Explanation: 
Position is the offset of the pivot from the anchors. When setting the pivot of a RT, the position of the RT will remain at the same fixed value. Therefore when setting the pivot, it will remain at the same point on the screen while the RT appears to move on the screen. AdjustPivot() calculates how far the RT will appear to move and counter adjusts the position to keep it in place on the screen. 

## CODE
{% highlight c#%}

[RequireComponent(typeof(RectTransform))]
public class MonoBehaviourUI : MonoBehaviour
{
    /// <summary>  The RectTransform attached to this GameObject </summary>
    public RectTransform rectTransform { get => transform as RectTransform; }

    /// <summary> The parent RectTransform of the RectTransform </summary>
    public RectTransform parentRectTransform { get => transform.parent as RectTransform; }

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
    
    /// <summary> Set the pivot while maintaining rectTransform localPosition </summary>
    /// <param name="pivot"> normalized position within the rect </param>
    protected void AdjustPivot(Vector2 pivot)
    {
        Vector2 pivotDiff = rectTransform.pivot - pivot;
        rectTransform.pivot = pivot; // set the pivot, this will move the rectTransform ...
        rectTransform.localPosition -= (Vector3)(rectTransform.sizeDelta * pivotDiff); // ... so inverse that movement
    }
}
{% endhighlight %}