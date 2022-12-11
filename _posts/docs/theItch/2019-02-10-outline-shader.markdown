---
layout: post
title:  "Outline Shader"
description: "A simple shader for adding contrast"
date:   2019-02-10 11:15:33 -0400
categories: [docs, theItch]
category: Docs
---

Outlines became a necessary feature when I started to include NPC's with similar skin tones into the game. The effect helped a lot with contrasting the player and other NPC's. 

This also afforded me the option of changing the color of the outline without having to edit every sprite as well as at runtime.

<!--more-->

## Google It
The shader was heavily based off [this tutorial](https://www.youtube.com/watch?v=vqDOirux0Es) by [Dapper Dino - Coding Tutorials](https://www.youtube.com/channel/UCjCpZyil4D8TBb5nVTMMaUw) on YouTube. 

I ran into a bit of trouble, so I started with [Unity's Sprites Default Shader](https://github.com/nubick/unity-utils/blob/master/sources/Assets/Scripts/Shaders/Sprites-Default.shader) as a base to work off.

After completing the tutorial I then modified the shader to be an outline shader rather than an inline shader. (The tutorial version places the outline inside the existing sprite)

## Logic
I don't know a lot about the specifics of how this works, but essentially the shader is looking at the alpha value of adjacent pixels.

The shader then adds those alpha values up clamped between 0 and 1 and rounded up. This means that if ANY adjacent pixel has an alpha greater than zero, the value is 1. 

After that, it subtracts the rounded up alpha value of the current pixel. If the new value is still 1, That pixel is part of the outline. This is because a solid pixel with solid neighbors will negate to 0 and not be highlighted while a transparent pixel with solid neighbors will remain at 1 and be highlighted. Any pixel with all transparent neighbors is also not part of the outline

## Sprite Padding

The only problem I had left was that the player filled the 16x16 sprite and there were no pixels to sample below his feet and above his head. This was solved by adding a pixel of transparent padding to make the sprite 18x18. 

![Result]({{site.url}}/media/TheItch/Outline.gif)

## Unedited Shader (Update Soon?)

Apologies for the highly unoptimized and uncommented code.

{% highlight c %}
Shader "Hidden/PixelOutline3"
{
	Properties
	{
		[PerRendererData] _MainTex("Sprite Texture", 2D) = "white" {}
		_Color("Tint", Color) = (1,1,1,1)
		_Outline("Outline", Color) = (1,1,1,1)
		[MaterialToggle] PixelSnap("Pixel snap", Float) = 0
	}
		SubShader
		{
			Tags
			{
				"Queue" = "Transparent"
				"IgnoreProjector" = "True"
				"RenderType" = "Transparent"
				"PreviewType" = "Plane"
				"CanUseSpriteAtlas" = "True"
			}

			Cull Off
			Lighting Off
			ZWrite Off
			Blend One OneMinusSrcAlpha

			Pass
			{
			CGPROGRAM
				#pragma vertex vert
				#pragma fragment frag
				#pragma multi_compile _ PIXELSNAP_ON
				#include "UnityCG.cginc"

				struct appdata_t
				{
					float4 vertex   : POSITION;
					float4 color    : COLOR;
					float2 texcoord : TEXCOORD0;
				};

				struct v2f
				{
					float4 vertex   : SV_POSITION;
					fixed4 color : COLOR;
					float2 texcoord  : TEXCOORD0;
				};

				fixed4 _Color;
				fixed4 _Outline;

				v2f vert(appdata_t IN)
				{
					v2f OUT;
					OUT.vertex = UnityObjectToClipPos(IN.vertex);
					OUT.texcoord = IN.texcoord;
					OUT.color = IN.color * _Color;
					#ifdef PIXELSNAP_ON
					OUT.vertex = UnityPixelSnap(OUT.vertex);
					#endif

					return OUT;
				}

				sampler2D _MainTex;
				sampler2D _AlphaTex;
				float _AlphaSplitEnabled;
				float4 _MainTex_TexelSize;

				fixed4 SampleSpriteTexture(float2 uv)
				{
					fixed4 color = tex2D(_MainTex, uv);

	#if UNITY_TEXTURE_ALPHASPLIT_ALLOWED
					if (_AlphaSplitEnabled)
						color.a = tex2D(_AlphaTex, uv).r;
	#endif //UNITY_TEXTURE_ALPHASPLIT_ALLOWED

					return color;
				}

				fixed4 frag(v2f IN) : SV_Target
				{
					fixed4 c = SampleSpriteTexture(IN.texcoord) * IN.color;
					c.rgb *= c.a;
					
					half4 outlineC = _Outline;
					//outlineC.a *= ceil(c.a);
					outlineC.rgb *= outlineC.a;
					
					fixed myAlpha = c.a;
					fixed upAlpha = tex2D(_MainTex, IN.texcoord + fixed2(0, _MainTex_TexelSize.y)).a;
					fixed downAlpha = tex2D(_MainTex, IN.texcoord - fixed2(0, _MainTex_TexelSize.y)).a;
					fixed rightAlpha = tex2D(_MainTex, IN.texcoord + fixed2(_MainTex_TexelSize.x, 0)).a;
					fixed leftAlpha = tex2D(_MainTex, IN.texcoord - fixed2(_MainTex_TexelSize.x, 0)).a;

					return lerp(c, outlineC, ceil( clamp(downAlpha + upAlpha + leftAlpha + rightAlpha, 0, 1) ) - ceil(myAlpha));
				}
			ENDCG
			}
		}
}

{% endhighlight %}
