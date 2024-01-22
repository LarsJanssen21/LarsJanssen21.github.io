## Indirect lighting through irradiance probes

<p align="center">
     <img src="media/ExposureCorrectedScene.png" alt="exposure corrected final result" width="90%"><br>
    Exposure corrected final result
</p>

### Introduction
This blog post was written as part of my grading for the given feature I had to implement. I have written this post to condense the research and implementation into a single readable format. As this post expands beyond what I will be graded for I hope you will be able to learn something or gain some insights from this article.

#### Why indirect illumination?

This school project of mine needed me to learn the necessary skills for a chosen industry position. I chose the position of graphics programmer at Naughty Dog and oriented my project about approximating indirect illumination. As I learned from Naughty Dog at Siggraph 2020[[1]](https://www.naughtydog.com/blog/naughty_dog_at_siggraph_2020) they use a probe based lighting scheme for indirect illumination so this is what I based my implementation on.

#### The theory

The base of this project can be found in the codebase as a continuation from the previous project I had to complete (A PBR renderer, lit through IBL). This meant the entire pipeline for lighting through image based data was already in place. I will briefly go over this process.

The pipeline for drawing IBL constituted of these resources:

If you want to read more on the steps that go into IBL and it's implementation I recommend these resources:

[LearnOpenGL](https://learnopengl.com/PBR/Theory)<br>
[Google's Filament](https://google.github.io/filament/Filament.md.html)

#### The implementation

The implemenation of this requires some rewriting in pseudo code as it was fully created on a certain next gen hardware platform from a japanese company. With this limitation in mind I hope there is still ssomething to take away from reading this


#### Sources
[1] https://www.naughtydog.com/blog/naughty_dog_at_siggraph_2020