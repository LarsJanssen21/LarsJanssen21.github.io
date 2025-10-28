## Octahedral encoding and Depth Values

In this blog post I'll describe the process of extending the diffuse irradiance implementation in my renderer to account for depth based discarding. To solve the problem of light leaks in the current implementation

- [Survey](#survey)

## Survey

first of all I did a small survey of some possible solutions for discarding probes that are occluded by geometry