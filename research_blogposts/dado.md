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
$p_\theta(x)$ might also be initialized as some pre-trained model, in which case we would in effect be implementing a kind of RL fine-tuning (with $f$ as the reward signal). Alternatively, one might initialize $p_\theta(x)$ to be a uniform distribution on a certain set of designs, e.g., those tested in an initial experiment, or initialize it completely at random.
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
<img src="/assets/img/research/dado/titles.webp" style="width: 100%; display: block;" alt="titles"/>
<div style="position: relative;">
  <img src="/assets/img/research/dado/aav.webp" style="width: 100%; display: block;" alt="AAV"/>
  <span style="position: absolute; top: 0.4em; left: 0.5em; line-height: 1;"><strong>a,</strong> AAV</span>
</div>
<div style="position: relative;">
  <img src="/assets/img/research/dado/phot.webp" style="width: 100%; display: block;" alt="CreiLOV"/>
  <span style="position: absolute; top: 0.4em; left: 0.5em; line-height: 1;"><strong>b,</strong> CreiLOV</span>
</div>
</div>

In the figure above, we show one way to obtain a decomposition graph for a protein design problem.
For two proteins, AAV VP1 (which co-assembles into a virus capsid) and CreiLOV (an oxygen-independent fluorophore), we first obtain a 3D structure from AlphaFold3 (column 1 from left).
To extract a decomposition graph from the 3D structure, we compute distances between all pairs of designable positions and create an edge if they're within 4.5Å of each other (column 2).
Briefly, we can (easily) convert any undirected graph into a directed *junction tree* (column 5; also columns 3--4), which we'll need in the next section.

Notice that the decomposition graph for AAV (column 2) has few edges and is relatively chain-like. This suggests that we will be able to realize a large efficiency gain by operating in its decomposed design space.
On the other hand, CreiLOV looks a lot more like a fully-connected graph. In this case, we can't expect to improve over a naive optimization method which considers all variables jointly.
Of course, one could choose (e.g., based on domain-knowledge) to lower the contact distance, resulting in a more sparsely-connected decomposition with a larger potential efficiency gain.
This hints at a key tradeoff in practice: the more decomposed the problem, the more efficiently it can be optimized, but if the chosen decomposition is too aggressive, it might preclude performant designs from being found.


### Leveraging decomposability for efficient distributional optimization

Now that we have a sense of the decomposition graphs we're working with, we can build intuition for how a distributional optimization algorithm that's aware of them will be more efficient.
We call our method Decomposition-Aware Distributional Optimization, or DADO, and it has two important components. 

First, we use a search distribution factorized according to the decomposition graph such that search is performed entirely within the decomposed space.
Each junction tree node (columns 4--5 above) gets its own search distribution, $$p_\theta(\tilde{x}_i\mid \tilde{x}_p)$$, conditioned on its parent.
Compared to the standard EDA, which searches all dimensions of $$x$$ together, we have multiple separate search distributions, each searching only the dimensions of $$x$$ specified by its junction tree node.
This factorization makes it so that DADO only "sees" the smaller decomposed space[^fda].

Second, we coordinate these separate search distribution factors by passing messages between them.
Messages called **value functions** are passed from the leaves of the junction tree to the root, communicating to each parent node the status of its children.
These value functions, $$Q_i(\tilde{x}_i, \tilde{x}_p)$$, describe the partial value of $f$ on the subtree from a particular node, in expectation over its search distribution (and its descendants' search distributions).
Each node aggregates all of its children's value functions into its own and then uses it to shift its search distribution optimally with respect to its children.
Specifically, each search distribution factor gets its own, separate weighted maximum likelihood update, using its value function as the weight instead of $f(x)$ directly.
This separate update step makes DADO more statistically efficient than the standard EDA: each lower-dimensional distribution is updated using the full sample budget (panel b, below).
Decentralized updates are only possible because the value functions provide explicit coordination across all design variables (most importantly, those out of scope).
The conditional dependence of each search distribution factor and value function closes the loop: each node responds to whichever partial designs are sampled from its parent's search distribution.
As a consequence, all coordination flows through the root node, which indirectly aggregates value functions from all other nodes in the junction tree and upon whose samples all other nodes are indirectly conditioned.
Sequential conditional sampling from the root to the leaves produces high-$f$ designs once DADO has been trained.

<img src="/assets/img/research/dado/schematic.webp" style="width: 100%; display: block;" alt="DADO schematic"/>

Given some tree-decomposition of $f$ (panel a), <a href="#eda-pseudocode">standard EDAs</a> ignore this information and simply weight samples from a joint search distribution over all design variables, $p_\theta(x)$, with $f(x)$ (panel b, top).
In contrast, DADO is infused with the decomposition---its search distribution is factorized accordingly, and value functions are used to weight dimensions of each sample corresponding to each node (panel b, bottom).
DADO can be much more statistically efficient than a standard EDA for a fixed sample budget because it gets to use all $K$ samples to update each lower-dimensional search distribution factor.
This can lead to finding the same good designs as a standard EDA in fewer iterations, or simply better designs, which may have required a much larger sample budget for a standard EDA to find (example results on a synthetic problem in panel c).

In summary, DADO both operates in a smaller, decomposed design space compared to the standard EDA, and uses a more statistically efficient sample-based update to its search distribution.
For definitions and derivations of the value functions and optimization objectives, read the paper!


### Outtakes

Finding an accurate decomposition for a design problem is not always straightforward. The real world is often structured though, and even very approximate decompositions can be useful.
One might try to infer decomposability from labeled data, use auxiliary information, run a bi-level optimization, or some other creative scheme.
This is an exciting research direction both for proteins and scientific design in general.

We also expect that there are more clever ways to estimate the value functions, which could improve optimization efficiency further and make DADO practical for problems with even larger junction tree nodes.
That is, the more accurate the value functions, the more one can squeeze out of densely connected (not very tree-like!) decomposition graphs.
The RL literature is likely a good place to look for inspiration.


We hope you'll read (and enjoy) our paper!
Feel free to [email me](mailto:jcbowden@berkeley.edu) with any questions or comments.
I'd also be excited to discuss applying our method to your problem, or potential collaboration.

---

<script>
document.addEventListener('DOMContentLoaded', function () {
  function makeOverlay(inner) {
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out';
    ov.appendChild(inner);
    ov.addEventListener('click', function () { document.body.removeChild(ov); });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { document.body.removeChild(ov); document.removeEventListener('keydown', onKey); }
    });
    document.body.appendChild(ov);
  }

  var composite = document.getElementById('dado-composite');
  composite.addEventListener('click', function () {
    var rect = composite.getBoundingClientRect();
    var scale = Math.min(window.innerWidth * 0.92 / rect.width, window.innerHeight * 0.92 / rect.height);
    var clone = composite.cloneNode(true);
    clone.removeAttribute('id');
    clone.style.cssText += ';transform:scale('+scale+');transform-origin:center;width:'+rect.width+'px;cursor:default;pointer-events:none';
    makeOverlay(clone);
  });

  var schematic = document.querySelector('img[src$="schematic.webp"]');
  schematic.style.cursor = 'zoom-in';
  schematic.addEventListener('click', function () {
    var img = document.createElement('img');
    img.src = schematic.src;
    img.style.cssText = 'max-width:92vw;max-height:92vh;object-fit:contain;cursor:default';
    makeOverlay(img);
  });
});
</script>

[^scaffold]: At its strongest. People know that this assumption doesn't hold everywhere; e.g., if the scaffold is modified such that the protein no longer folds properly, then the active site probably won't be able to contribute to overall function in any way. Emphasis is more on the fact that people often break their protein design problems down into these two smaller problems, which are then much easier to tackle, even if the decomposition isn't perfect. We use the crudest version of this assumption as a didactic example.

[^fda]: We include a baseline that *only* uses a factorization of the search distribution, without the message-passing coordination. That is, the factorized search distribution is updated the same way as the standard EDA, with a per-sample weight, $f(x)$, instead of a per-node weight. We call this the factorized distribution algorithm, or FDA. It's interesting that for some problems, FDA performs as well as or better than DADO, despite its search distribution update being less statistically efficient. Our hypothesis for why this happens is that there's another source of variance---the sample-based approximation of DADO's value functions---which can outweigh the benefit of a per-node update. We only observed this when the junction tree nodes were relatively large, which is exactly when estimating a value function from finite samples is most difficult. It would be interesting to more carefully characterize this behavior, and one might adapt variance-reduction techniques from RL (like learned value functions) here.
