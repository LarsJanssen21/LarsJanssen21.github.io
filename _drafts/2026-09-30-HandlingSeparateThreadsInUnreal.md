---
project: unreal-ble
tags: [Threads, Unreal Engine, OS Threads]
---

## Snippets from handling platform native code in Unreal

*This articles was made as a result of findings during an assignment at my studies at BUas (Breda University of applied sciences)*

<p align="center">
     <img src="/Images/BLECover.PNG" alt="Blueprint graph from BLE implementation" width="100%"><br>
</p>

## Table of contents

- [Snippets from handling platform native code in Unreal](#snippets-from-handling-platform-native-code-in-unreal)
- [Table of contents](#table-of-contents)
- [Introduction](#introduction)
- [OS Threads and data](#os-threads-and-data)
	- [The problem](#the-problem)
	- [Taking advantage of the Unreal Task Graph](#taking-advantage-of-the-unreal-task-graph)
- [Sources](#sources)

## Introduction

Throughout an 8 week school assignment I set myself the challenge to implement Bluetooth Low Energy devices support to Unreal Engine. Specifically wanting to implement the Heart Rate- and Fitness Machine Services for interacting with cycling devices. I think you can say that the endless amount of hours I'm spending on the indoor trainer are starting to get to my head, Wanting to think about those devices outside of training.

It presented some interesting challenges and gave me new insights into Unreal Engine. I'll share some of my findings here.

## OS Threads and data

### The problem

Dealing with platfom native code inside of Unreal Engine had some caveats that needed to be taken into account. One of those is that an OS can spawn a thread whenever it has to perform an operation that requires the bluetooth device to respond. Since we're networking they're a necessary part of the process as we don't want to spend time idling for an OS operation to get completed during runtime.

As we probably create resources on those spawned threads that have to be touched directly or indirectly by UObjects at runtime, we need some sort of mechanism that can ensure the data is transferred back to the main thread, the outline of the problem can bee seen in the diagram below:

<p align="center">
	<img src="/Images/UnrealThreads/ProblemScenarioDiagram.png" width="60%">
</p>

As you can see above we need to solve this problem to be able to use the results we get from the OS thread. **enter Unreal's Task Graph**

### Taking advantage of the Unreal Task Graph

A function native to the Unreal Engine Core that is especially helpful here is ***AsyncTask***, I've copied it's definition below:

```C++
// Async.cpp

void AsyncTask(ENamedThreads::Type Thread, TUniqueFunction<void()> Function)
{
	TGraphTask<FAsyncGraphTask>::CreateTask()
		.ConstructAndDispatchWhenReady(Thread, MoveTemp(Function));
}
```

This function ensures that the function supplied as argument is executed on the named thread at that point (the game thread in our case), which ensures that we can safely marshal contents to other UObjects. I've sketched a simple diagram below roughly showcasing the flow that Unreal uses internally for pumping this queue:

<p align="center">
	<img src="/Images/UnrealThreads/TaskGraphQueueDiagram.png" width="30%" />
</p>




## Sources
[1] <a id="source1" /> [Source 1](#) 
<br>
[2] <a id="source2" /> [Source 2](#) 
<br>

<img src="/Images/Logo BUas_RGB.png" width="40%" />