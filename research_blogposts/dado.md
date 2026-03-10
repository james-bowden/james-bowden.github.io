---
layout: page
title: "DADO: Leveraging Discrete Function Decomposability for Scientific Design"
permalink: /dado/
nav_exclude: true
nav_enabled: false
hide_search: true
image: /assets/img/research/dado/schematic_lowres.png
description: "We introduce DADO, a method that leverages discrete function decomposability to efficiently search combinatorial design spaces."
---

This is a short blog post introducing our paper:

> **[Leveraging Discrete Function Decomposability for Scientific Design](https://arxiv.org/abs/2511.03032)**<br/>
> [JC Bowden](https://james-bowden.github.io){:.author-link}, [S Levine](https://people.eecs.berkeley.edu/~svlevine/){:.author-link}, [J Listgarten](http://www.jennifer.listgarten.com/){:.author-link}<br/>
> International Conference on Learning Representations (ICLR), 2026

---

<details style="margin-top: 1.5em;">
<summary><h3 style="display: inline;">Problem setup: protein sequence design</h3></summary>

Though our method can be used for any optimization problem over a discrete design space, in this blog, for concreteness, let's consider only the problem of designing a protein sequence.
We can set this up as follows:
<ol>
<li>The kind of discrete object that we'd like to design, $x$, is a protein sequence of length $L$ in which each design variable (or "position"), $x_i$, is an amino acid from an alphabet, $A_i$. For simplicity, we'll assume that every position uses the same standard amino acid alphabet of size 20, $A$.</li>
<li>Given $L$ and $A$, we can write the design space as $X := A^L$, i.e., all amino acid sequences of length $L$. It follows that there are $\lvert A\rvert^L=20^L$ possible proteins to choose from.</li>
<li>Specify a property function to design toward, $f(x)$, such as binding affinity to a target, or gene editing efficiency. In practice, this may be a predictive model fit on limited assay-labeled data.</li>
<li>Putting this all together, our design problem is to find a sequence that maximizes our specification: $x^{\ast}=\arg\max_{x\in X} f(x)$.</li>
</ol>

</details>

<details style="margin-top: 1.5em;">
<summary><h3 style="display: inline;">Primer: distributional optimization and EDAs</h3></summary>

Distributional optimization is a way of solving such design problems; estimation of distribution algorithms (EDAs) and policy optimization in reinforcement learning are two common instantiations.
Compared to naively evaluating one protein, then the next, until all of $X$ has been considered, distributional optimization algorithms navigate the design space using a probability distribution, $p_\theta(x)$, often referred to as a "search distribution" or a "policy".
Intuitively, the search distribution is like a spotlight that moves through the design space toward regions where $f(x)$ is larger.
In modern times, $p_\theta(x)$ is typically parameterized as a highly expressive neural network generative model, like an autoregressive model or diffusion model, allowing for pretty arbitrarily shaped spotlights.
$p_\theta(x)$ might also be initialized as some pre-trained model, in which case we would in effect be implementing a kind of RL fine-tuning (with $f$ as the reward signal). Alternatively, one might initialize $p_\theta(x)$ to be a uniform distribution on a certain set of designs, e.g., those tested in an initial experiment, or just completely randomly.
In pseudocode, a standard distributional optimization workflow looks like this:

<figure id="eda-pseudocode" style="border: 1px solid #ccc; border-radius: 4px; padding: 0.75em 1em; margin: 1.5em 0;">
<figcaption style="font-weight: bold; margin-bottom: 0.5em;">Standard EDA pseudocode</figcaption>
<ol style="font-family: monospace; margin: 0; padding-left: 3em;">
<li>Initialize $p_\theta(x)$</li>
<li>for $N$ training iterations do</li>
<li>{{ site.indent }}Sample $K$ designs, $\{x^1, \ldots, x^K\} \sim p_\theta(x)$</li>
<li>{{ site.indent }}Compute a weight for each sample, $w^k=f(x^k)$</li>
<li>{{ site.indent }}Update $p_\theta(x)$ via weighted maximum likelihood:</li>
<li>{{ site.indent }}{{ site.indent }}$\theta \leftarrow \arg\max_\theta \mathbb{E}_{\{x^k\}}[w^k \log p_\theta(x^k)]$</li>
<li style="list-style-type: none;">&nbsp;</li>
<li>Sample from $p_\theta(x)$ up to your experimental budget and test in the lab!</li>
</ol>
</figure>

There's much more discussion of EDAs, their derivation, relevant hyperparameters, and the important ways they can be extended in our paper.
</details>

### Decomposing the design space

Although the standard EDA is great for solving $$\arg\max_\theta \mathbb{E}_{p_\theta(x)}[f(x)]$$, $$p_\theta(x)$$ still has to search a combinatorially large design space!
Even if we use a lot of samples for the <a href="#eda-pseudocode">weighted maximum likelihood update</a>, it may still take many iterations to find good designs.

In protein design (and other scientific design settings), however, we often have information that can help us <strong>decompose</strong> the design space and thereby search a much smaller space.
For example, many protein design workflows assume, roughly, that the active site of a protein and the scaffold can be designed separately (sometimes called a [scaffolding problem](https://www.nature.com/articles/s41586-023-06415-8#Sec4)).
More formally, if we denote active site positions as $$x_a$$ and scaffold positions as $$x_s$$ (with no overlapping positions; $$L=L_a+L_s$$), this assumption[^scaffold] amounts to asserting that $$f(x_a, x_s) = f_a(x_a) + f_s(x_s)$$.
We can exploit the linear additive structure in $f$ to instead solve two separate, smaller optimization problems, $$[x_a^{\ast}, x_s^{\ast}] = \arg\max_{x_a,x_s} f(x_a, x_s) = [\arg\max_{x_a} f_a(x_a), \arg\max_{x_s} f_p(x_s)]$$,
yielding a massive reduction in the size of the effective search space from $20^L$ to $$20^{L_a} + 20^{L_s}$$. Completely separate EDAs can be used for each. 
Even for a tiny protein composed of two length-$5$ parts, this is a huge gain: $20^{10} \gg 20^5 + 20^5$ (7 orders of magnitude).

We don't expect such clean-cut decomposability in most problems.
**Our core contribution is to generalize the EDA to be able to leverage *any* linear additive structure in $f(x)$.** 
This means, in particular, accommodating design variables that participate in multiple linear additive components, such that we can't just solve completely separate optimization problems.
To do this, we formalize a decomposition of $f(x)$ as an undirected graph in which nodes represent design variables and edges denote coupling. The above example corresponds to a graph with two disconnected components, each of which is fully connected internally.
Let's now look at some graph decompositions derived from real protein design problems.

<div id="dado-composite" style="line-height: 0; cursor: zoom-in;">
<img src="/assets/img/research/dado/titles.png" style="width: 100%; display: block;" alt="titles"/>
<div style="position: relative;">
  <img src="/assets/img/research/dado/aav.png" style="width: 100%; display: block;" alt="AAV"/>
  <span style="position: absolute; top: 0.4em; left: 0.5em; line-height: 1;"><strong>a,</strong> AAV</span>
</div>
<div style="position: relative;">
  <img src="/assets/img/research/dado/phot.png" style="width: 100%; display: block;" alt="CreiLOV"/>
  <span style="position: absolute; top: 0.4em; left: 0.5em; line-height: 1;"><strong>b,</strong> CreiLOV</span>
</div>
</div>

In the figure above, we show one way to obtain a decomposition graph for a protein design problem.
For two proteins, AAV VP1 (which co-assembles into a virus capsid) and CreiLOV (an oxygen-independent fluorophore), we first obtain a 3D structure from AlphaFold3 (column 1 from left).
To extract a decomposition graph from the 3D structure, we compute distances between all pairs of designable positions and create an edge if they're within 4.5Å of each other (column 2).

Notice that the decomposition graph for AAV has few edges and is relatively chain-like. This suggests that we will be able to realize a large efficiency gain by operating in its decomposed design space.
On the other hand, CreiLOV looks a lot more like a fully-connected graph. In this case, we can't expect to improve over a naive optimization method which considers all variables jointly.
Of course, one could choose (e.g., based on domain-knowledge) to lower the contact distance, resulting in a more sparsely-connected decomposition with a larger potential efficiency gain.
This hints at a key tradeoff in practice: the more decomposed the problem, the more efficiently it can be optimized, but if the chosen decomposition is too aggressive, one might preclude performant designs from being found.


### Leveraging decomposition for efficient distributional optimization

Now that we have a sense of the decomposition graphs we're working with, we can build some intuition for how to leverage them for more efficient design.
Briefly, we can convert any decomposition graph into a directed *junction tree* (columns 3--5 above), which classical (non-loopy) message-passing algorithms can utilize.
To use message-passing for optimization, one computes dynamic programming **value functions** at each junction tree node, from the leaves up to the root.
That is, each node $$\tilde{x}_i$$ is associated with a value function $$Q^\text{max}_i(\tilde{x}_i, \tilde{x}_p)$$ which depends on its parent.
These value functions describe the partial maximum of $f$ over a node and all its descendants, and are computed by exact maximization over variables in its children.
By choosing the root node's assignment, $$\tilde{x}_r^\ast = \arg\max_{\tilde{x}_r} Q^\text{max}_r(\tilde{x}_r)$$, and backtracking down the tree, one computes a global optimizer of $f$ with the lowest possible time complexity. 
Still, this classical message-passing will become expensive or intractable if exact maximization must be performed on nodes containing multiple design variables.
Distributional optimization sidesteps this issue because it works with samples from a distribution!
Instead of computing exact value functions, we'll maintain a search distribution at each node conditional on parent node assignment, $$p_\theta(\tilde{x}_i\mid \tilde{x}_p)$$, and compute **distributional value functions**, $$Q^\theta_i(\tilde{x}_i, \tilde{x}_p)$$ in expectation over this partial search distribution. 
In a <a href="#eda-pseudocode">sample-based setting</a>, these distributional value functions are preferable to $Q^\text{max}_i$ because a sample mean is an unbiased estimator of an expectation, whereas unbiased estimators of maxima don't exist for arbitrary distributions.
To produce designs for which $f(x)$ is large, one sequentially samples the partial search distributions, starting from the root, and conditioning on each parent.
We call our method Decomposition-Aware Distributional Optimization, or DADO. 
For definitions and derivations of the value functions and optimization objectives, read the paper!

<img src="/assets/img/research/dado/schematic.png" style="width: 100%; display: block;" alt="DADO schematic"/>

Given some tree-decomposition of $f$ (panel a), <a href="#eda-pseudocode">standard EDAs</a> ignore this information and simply weight samples from a joint search distribution over all design variables, $p_\theta(x)$, with $f(x)$ (panel b, top).
In contrast, DADO is infused with the decomposition---its search distribution is factorized accordingly, and value functions are used to weight corresponding dimensions of each sample (panel b, bottom).
DADO is much more statistically efficient than a standard EDA for a fixed sample budget because it gets to use all $K$ samples to update each lower-dimensional search distribution factor.
This can lead to finding the same good designs as a standard EDA in fewer iterations, or simply better designs, which may have required a much larger sample budget for a standard EDA to find (example results on a synthetic problem in panel c).


### Outtakes

Finding an accurate decomposition for a design problem is not always straightforward. The real world is often structured though, and even very approximate decompositions can be useful.
One might try to infer decomposability from labeled data, use auxiliary information, run a bi-level optimization, or some other creative scheme.
This is an open and active area of research both for proteins and scientific design in general.

We hope you'll read (and enjoy) our paper!
Feel free to [email me](mailto:jcbowden@berkeley.edu) with any questions or comments.
I'd also be excited to discuss applying our method to your problem, or potential collaboration.

---

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css" />
<script src="https://cdn.jsdelivr.net/npm/html2canvas/dist/html2canvas.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
  var composite = document.getElementById('dado-composite');
  html2canvas(composite, { scale: 2 }).then(function (canvas) {
    var lb = GLightbox({ elements: [{ href: canvas.toDataURL(), type: 'image' }] });
    composite.addEventListener('click', function () { lb.open(); });
  });

  var schematic = document.querySelector('img[src$="schematic.png"]');
  var lb2 = GLightbox({ elements: [{ href: schematic.src, type: 'image' }] });
  schematic.style.cursor = 'zoom-in';
  schematic.addEventListener('click', function () { lb2.open(); });
});
</script>

[^scaffold]: At its strongest. People know that this assumption doesn't hold everywhere; e.g., if the scaffold is modified such that the protein no longer folds properly, then the active site probably won't be able to contribute to overall function in any way. Emphasis is more on the fact that people often break their protein design problems down into these two smaller problems, which are then much easier to tackle, even if the decomposition isn't perfect. We use the most crude version of this assumption as a didactic example.
