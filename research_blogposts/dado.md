---
layout: page
title: "DADO: Leveraging Discrete Function Decomposability for Scientific Design"
permalink: /dado/
nav_exclude: true
nav_enabled: false
hide_search: true
image: /assets/img/research/dado/dado_animation_cap.png
description: "We introduce DADO, a method that leverages discrete function decomposability to efficiently search combinatorial design spaces."
---

# **Leveraging Discrete Function Decomposability for Scientific Design**

<strong><a href="https://james-bowden.github.io" class="author-link">JC Bowden</a>, <a href="https://people.eecs.berkeley.edu/~svlevine/" class="author-link">S Levine</a>, <a href="http://www.jennifer.listgarten.com/" class="author-link">J Listgarten</a></strong>
<br>
International Conference on Learning Representations (ICLR), 2026
<br>
<a href="https://arxiv.org/abs/2511.03032" style="text-decoration:none; margin-right:0.1em;">[paper]</a>
<a href="/assets/research/DADO_poster_final.pdf" style="text-decoration:none; margin-right:0.1em;">[poster]</a>
<a href="https://github.com/james-bowden/DADO" style="text-decoration:none; margin-right:0.1em">[code]</a>
<a href="mailto:jcbowden@berkeley.edu" style="text-decoration:none; margin-right:0.1em">[email me]</a>
<a id="bibtex-copy"
   onclick="(function(){
     var s='@inproceedings{bowden2026dado,\n  title={Leveraging Discrete Function Decomposability for Scientific Design},\n  author={Bowden, James C. and Levine, Sergey and Listgarten, Jennifer},\n  booktitle={International Conference on Learning Representations},\n  year={2026}\n}';
     navigator.clipboard.writeText(s).then(function(){
       var el=document.getElementById('bibtex-copy');
       el.textContent='[copied!]';
       setTimeout(function(){el.textContent='[copy bibtex]';},2000);
     });
   })();"
   style="cursor:pointer; user-select:none; margin-right:0.1em; text-decoration:none;">
  [copy bibtex]
</a>

**Written by** James Bowden, with **thanks to** Jenn and Sergey, Cat Glossop, Aileen Zhang, and Shreshth Srivastava for feedback.


<style>
.track-experimentalist {
  border-left: 3px solid #00e676;
  padding: 0.75em 1em;
  border-radius: 0 6px 6px 0;
}
.track-ml {
  border-left: 3px solid #00c8c8;
  padding: 0.75em 1em;
  border-radius: 0 6px 6px 0;
}
.track-rl {
  border-left: 3px solid #ff4d9e;
  padding: 0.75em 1em;
  border-radius: 0 6px 6px 0;
}
#expertise-summary .track-experimentalist { background: rgba(0, 230, 118, 0.10); }
#expertise-summary .track-ml             { background: rgba(0, 200, 200, 0.10); }
#expertise-summary .track-rl             { background: rgba(255, 77, 158, 0.05); }
.optional-box {
  border: 2px solid #e0b800;
  background: rgba(224, 184, 0, 0.10);
  border-radius: 6px;
  padding: 0.15em 0.5em;
  display: inline-block;
  font-size: 1.4em;
  line-height: 1.15;
}
.optional-box::after {
  content: ' ▶';
  font-size: 0.75em;
  color: #888;
  display: inline-block;
  margin-left: 0.3em;
  transition: transform 0.2s;
}
details[open] > .collapsible-summary .optional-box::after {
  transform: rotate(90deg);
}
.fig-ref { font-weight: 500; }
.inline-expand {
  cursor: pointer;
  background: rgba(224, 184, 0, 0.13);
  border-radius: 3px;
  padding: 0 0em;
  text-decoration: underline;
  text-decoration-color: #e0b800;
  text-underline-offset: 2px;
}
.inline-expand::after {
  content: '…';
  color: #999;
  margin-left: 0.1em;
}
.inline-expand.open::after {
  content: '';
}
.details-heading2 {
  font-size: 1.4em;
  font-weight: 500;
  color: #27262b;
}
.collapsible-summary {
  display: flex;
  align-items: center;
  cursor: pointer;
  list-style: none;
}
.collapsible-summary::-webkit-details-marker { display: none; }
.collapsible-summary::marker { content: ''; }
.collapsible-summary::after {
  content: '▶';
  font-size: 1.05em;
  margin-left: 0.42em;
  color: #888;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.collapsible-summary:has(.optional-box)::after {
  content: none;
}
details[open] > .collapsible-summary::after {
  transform: rotate(90deg);
}
</style>


<canvas id="dado-canvas" width="800" height="600" style="width:100%;height:auto;display:block;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);margin:2em 0;"
  aria-label="Animation comparing naive EDA and DADO decomposed search for protein sequence design"></canvas>
<script src="/assets/js/dado-anim.js" defer></script>

<p style="text-align:center; margin-bottom:0.75em;">Choose your own adventure (pick the one best suited to your expertise):</p>
<div style="display:flex; justify-content:center; gap:0.9em; flex-wrap:wrap; margin-bottom:1.5em;">
  <button id="btn-experimentalist" onclick="setExpertise('experimentalist')"
    style="padding:0.55em 1.3em; font-size:1.05em; font-weight:600; border-radius:6px; cursor:pointer; border:2px solid #00e676; background:rgba(0,230,118,0.10); color:inherit; transition:background 0.18s, box-shadow 0.18s;">
    Experimentalist
  </button>
  <button id="btn-ml" onclick="setExpertise('ml')"
    style="padding:0.55em 1.3em; font-size:1.05em; font-weight:600; border-radius:6px; cursor:pointer; border:2px solid #00c8c8; background:rgba(0,200,200,0.10); color:inherit; transition:background 0.18s, box-shadow 0.18s;">
    Machine Learning
  </button>
  <button id="btn-rl" onclick="setExpertise('rl')"
    style="padding:0.55em 1.3em; font-size:1.05em; font-weight:600; border-radius:6px; cursor:pointer; border:2px solid #ff4d9e; background:rgba(255,77,158,0.10); color:inherit; transition:background 0.18s, box-shadow 0.18s;">
    Reinforcement Learning
  </button>
</div>

<div id="expertise-summary" style="margin-bottom:1.5em; min-height:3em;">
<div id="summary-experimentalist" class="expertise-text track-experimentalist" style="display:none;">
    In the era of AI-driven science and engineering, we often want to design proteins, materials, circuits, etc. <em>in silico</em> according to user-specified properties (e.g., that a protein binds its target; <span class="fig-ref">above: top left</span>). Given a property predictive model, \(f(x)\), <em>in silico</em> design typically involves training a generative model over the design space to concentrate on designs with the desired properties (<span class="fig-ref">above: bottom left</span>). This is in general challenging due to the combinatorial nature of the design space. However, many property predictors in scientific applications are <em>decomposable</em>&mdash;for example, the amino acids contacting a binding target may need to only loosely interact with the rest of the protein (<span class="fig-ref">above: top right</span>). In cases where this decomposability is sufficiently simple (e.g., fully separate components), it can be straightforward to account for manually, but in the general case of arbitrarily complex decompositions, as represented by an interaction graph on design variables, a more systematic approach is needed. We present our method, DADO, which leverages decomposability to identify promising designs more quickly <span class="fig-ref">(above: bottom right)</span>, and discuss how one might obtain an appropriate decomposition in practice.
  </div>
  <div id="summary-ml" class="expertise-text track-ml" style="display:none;">
    Design in discrete spaces, such as searching for the sequence of a protein that will bind a target <span class="fig-ref">(above: top left)</span>, is made difficult by the combinatorially large space that must be searched <span class="fig-ref">(above: bottom left)</span>. We argue that scientific design problems often exhibit some level of decomposability <span class="fig-ref">(above: top right)</span> and explain how harnessing this can massively shrink the effective design space, allowing one to find desirable designs more efficiently. To take advantage of this smaller, decomposed design space, we present DADO, a method that infuses the standard distributional optimization algorithm with awareness of the decomposition such that it operates in the decomposed design space <span class="fig-ref">(above: bottom right)</span>, and uses message-passing to coordinate optimization across the search distribution factors. DADO operates on any decomposition, as represented by an interaction graph over design variables.
  </div>
  <div id="summary-rl" class="expertise-text track-rl" style="display:none;">
    RL typically assumes access to a reward function which decomposes in a linear additive manner across timesteps in an MDP&mdash;allowing for efficient policy optimization via dynamic programming. In the typical scientific design setting, our task is to train a distribution over an object, such as a protein sequence, whose variables interact in complex, nonlinear ways to influence the reward function. As such, rather than maximizing a time-decomposed reward (i.e., a chain interaction graph), we generalize policy optimization to reward functions with arbitrary interaction graphs. After converting an input interaction graph into a junction tree, our method, DADO, factorizes its policy (or "search distribution") according to the junction tree and performs weighted regression with value functions estimated over the junction tree. Compared to a naive policy optimization algorithm (analogous to using a trajectory-level reward function; <span class="fig-ref">above: left</span>), DADO's update is more statistically efficient and in practice, finds optimal designs more quickly (<span class="fig-ref">above: right</span>).
  </div>
</div>

<p style="margin-top:0.75em;"><em>This blog post will focus on protein design for concreteness. Optional details are <span class="inline-expand" onclick="toggleInline(this, event)">collapsed<span class="inline-body" style="display:none;"> (like \(m^{ath}\) or domain-specific particulars)</span></span>; without these, it should be a ~5 min read.</em></p>

<script>
(function () {
  var colors = { experimentalist: '#00e676', ml: '#00c8c8', rl: '#ff4d9e' };
  var activeBg = { experimentalist: 'rgba(0,230,118,0.22)', ml: 'rgba(0,200,200,0.22)', rl: 'rgba(255,77,158,0.22)' };
  var defaultBg = { experimentalist: 'rgba(0,230,118,0.10)', ml: 'rgba(0,200,200,0.10)', rl: 'rgba(255,77,158,0.10)' };
  var current = null;

  window.setExpertise = function (type) {
    if (current === type) { return; }
    document.querySelectorAll('.expertise-text').forEach(function (el) { el.style.display = 'none'; el.setAttribute('aria-hidden', 'true'); });
    ['experimentalist', 'ml', 'rl'].forEach(function (t) {
      var btn = document.getElementById('btn-' + t);
      btn.style.background = defaultBg[t];
      btn.style.boxShadow = '';
    });
    {
      document.querySelectorAll('.expertise-text.track-' + type).forEach(function (el) { el.style.display = ''; el.setAttribute('aria-hidden', 'false'); });
      var btn = document.getElementById('btn-' + type);
      btn.style.background = activeBg[type];
      btn.style.boxShadow = '0 0 0 3px ' + colors[type] + '55';
      current = type;
    }
  };
  document.addEventListener('DOMContentLoaded', function () { setExpertise('ml'); });
})();
</script>

---

<details style="margin-top: 1.5em;">
<summary id="problem-setup" class="collapsible-summary" style="position: relative;"><a class="anchor-heading" href="#problem-setup" aria-labelledby="problem-setup"><svg viewBox="0 0 16 16" aria-hidden="true"><use xlink:href="#svg-link"></use></svg></a><span class="optional-box"><span style="color:#888;">[optional]</span> <span style="font-weight:500;color:#27262b;">How can we formalize protein sequence design as an optimization problem?</span></span></summary>
<div style="margin-top: 0.75em;"></div>

Though our method can be used for any optimization problem over a discrete design space, as a concrete example, let's consider only the problem of designing a protein sequence.
We can set this up as follows:
<ol>
<li>The kind of discrete object that we'd like to design, \(x\), is a protein sequence of length \(L\) in which each design variable (or "position"), \(x_i\), is an amino acid from an alphabet, \(A_i\). For simplicity, we'll assume that every position uses the same standard amino acid alphabet of size 20, \(A\).</li>
<li>Given \(L\) and \(A\), we can write the design space as \(X := A^L\), i.e., all amino acid sequences of length \(L\). It follows that there are \(\lvert A\rvert^L=20^L\) possible proteins to choose from.</li>
<li>Specify a property function to design toward, \(f(x)\), such as binding affinity to a target, or gene editing efficiency. In practice, this may be a predictive model fit on limited assay-labeled data.</li>
<li>Putting this all together, our design problem is to find a sequence that maximizes our specification: \(x^{\ast}=\arg\max_{x\in X} f(x)\).</li>
</ol>

</details>

<details style="margin-top: 1.5em;">
<summary id="eda-primer" class="collapsible-summary" style="position: relative;"><a class="anchor-heading" href="#eda-primer" aria-labelledby="eda-primer"><svg viewBox="0 0 16 16" aria-hidden="true"><use xlink:href="#svg-link"></use></svg></a><span class="optional-box"><span style="color:#888;">[optional]</span> <span style="font-weight:500;color:#27262b;">How are discrete optimization problems solved with standard distributional optimization?</span></span></summary>
<div style="margin-top: 0.75em;"></div>

Distributional optimization is a way of solving design problems that can be written as \(x^{\ast}=\arg\max_{x\in X} f(x)\); estimation of distribution algorithms (EDAs) and policy optimization in reinforcement learning are two common instantiations.
Compared to naively evaluating one protein, then the next, until all of \(X\) has been considered, distributional optimization algorithms navigate the design space using a probability distribution, \(p_\theta(x)\), often referred to as a "search distribution" or a "policy".
Intuitively, the search distribution is like a spotlight that moves through the design space toward regions where \(f(x)\) is <span class="inline-expand" onclick="toggleInline(this, event)">larger<span class="inline-body" style="display:none;">, by maximizing \(\mathbb{E}_{p_\theta(x)}[f(x)]\)</span></span> (<a href="#dado-canvas">schematic</a>: bottom left).
In modern times, \(p_\theta(x)\) is typically parameterized as a highly expressive neural network generative model, like an autoregressive model or diffusion model, allowing for pretty arbitrarily shaped spotlights.
<span class="inline-expand" onclick="toggleInline(this, event)">Initializing \(p_\theta(x)\)<span class="inline-body" style="display:none;">: \(p_\theta(x)\) might also be initialized as some pre-trained model, in which case we would in effect be implementing a kind of RL fine-tuning (with \(f\) as the reward signal). Alternatively, one might initialize \(p_\theta(x)\) to be a uniform distribution on a certain set of designs, e.g., those tested in an initial experiment, or initialize it completely at random</span></span>.
<figure id="eda-pseudocode" style="border: 1px solid #ccc; border-radius: 4px; padding: 0.75em 1em; margin: 1.5em 0;">
<figcaption class="inline-expand" style="font-weight: bold; margin-bottom: 0.5em; user-select: none;" onclick="(function(el){var ol=el.closest('figure').querySelector('ol');var open=el.classList.contains('open');ol.style.display=open?'none':'';el.classList.toggle('open',!open);})(this)">Standard EDA pseudocode</figcaption>
<ol style="font-family: monospace; margin: 0; padding-left: 3em; display: none;">
<li>Initialize \(p_\theta(x)\)</li>
<li>for \(N\) training iterations do</li>
<li>{{ site.indent }}Sample \(K\) designs, \(\{x^1, \ldots, x^K\} \sim p_\theta(x)\)</li>
<li>{{ site.indent }}Compute a weight for each sample, \(w^k=f(x^k)\)</li>
<li>{{ site.indent }}Update \(p_\theta(x)\) via weighted maximum likelihood:</li>
<li>{{ site.indent }}{{ site.indent }}\(\theta \leftarrow \arg\max_\theta \mathbb{E}_{\{x^k\}}[w^k \log p_\theta(x^k)]\)</li>
<li style="list-style-type: none;">&nbsp;</li>
<li>Sample from \(p_\theta(x)\) up to your experimental budget and test in the lab!</li>
</ol>
</figure>

There's much more discussion of EDAs, their derivation, relevant hyperparameters, and the important ways they can be extended in our paper.
</details>

## Decomposing the design space

<div class="expertise-text track-experimentalist" aria-hidden="true">A crux of many difficult design problems is that there are a huge number of possible designs&mdash;far too many to consider them all. However, we often have information that can help us decompose the design space and thereby search a much smaller area. For example, protein sequence design workflows assume, roughly, that the binding interface of a protein and the scaffold can be designed separately (sometimes called a <a href="https://www.nature.com/articles/s41586-023-06415-8#Sec7">scaffolding problem</a>; <a href="#dado-canvas">schematic</a>: top right).
We call this a decomposition, and represent it with a graph in which nodes are design variables (amino acid positions) and edges denote coupling with respect to the property function.
So, our example decomposition would be represented by a graph in which all interface amino acids are connected by edges, and all scaffold amino acids are connected by edges, but there are no edges <em>between</em> the interface and scaffold amino acids.
We don't expect such clean-cut decomposability in most problems. <strong>Our core contribution is a design algorithm that can leverage <em>any</em> decomposability in the property function.</strong></div>

<div class="expertise-text track-ml" aria-hidden="false">A crux of many difficult design problems is that there are a huge number of possible designs&mdash;far too many to consider them all. Imagine if, however, a (particularly simple) decomposition held&mdash;yielding two completely separate, smaller design spaces representing respectively the interface amino acids and the scaffold amino acids (<a href="#dado-canvas">schematic</a>: top right). This decomposition corresponds to a linear additive form of the property function to be maximized, $f(x_i, x_s) = f_i(x_i) + f_s(x_s)$, from which we can see that this is <span class="inline-expand" onclick="toggleInline(this, event)">actually two separate optimization problems<span class="inline-body" style="display:none;">: $$[x_i^{\ast}, x_s^{\ast}] = \arg\max_{x_i,x_s} f(x_i, x_s) = [\arg\max_{x_i} f_i(x_i), \arg\max_{x_s} f_s(x_s)]$$ If \(x_i\) has \(6\) design variables and \(x_s\) has \(9\) (as in the <a href="#dado-canvas">schematic</a>), this yields a massive reduction in the size of the search space from \(20^{15}\) to \(20^6 + 20^9\)</span></span>. We don't expect such clean-cut decomposability in most problems. To allow more complex forms of decomposability, we represent a decomposition as a graph in which nodes are design variables and edges denote coupling with respect to $f(x)$; the simple example corresponds to two disconnected components. <strong>Our core contribution is a search algorithm that can leverage arbitrarily complex decomposition graphs.</strong></div>

<div class="expertise-text track-rl" aria-hidden="true">Unlike in typical RL settings, for scientific design we can omit both time and the state-action distinction. There's no stochastic environment and the reward function is defined only on design variables, which you can think of as the actions. In RL, the decomposition graph would have as its nodes state-action pairs for each timestep, and edges only between subsequent timesteps, resulting in a chain. Ignoring this chain decomposition and performing policy optimization would amount to searching the space of all possible trajectories, which grows exponentially with the number of nodes in the graph (timesteps). By analogy, our decomposition graph has instead design variables for nodes (amino acid positions in the case of protein sequence design), and these variables can be coupled with respect to the reward function by arbitrarily complex graph topologies (i.e., not chains, or even trees). <strong>Our core contribution is a policy optimization algorithm that can leverage any decomposition graph topology.</strong></div>

What do realistic decompositions look like? Let's look at decomposition graphs derived from two proteins, AAV and CreiLOV.

In the first figure, <span class="inline-expand" onclick="toggleInline(this, event)">we show one way to obtain a decomposition graph for a protein design problem&mdash;by computing a contact graph<span class="inline-body" style="display:none;">. For two proteins, AAV VP1 (which co-assembles into a virus capsid) and CreiLOV (an oxygen-independent fluorophore), we first obtain a 3D structure from AlphaFold3 (left). To extract a decomposition graph from the 3D structure, we compute distances between all pairs of designable positions and create an edge if they're within 4.5Å of each other (right)</span></span>.

<div id="dado-composite-3d" style="width:70%; line-height:0; cursor:zoom-in; margin:1.5em auto;">
<img src="/assets/img/research/dado/titles_3d.webp" style="width:100%;display:block;" alt="3D structure titles"/>
<div style="position:relative;">
  <img src="/assets/img/research/dado/aav_3d.webp" style="width:100%;display:block;" alt="AAV 3D"/>
  <span style="position:absolute;top:0.4em;left:0.5em;line-height:1;"><strong>a,</strong> AAV</span>
</div>
<div style="position:relative;">
  <img src="/assets/img/research/dado/phot_3d.webp" style="width:100%;display:block;" alt="CreiLOV 3D"/>
  <span style="position:absolute;top:0.4em;left:0.5em;line-height:1;"><strong>b,</strong> CreiLOV</span>
</div>
</div>

Notice that the decomposition graph for AAV (right) has few edges and is relatively chain-like.
This suggests that we will be able to realize a large efficiency gain by operating in its decomposed design space.
On the other hand, CreiLOV looks a lot more like a fully-connected graph.
In this case, we can't expect to improve over a naive optimization method which considers all variables jointly.
<span class="inline-expand" onclick="toggleInline(this, event)">One could always choose a more sparsely-connected decomposition<span class="inline-body" style="display:none;"> (e.g., by lowering the contact distance threshold) such that it yields a larger potential efficiency gain</span></span>.
<span class="inline-expand" onclick="toggleInline(this, event)">This hints at a key tradeoff in practice<span class="inline-body" style="display:none;">: the more decomposed the problem, the more efficiently it can be optimized, but if the chosen decomposition is too aggressive, it might preclude performant designs from being found</span></span>.

<p>Briefly, we can easily convert any undirected graph into a directed junction tree, which has no cycles, allowing DADO to draw inspiration from exact message-passing (next section). <span class="inline-expand" onclick="toggleInline(this, event); document.getElementById('jt-figure-body').style.display=this.classList.contains('open')?'':'none';">The corresponding junction tree for each protein is shown below<span class="inline-body" style="display:none;"> (right), with additional visualizations to highlight its relation to the original decomposition graph (left, middle)</span></span>.</p>
<div id="jt-figure-body" style="display:none;">

<div id="dado-composite-jt" style="line-height:0; cursor:zoom-in; margin:1.5em 0;">
<img src="/assets/img/research/dado/titles_jt.webp" style="width:100%;display:block;" alt="Junction tree titles"/>
<div style="position:relative;">
  <img src="/assets/img/research/dado/aav_jt.webp" style="width:100%;display:block;" alt="AAV junction tree"/>
  <span style="position:absolute;top:0.4em;left:0.5em;line-height:1;"><strong>a,</strong> AAV</span>
</div>
<div style="position:relative;">
  <img src="/assets/img/research/dado/phot_jt.webp" style="width:100%;display:block;" alt="CreiLOV junction tree"/>
  <span style="position:absolute;top:0.4em;left:0.5em;line-height:1;"><strong>b,</strong> CreiLOV</span>
</div>
</div>
</div>

## DADO: Decomposition-Aware Distributional Optimization

To infuse distributional optimization with knowledge of a decomposition graph, our method has two core components:

<div class="expertise-text track-experimentalist" aria-hidden="true">First, we perform search with a generative model, \(p_\theta(x)\), factorized according to the decomposition junction tree. Each factor distribution searches a subset of design variables corresponding to a node in the tree. This factorization makes it so that DADO only "sees" the smaller decomposed space<sup><a id="fnref-fda" href="#fn-fda">1</a></sup>; whereas the standard <a href="#eda-pseudocode">EDA</a> searches all dimensions of \(x\) together.</div>
<div class="expertise-text track-ml" aria-hidden="false">First, we perform search with a generative model, \(p_\theta(x)\), factorized according to the decomposition junction tree. Each factor distribution searches a subset of design variables corresponding to a node in the tree. This factorization makes it so that DADO only "sees" the smaller decomposed space<sup><a id="fnref-fda" href="#fn-fda">1</a></sup>; whereas the standard <a href="#eda-pseudocode">EDA</a> searches all dimensions of \(x\) together.</div>
<div class="expertise-text track-rl" aria-hidden="true">First, we perform search with a policy, \(p_\theta(x)\), factorized not in time but according to the decomposition junction tree. Each policy factor \(p_\theta(x_i \mid x_p)\) searches a subset of design variables corresponding to node \(i\) in the tree, conditioned on its parent node \(p\)'s variables.
</div>

<div class="expertise-text track-experimentalist" aria-hidden="true">
Second, we coordinate the generative model's factor distributions via message-passing. In essence, the messages (also called "value functions" and denoted \(Q_i(\tilde{x}_i, \tilde{x}_p)\)) describe how changing a single factor distribution affects its descendants in the tree, so that each factor can be updated in a manner that considers the design variables it has no direct control over.
For more details, see the machine learning explanation (or the paper). The upshot is that this leads to a more statistically efficient optimization algorithm that navigates the space of designs more effectively. Below, we show a schematic comparison of a standard EDA to DADO (panel b) for a particular tree decomposition (panel a); on synthetic problems DADO consistently finds higher-\(f(x)\) designs (panel c).
</div>
<div class="expertise-text track-ml" aria-hidden="false">
Second, we coordinate the factor distributions via graph message-passing so that they can each be trained separately. The messages are called <span class="inline-expand" onclick="toggleInline(this, event)"><strong>value functions</strong> and denoted \(Q_i(\tilde{x}_i, \tilde{x}_p)\)<span class="inline-body" style="display:none;">; they are passed from the leaves of the junction tree to the root, communicating to each parent node the status of its children</span></span>. Each \(Q_i(\tilde{x}_i, \tilde{x}_p)\) describes the partial value of \(f\) on the subtree rooted at node \(i\), <span class="inline-expand" onclick="toggleInline(this, event)">in expectation over its descendants' search distributions<span class="inline-body" style="display:none;">. Each node aggregates all of its children’s value functions into its own and then uses it to shift its search distribution optimally with respect to its children</span></span>.
We can use the value functions to perform a weighted maximum likelihood update to each factor distribution separately, which makes DADO <span class="inline-expand" onclick="toggleInline(this, event)">more statistically efficient than the standard EDA<span class="inline-body" style="display:none;">: each lower-dimensional distribution is updated using the full sample budget. Decentralized updates are possible because the value functions provide explicit coordination across all design variables (most importantly, those out of scope). The conditional dependence of each search distribution factor and value function closes the loop: each node responds to whichever partial designs are sampled from its parent’s search distribution. As a consequence, all coordination flows through the root node, which indirectly aggregates value functions from all other nodes in the junction tree and upon whose samples all other nodes are indirectly conditioned</span></span>.
Below, we show a schematic comparison of a standard EDA to DADO (panel b) for a particular tree decomposition (panel a); on synthetic problems DADO consistently finds higher-\(f(x)\) designs (panel c).
</div>
<div class="expertise-text track-rl" aria-hidden="true">
Second, we coordinate the policy factors with value functions, \(Q_i(\tilde{x}_i, \tilde{x}_p)\), which describe the partial value of \(f\) on the subtree rooted at node \(i\), <span class="inline-expand" onclick="toggleInline(this, event)">in expectation over its descendants' policies<span class="inline-body" style="display:none;">. Each node aggregates all of its children’s value functions into its own and then uses it to shift its policy optimally with respect to its children</span></span>.
Then we perform an RWR/AWR-style weighed maximum likelihood update to each policy factor separately. This makes DADO more statistically efficient than the naive policy optimization algorithm (<a href="#eda-pseudocode">EDA</a>), as each lower-dimensional distribution is updated using the full sample budget. 
Below, we show a schematic comparison of a standard EDA to DADO (panel b) for a particular tree decomposition (panel a); on synthetic problems DADO consistently finds higher-\(f(x)\) designs (panel c).
</div>

<img src="/assets/img/research/dado/schematic.webp" style="width: 100%; display: block;" alt="DADO schematic"/>

DADO's optimization efficiency gain holds up for messier, real-world design problems too. Recall the two protein design problems we introduced earlier, AAV and CreiLOV, and their contrasting decomposition graphs (sparse vs. dense). Below<sup><a id="fnref-axes" href="#fn-axes">2</a></sup>, we observe that DADO finds much better designs than decomposition-unaware methods for AAV design, whereas for CreiLOV, knowledge of the decomposition doesn't help, as one would expect.

<div id="dado-composite-results" style="line-height: 0; cursor: zoom-in; display: flex; gap: 2%; justify-content: center;">
<div style="position: relative; width: 49%;">
  <img src="/assets/img/research/dado/rep_results_aav_legend.webp" style="width: 100%; display: block;" alt="AAV results"/>
  <span style="position: absolute; top: 0.1em; left: 0.5em; line-height: 1;"><strong>a</strong></span>
</div>
<div style="position: relative; width: 49%;">
  <img src="/assets/img/research/dado/rep_results_phot.webp" style="width: 100%; display: block;" alt="CreiLOV results"/>
  <span style="position: absolute; top: 0.1em; left: 0.5em; line-height: 1;"><strong>b</strong></span>
</div>
</div>

## What now?

<ul>
  <li>
    Finding an accurate decomposition for a design problem is not always straightforward. The real world is often structured though, and even very approximate decompositions can be useful.
    One might try to infer decomposability from labeled data or auxiliary information, or some other creative scheme.
    This is an exciting research direction both for proteins and scientific design in general.
  </li>

  <li>
    For concreteness, here are some examples of scientific design problems with <em>modularity</em> that might lend itself to decomposition.
    <ul>
      <li><span class="inline-expand" onclick="toggleInline(this, event)">In natural systems<span class="inline-body" style="display:none;">, useful physical models often approximate interactions as primarily local, giving rise to sparse decompositions. In designing a crystal to minimize formation energy or maximize stability, for example, one might model atoms in a lattice as only directly interacting with their nearest neighbors.
 Or, consider the problem of designing a layered material for thermal or acoustic insulation. When choosing the material of each layer, we might assume that it mainly interacts with its direct neighbors&mdash;heat or sound has to pass through one layer to reach the next. As a result, one could optimize a thick stack of layers as decomposing according to a chain graph instead of a fully-connected one</span></span>.</li>
      <li><span class="inline-expand" onclick="toggleInline(this, event)">Modularity abounds in man-made systems<span class="inline-body" style="display:none;">. In the case of circuit design, usually not all components are directly connected by wires&mdash;so if trying to choose what type of component to put in each slot (assuming a pre-fixed topology) in order to minimize capacitance, one might model the system as sparsely-connected according to the wires. That is, that components only indirectly interact with other components if there is no direct wire between them. Similarly, in optical design of e.g., a research telescope, one might minimize wavefront error with respect to the physical parameters of a set of lenses/mirrors laid out in a pre-specified topology. For a given scene, interactions take place primarily via light passed between neighboring components, which in turn propagate a light field to the next components. One can imagine similar relationships between components of a mechanical system (e.g., a robot's limbs and actuators, with respect to torque costs or material stress)</span></span>.</li>
    </ul>
  </li>

  <li>
    There's no reason why DADO can't be used for optimization in continuous design spaces; we simply didn't investigate it in our paper. Everything should extend straightforwardly.
  </li>
</ul>
<!--
<div class="expertise-text track-ml" aria-hidden="false">
<ul>
  <li>
      We also expect that there are more clever ways to estimate the value functions, which could improve optimization efficiency further and make DADO practical for problems with even larger junction tree nodes.
      That is, the more accurate the value functions, the more one can squeeze out of densely connected (not very tree-like!) decomposition graphs.
      The RL literature is likely a good place to look for inspiration.
  </li>
  <li>
      One place where DADO could be easily substituted is the high-dimensional Bayesian optimization literature, which is often used for scientific design in low-data regimes, where existing methods (e.g., 
      <a href="https://proceedings.mlr.press/v84/rolland18a.html">Rolland et al., 2018</a>, 
      <a href="https://proceedings.mlr.press/v202/ziomek23a.html">Ziomek &amp; Osborne, 2023</a>) 
      infer a decomposition of the objective function and optimize it using classical message-passing.
      More broadly, distributional optimization approaches similar to DADO might be used in settings in which one separately (perhaps in alternating steps) infers some sort of decomposition graph and then finds optimal parameters over it (such as finding a MAP configuration of a PGM), as an alternative to exact or loopy message-passing when variables are high-dimensional and/or junction tree nodes have an intermediate cardinality.
  </li>
</ul>
</div>
<div class="expertise-text track-rl" aria-hidden="true">
<ul>
  <li>
      We also expect that there are more clever ways to estimate the value functions, which could improve optimization efficiency further and make DADO practical for problems with even larger junction tree nodes.
      That is, the more accurate the value functions, the more one can squeeze out of densely connected (not very tree-like!) decomposition graphs.
      The RL literature is likely a good place to look for inspiration.
  </li>
  <li>
      One place where DADO could be easily substituted is the high-dimensional Bayesian optimization literature, which is often used for scientific design in low-data regimes, where existing methods (e.g., 
      <a href="https://proceedings.mlr.press/v84/rolland18a.html">Rolland et al., 2018</a>, 
      <a href="https://proceedings.mlr.press/v202/ziomek23a.html">Ziomek &amp; Osborne, 2023</a>) 
      infer a decomposition of the objective function and optimize it using classical message-passing.
      More broadly, distributional optimization approaches similar to DADO might be used in settings in which one separately (perhaps in alternating steps) infers some sort of decomposition graph and then finds optimal parameters over it (such as finding a MAP configuration of a PGM), as an alternative to exact or loopy message-passing when variables are high-dimensional and/or junction tree nodes have an intermediate cardinality.
  </li>
</ul>
</div>

---
-->

We hope you'll read (and enjoy) our paper! If you'd like, you can return to the top and re-read from a different perspective :)<br>
Feel free to [email me](mailto:jcbowden@berkeley.edu) with any questions, comments or feedback.
I'd also be excited to discuss applying our method to your problem, or potential collaboration.

---

<script>
function toggleInline(el, event) {
  if (event && event.target.closest('a')) return;
  var body = el.querySelector('.inline-body');
  var open = el.classList.contains('open');
  body.style.display = open ? 'none' : 'inline';
  el.classList.toggle('open', !open);
  if (!open && window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise([body]);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open && window.MathJax) { MathJax.typesetPromise([d]); }
    });
  });
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

  ['dado-composite-3d','dado-composite-jt','dado-composite-results'].forEach(function(id){
    var el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('click', function(){
      var rect = el.getBoundingClientRect();
      var scale = Math.min(window.innerWidth * 0.92 / rect.width, window.innerHeight * 0.92 / rect.height);
      var clone = el.cloneNode(true);
      clone.removeAttribute('id');
      clone.style.cssText += ';transform:scale('+scale+');transform-origin:center;width:'+rect.width+'px;cursor:default;pointer-events:none';
      makeOverlay(clone);
    });
  });

  var schematic = document.querySelector('img[src$="schematic.webp"]');
  if (schematic) {
    schematic.style.cursor = 'zoom-in';
    schematic.addEventListener('click', function () {
      var img = document.createElement('img');
      img.src = schematic.src;
      img.style.cssText = 'max-width:92vw;max-height:92vh;object-fit:contain;cursor:default';
      makeOverlay(img);
    });
  }
});
</script>

<details style="margin-top: 1.5em;">
<summary id="footnotes" class="collapsible-summary" style="position: relative;"><a class="anchor-heading" href="#footnotes" aria-labelledby="footnotes"><svg viewBox="0 0 16 16" aria-hidden="true"><use xlink:href="#svg-link"></use></svg></a><span class="details-heading2">Footnotes</span></summary>

<ol>
<li id="fn-fda">In our paper, we include a baseline&mdash;a modernized version of the factorized distribution algorithm, or FDA&mdash;that <em>only</em> uses a factorization of the search distribution without the message-passing coordination. In FDA, the factorized search distribution is updated the same way as the standard EDA, with a per-sample weight, \(f(x)\), instead of a per-node weight. It's interesting that for a few problems, FDA performs as well as or better than DADO, despite its search distribution update being less statistically efficient. We suspect this is due to an additional source of variance&mdash;the sample-based approximation of DADO's value functions&mdash;which can outweigh the benefit of a per-node update. We only observed this when the junction tree nodes were relatively large, which is exactly when estimating a value function from finite samples is most difficult. It would be interesting to more carefully characterize this behavior, and one might adapt variance-reduction techniques from RL (like learned value functions) here. <a href="#fnref-fda">↩</a></li>
<li id="fn-axes">The y-axes between the two plots are not comparable; \(f(x)\) is protein-specific. For AAV, \(f\) represents viral viability (whether the capsid packages), and for CreiLOV, \(f\) represents fluorescence intensity. The upshot being that DADO can find better protein sequences than decomposition-unaware methods for AAV packaging, but cannot for CreiLOV fluorescence intensity. One should not conclude that the methods perform better on CreiLOV than on AAV or vice versa, as \(f\) is not comparable between them. <a href="#fnref-axes">↩</a></li>
</ol>

</details>

<script>
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('a[href^="#fn-"]').forEach(function (link) {
    link.addEventListener('click', function () {
      var details = document.querySelector('#footnotes').closest('details');
      if (details) { details.open = true; }
    });
  });
});
</script>
