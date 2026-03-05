---
layout: page
title: DADO
permalink: /dado/
nav_exclude: true
---

This is a short blog post introducing my paper:

> **[Leveraging Discrete Function Decomposability for Scientific Design](https://arxiv.org/abs/2511.03032)**<br/>
> **JC Bowden**, S Levine, J Listgarten<br/>
> International Conference on Learning Representations (ICLR) 2026

In the era of AI-driven science and engineering, we often want to design discrete objects in silico according to user-specified properties. For example, we may wish to design a protein to bind its target, arrange components within a circuit to minimize latency, or find materials with certain properties. Given a property predictive model, in silico design typically involves training a generative model over the design space (e.g., protein sequence space) to concentrate on designs with the desired properties. Distributional optimization–which can be formalized as an estimation of distribution algorithm or as reinforcement learning policy optimization–finds the generative model that maximizes an objective function in expectation. Optimizing a distribution over discrete-valued designs is in general challenging because of the combinatorial nature of the design space. However, many property predictors in scientific applications are decomposable in the sense that they can be factorized over design variables in a way that could in principle enable more effective optimization. For example, amino acids at a catalytic site of a protein may only loosely interact with amino acids of the rest of the protein to achieve maximal catalytic activity. Current distributional optimization algorithms are unable to make use of such decomposability structure. Herein, we propose and demonstrate use of a new distributional optimization algorithm, Decomposition-Aware Distributional Optimization (DADO), that can leverage any decomposability defined by a junction tree on the design variables, to make optimization more efficient. At its core, DADO employs a soft-factorized "search distribution"–a learned generative model–for efficient navigation of the search space, invoking graph message-passing to coordinate optimization across linked factors.
