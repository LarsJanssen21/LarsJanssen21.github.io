## Octahedral encoding and Depth Values

In this blog post I'll describe the process of extending the diffuse irradiance implementation in my renderer to account for depth based discarding. To solve the problem of light leaks in the current implementation

- [Survey](#survey)

## Survey

first of all I did a small survey of some possible solutions for discarding probes that are occluded by geometry



As soon as the implementation was there I had to investigate whether the values that it was producing where correct. The near plane and far plane for the baking of spherical harmonics were 0.01 and 1000 respectively. But the computation from sampled depth values to linear distance resulted in a range from 0 to 1024. My guess right now is that this has to do with the (lack of) floating point precision. I'm going to bypass the depth pipeline and write the linear distance directly into the alpha channel of the cubemaps and see if this improves it.