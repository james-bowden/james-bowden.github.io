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
1. The kind of discrete object that we'd like to design, $x$, is a protein sequence of length $L$ in which each design variable (or "position"), $x_i$, is an amino acid from an alphabet, $A_i$. For simplicity, we'll assume that every position uses the same standard amino acid alphabet of size 20, $A$.
2. Given $L$ and $A$, we can write the design space as $X := A^L$, i.e., all proteins of length $L$. It follows that there are $\lvert A\rvert^L=20^L$ possible proteins to choose from.
3. Specify a property function to design toward, $f(x)$, such as binding affinity to a target, or gene editing efficiency. In practice, this may be a predictive model fit on limited assay-labeled data.
4. Putting this all together, our design problem is to find a sequence that maximizes our specification: $x^*=\arg\max_{x\in X} f(x)$.

**Distributional optimization** is a standard way of solving such design problems; estimation of distribution algorithms (EDAs) and policy optimization in reinforcement learning are two popular instantiations. 
Compared to naively evaluating one protein, then the next, until all of $X$ has been considered, distributional optimization algorithms navigate the design space using a probability distribution, $p_\theta(x)$, often referred to as a "search distribution" or a "policy". 
Intuitively, the search distribution is a like a spotlight that moves through the design space toward regions where $f(x)$ is larger. 
In modern times, $p_\theta(x)$ is typically parameterized as a highly expressive neural network generative model, like an autoregressive model or diffusion model, allowing for pretty arbitrarily shaped spotlights.
$p_\theta(x)$ might also be initialized as some pre-trained model, in which case an EDA implements a kind of RL fine-tuning. Alternatively, one might initialize $p_\theta(x)$ to be a uniform distribution on a certain set of designs, e.g., those tested in an initial experiment, or just completely randomly.
In pseudocode, a standard distributional optimization workflow looks like this:
<figure style="border: 1px solid #ccc; border-radius: 4px; padding: 0.75em 1em; margin: 1.5em 0;">
<figcaption style="font-weight: bold; margin-bottom: 0.5em;">Standard EDA pseudocode</figcaption>
<ol style="font-family: monospace; margin: 0; padding-left: 3em;">
<li>Initialize $p_\theta(x)$</li>
<li style="list-style-type: none;">&nbsp;</li>
<li>for $N$ training iterations do</li>
<li>{{ site.indent }}Sample $K$ designs $\{x^1, \ldots, x^K\} \sim p_\theta(x)$</li>
<li>{{ site.indent }}Compute a weight for each sample, $w^k=f(x^k)$</li>
<li>{{ site.indent }}Update $p_\theta(x)$ via weighted maximum likelihood:</li>
<li>{{ site.indent }}{{ site.indent }}$\theta \leftarrow \arg\max_\theta \mathbb{E}_{\{x^k\}}[w^k \log p_\theta(x^k)]$</li>
<li style="list-style-type: none;">&nbsp;</li>
<li>Sample $p_\theta(x)$ up to your experimental budget and test in the lab!</li>
</ol>
</figure>


To motivate our method, Decomposition-Aware Distributional Optimization (DADO), let's begin by considering...
