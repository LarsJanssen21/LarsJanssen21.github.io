## Indirect lighting through irradiance probes

<p align="center">
     <img src="/Images/ExposureCorrectedScene.png" alt="Exposure corrected final result" width="100%"><br>
    <i>Exposure corrected final result (simulating shadow and highlight exposure correction through masking in photoshop <a href="#photoshop-blending">see for more info</a>)</i>
</p>

## Table of contents

- [Indirect lighting through irradiance probes](#indirect-lighting-through-irradiance-probes)
- [Table of contents](#table-of-contents)
- [Introduction](#introduction)
		- [Why indirect illumination?](#why-indirect-illumination)
- [Theory](#theory)
	- [Abstract](#abstract)
	- [Solving the irradiance question](#solving-the-irradiance-question)
	- [Populating probes in a scene](#populating-probes-in-a-scene)
- [Implementation](#implementation)
	- [High-level overview](#high-level-overview)
	- [Reducing the irradiance memory print](#reducing-the-irradiance-memory-print)
	- [From position to irradiance probe](#from-position-to-irradiance-probe)
	- [Indexing into your grid](#indexing-into-your-grid)
	- [Rendering](#rendering)
	- [Taking this a step further](#taking-this-a-step-further)
- [Exposure correction explanation](#exposure-correction-explanation)
- [Sources](#sources)

## Introduction
I am currently enrolled at Breda University of Applied Sciences as a 2nd year programming student, this blog post was written as part of my grading for the given feature I had to implement. I have written this post to condense the research and implementation into a single readable format. As this post expands beyond what I will be graded for I hope you will be able to learn and gain some insights from this article.

#### Why indirect illumination?

This school project of mine needed me to learn the necessary skills for a chosen industry position. I chose the position of graphics programmer at Naughty Dog and oriented my project around approximating indirect illumination. As I learned from Naughty Dog at Siggraph 2020[[1]](#source1) they use a probe based lighting scheme for indirect illumination so this is what I based my implementation on.



## Theory

### Abstract
The problem we're solving here is approximating indirect illumination in a way that better simulates light bouncing through the scene instead of a flat ambient term. Tons of research has already been poured into this problem. I have assembled an implementation based on several different research papers and implementations (see [sources](#sources))

<div class="juxtapose" align="center">
	<img src="/Images/Flat ambient term.png" width="80%"/>
	<img src="/Images/Indirect Illumination term.png" width="80%">
</div>
<script src="https://cdn.knightlab.com/libs/juxtapose/latest/js/juxtapose.min.js"></script>
<link rel="stylesheet" href="https://cdn.knightlab.com/libs/juxtapose/latest/css/juxtapose.css">
<p align="center">
<i>Comparison between flat ambient term and probe based indirect illumination</i>
</p>


### Solving the irradiance question
Irradiance data can roughly be explained as the incoming light from all possible directions, so how de we generally solve this unknown?

Since calculating irradiance means integrating the light coming from **an infinite possibility of directions** over a hemisphere it is infeasible to expect any answer, let alone in real-time on consumer hardware. This means we have to approximate the irradiance using something like a **Riemann sum**, this process of discretization generally returns results that are more than good enough for real-time purposes, this yield us with the following equation we have to compute:

$$ L_o(p, \phi_o, \theta_o) = k_d {c \over \pi} \int_{\phi=0}^{2\pi} \int_{\theta=0}^{\frac{1}{2}\pi} L_i(p, \phi_i, \theta_i) \cos(\theta) \sin(theta) d\phi d\theta$$

<p align="center">
	In polar coordinates<a href="#source5">[5]</a>
</p>

$$ L_o(p, \phi_o, \theta_o) = k_d {c\pi \over n1n2} \sum_{\phi = 0}^{n1} \sum_{\theta=0}^{n2} L_i(p, \phi_i, \theta_i) \cos(\theta) \sin(theta) d\phi d\theta$$

<p align="center">
	As a Riemann-sum approximation <a href="#source5">[5]</a> with n1 and n2 discrete samples
</p>

Where **L<sub>i</sub>** is the incoming light and **L<sub>o</sub>** the irradiance

We can then use this equation to compute the irradiance and store this in several ways, Like cubemaps in the classic IBL implementation or spherical harmonics for a more efficient use of memory

<p align="center" width="80%">
	<img src="/Images/IBL_DiffuseIrradiance.png"><br>
	<i>Storing of irradiance values in a cubemap, Each pixel represents the irradiance for a given normal</i>
</p>

### Populating probes in a scene

Ideally, we would calculate the irradiance for a given point and it's normal in the scene, but, since solving the equation in <a href="#solving-the-irradiance-question">Solving the irradiance question</a> in a real-time application is infeasible we have to rely on an approximation. In my implementation I use something called a probe (diffuse probe, irradiance probe, IBL probe, light probe, e.t.c.), that captures the irradiance at a given point in the scene.<br>
Luckily diffuse irradiance data depening on the density of placements doesn't vary that much spatially so generally these approximations return results that are plausible enough.

Some options to consider when placing probes in the scene
- Placing on a regular grid
- Sparse placement
- Hand placing probes

When placing these probes keep in mind how they will be interpolated, by using the regular grid we use a trilinear interpolation function, the same interpolation techniques will carry over to something like a sparse grid, but depending on how you place the probes within your own data structure you might need to use a more complex interpolation method.



## Implementation

The implemenation of this requires some rewriting in pseudo code as it was fully created on a Playstation 5&#174;. With this in mind I hope there is still something to take away from reading this.

### High-level overview

The high level overview of the implementation goes as follows:
- Create a regular grid containing the scene
- For each point on the grid:
  - Draw a cubemap
  - Convert this cubemap to spherical harmonics
- When drawing:
  - Get the world space postion and the normal for given pixel/fragment
  - With a lookup function find the eight corners of the grid cell overlapping the position
  - trilinearly interpolate between the eight probes, discarding the probes that are behind the surface normal
  - Add this to the final radiance (replacing the 'ambient' term)

### Reducing the irradiance memory print

As alluded to in the theoretical side of this article we use 2nd order spherical harmonics for storing the irradiance[[6]](#source6). This reduces the memory footprint for diffuse data to 9 3-component vectors. or in shader language.
```C++
struct SH9Irradiance
{
    float3 band0_0;
    float3 band1_n1, band1_n0, band1_p1;
    float3 band2_n2, band2_n1, band2_0, band2_p1, band2_p2;
};
```

A single probe is then represented like this

```C++
struct Probe
{
    SH9Irradiance IrradianceCoefficients;
    float3 Position;
}
```

For any given normal we can generate the coefficients for each order and band using the following function:

```C++
SH9 GenSHCoefficients(float3 normal)
{
	sh::SH9 result;

	result.band0_0 = 0.282095f;

	result.band1_n1 = 0.488603f * normal.y;
	result.band1_0 = 0.488603f * normal.z;
	result.band1_p1 = 0.488603f * normal.x;

	result.band2_n2 = 1.092548f * normal.x * normal.y;
	result.band2_n1 = 1.092548f * normal.y * normal.z;
	result.band2_0 = 0.315392f * (3 * normal.z * normal.z - 1.0f);
	result.band2_p1 = 1.092548f * normal.x * normal.z;
	result.band2_p2 = 0.54627f * (normal.x * normal.x - normal.y * normal.y);

	return result;
}
```

Where SH9 is a struct containing 9 scalar coefficients.

Retrieving the irradiance signal can then be computed as follows
```C++
float3 CalcSHIrradiance(float3 normal, SH9Irradiance irrCoeff)
{
	const float A0 = 3.141593f;
	const float A1 = 2.094395f;
	const float A2 = 0.785398f;

	SH9 coefficients = GenSHCoefficients(normal);

	return
		irrCoeff.band0_0 * coefficients.band0_0 * A0 +
		irrCoeff.band1_n1 * coefficients.band1_n1 * A1 +
		irrCoeff.band1_0 * coefficients.band1_0 * A1 +
		irrCoeff.band1_p1 * coefficients.band1_p1 * A1 +
		irrCoeff.band2_n2 * coefficients.band2_n2 * A2 +
		irrCoeff.band2_n1 * coefficients.band2_n1 * A2 +
		irrCoeff.band2_0 * coefficients.band2_0 * A2 +
		irrCoeff.band2_p1 * coefficients.band2_p1 * A2 +
		irrCoeff.band2_p2 * coefficients.band2_p2 * A2;
}
```

The encoding of irradiance signals into these harmonics will be displayed in the section [From position to irradiance probe](#from-position-to-irradiance-probe).

### From position to irradiance probe

The pipeline for baking probes consist of a two step process:
- Generate a cubemap
- Use this cubemap to compute spherical harmonics

As I showed in [Solving the irradiance question](#solving-the-irradiance-question) we can compute the irradiance integral for a cubemap by taking samples over a hemisphere for each pixel in the cubemap, We essentially do the same thing with spherical harmonics but we calculate the coefficients for different bands per pixel's normal and add these together weighted by the differential solid angle of the pixel. As the total weight should be 4&#960;[[7]](#source7)[[8]](#source8) we normalize the weight by dividing by _weightSum_ to make sure we apply a correct correction factor. 

In a  shader language:

```C++
[NumThreads(1, 1, 1)]
void main(uint3 DTid : SV_DISPATCH_THREAD_ID)
{
	uint index = DTid.x;

	SH9Irradiance irrOut = {};

	float weight, weightSum = 0.0f;
	for(uint face = 0; face < 6; face++)
	{
		for(uint x = 0; x < Resolution; x++)
		{
			for(uint y = 0; y < Resolution; y++)
			{
				float u = (x + 0.5f) / (float)Resolution;
				float v = (y + 0.5f) / (float)Resolution;
				u = u * 2.0f - 1.0f;
				v = v * 2.0f - 1.0f;
	
				float temp = 1.0f + u*u + v*v;
				weight = 4.0f/(sqrt(temp) * temp);
	
				float3 normal = GetCubefaceSamplingVector((int)face, float2(u, v));

				float3 irradiance = Cubemaps[index].Sample(sampler, normal).rgb;
				irrOut += GenerateIrradianceCoefficientsFromNormal(normal, irradiance) * weight;

				weightSum += weight;
			}
		}
	}

	irrOut *= (4.0f * PI) / weightSum;

	srtinst.Probes[index].IrradianceCoefficients = irrOut;
}
```

### Indexing into your grid

For my implementation I index into individual grid cells using the fragment's world space position.

### Rendering

Eventually all this work leads to a relatively minor addition/replacement in the shader responsible for lighting your scene.

```C++

// Direct light calculations...

radiance += GetIrradiance(WSPosition, normal);

// Preparing for output...

```

### Taking this a step further

Alternative features that can be implemented to improve/enhance the algorithm. Serving as inspiration to the reader as well as a list for myself to implement outside of what the 7 weeks of school work allowed me to do
- **Using a ray-tracer to get radiance values**<br>
	Currently we generate a cubemap per probe and sample the radiance as a pixel in the texture. We could also spawn some 	rays per probe and use these radiance values to compute the harmonics.This process is very similair to what Nvidia 	uses in their real-time hardware accelerated ray-tracing  global illumination algorithm[[2]](#source2)

- **Encoding visibility**<br>
	The implementation only naively discards probes based on a surface normal test. This is far from sufficient in 	reducing light leaks. We can encode depth information in a 2d texture that maps the normals of a sphere to an 	unfolded octahedron[[3]](#source3). Eliminating many cases where a probe is inside geometry.

- **Screen space ambient occlusion**<br>
	To better embed objects in the scene screen space ambient occlusion is a great way to create a cohesion between objects close together.

- **Reflections**<br>
The implementation currently only supports diffuse irradiance data. A nice addition to handle more complex scenes would be a way to handle reflections. I'll list several options here:
  - Stochastic screen space reflections[[4]](#source4)
  - Raytraced reflections
  - Automatic or manually placed reflection probes

## <a id="photoshop-blending"></a>Exposure correction explanation

To be totally transparent about the cover image of this article. The given time for the project did not allow me to implement localized tone mapping. To be able to showcase an image with visible details in both the highlight and shadows I had to simulate the tone mapping through photoshop by blending a high and low exposure image based on luminance values. All images used are showed below:

|High exposure	|	Low exposure	|
|---|---|
|![](/Images/HighExposure.png)	| ![](/Images/LowExposure.png)	|

## Sources
[1] <a id="source1" /> [Naughty Dog at siggraph 2020](https://www.naughtydog.com/blog/naughty_dog_at_siggraph_2020) 
<br>
[2] <a id="source2" /> [Nvidia RTXGI](https://developer.nvidia.com/rtx/ray-tracing/rtxgi) 
<br>
[3] <a id="source3" /> [Morgan McGuire, Mike Mara, Derek Nowrouzezahrai, and David Luebke. 2017. Real-time global illumination using precomputed light field probes. In Proceedings of the 21st ACM SIGGRAPH Symposium on Interactive 3D Graphics and Games (I3D '17). Association for Computing Machinery, New York, NY, USA, Article 2, 1–11. https://doi.org/10.1145/3023368.3023378](https://doi.org/10.1145/3023368.3023378) 
<br>
[4] <a id="source4" /> [Frostbite stochastic screen space recflections](https://www.ea.com/frostbite/news/stochastic-screen-space-reflections)
<br>
[5] <a id="source5"> [LearnOpengL diffuse irradiance](https://learnopengl.com/PBR/IBL/Diffuse-irradiance)
<br>
[6] <a id="source6" /> [Ravi Ramamoorthi and Pat Hanrahan. 2001. An efficient representation for irradiance environment maps. In Proceedings of the 28th annual conference on Computer graphics and interactive techniques (SIGGRAPH '01). Association for Computing Machinery, New York, NY, USA, 497–500. https://doi.org/10.1145/383259.383317](https://doi.org/10.1145/383259.383317)
<br>
[7] <a id="source7"> [Andrew Pham: Spherical Harmonics](https://andrew-pham.blog/2019/08/26/spherical-harmonics/)
<br>
[8] <a id="source8"> [Wikipedia: Solid Angle](https://en.wikipedia.org/wiki/Solid_angle)
<br>

<img src="/Images/Logo BUas_RGB.png" width="40%" />