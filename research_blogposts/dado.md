---
layout: page
title: DADO
permalink: /dado/
nav_exclude: true
---

This is a short blog post introducing our paper:

> **[Leveraging Discrete Function Decomposability for Scientific Design](https://arxiv.org/abs/2511.03032)**<br/>
> JC Bowden, S Levine, J Listgarten<br/>
> International Conference on Learning Representations (ICLR) 2026
---

Though our method can be used for any optimization problem over a discrete design space, in this blog, for concreteness, let's consider only the problem of designing a protein sequence.
We can set this up as follows:
> The kind of discrete object that we'd like to design, $x$, is a protein sequence in which each design variable (or "position"), $x_i$, is an amino acid from an alphabet, $\mathcal{A}_i$. For simplicity, we'll assume that every position uses the same standard amino acid alphabet of size 20, that is, $\mathcal{A}=\mathcal{A}_i=\mathcal{A}_j$.
> Given the length, $L$, of the sequence we aim to design, we can write the design space as $X := \mathcal{A}^L$. It follows that there are $|\mathcal{A}|^L=20^L$ possible protein sequences to choose from.
> Design is done according to a specification, $f(x)$, such as binding affinity to a target, or gene editing efficiency.
> Putting this all together, our design problem is to find a sequence that maximizes our specification: $x^*=\arg\max_{x\in X} f(x)$.

To motivate our method, Decomposition-Aware Distributional Optimization (DADO), let's begin by considering...

In the era of AI-driven science and engineering, we often want to design discrete objects in silico according to user-specified properties. For example, we may wish to design a protein to bind its target, arrange components within a circuit to minimize latency, or find materials with certain properties. Given a property predictive model, in silico design typically involves training a generative model over the design space (e.g., protein sequence space) to concentrate on designs with the desired properties. Distributional optimization–which can be formalized as an estimation of distribution algorithm or as reinforcement learning policy optimization–finds the generative model that maximizes an objective function in expectation. Optimizing a distribution over discrete-valued designs is in general challenging because of the combinatorial nature of the design space. However, many property predictors in scientific applications are decomposable in the sense that they can be factorized over design variables in a way that could in principle enable more effective optimization. For example, amino acids at a catalytic site of a protein may only loosely interact with amino acids of the rest of the protein to achieve maximal catalytic activity. Current distributional optimization algorithms are unable to make use of such decomposability structure. Herein, we propose and demonstrate use of a new distributional optimization algorithm, Decomposition-Aware Distributional Optimization (DADO), that can leverage any decomposability defined by a junction tree on the design variables, to make optimization more efficient. At its core, DADO employs a soft-factorized "search distribution"–a learned generative model–for efficient navigation of the search space, invoking graph message-passing to coordinate optimization across linked factors.
