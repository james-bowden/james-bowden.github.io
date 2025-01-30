---
backlink: https://james-bowden.github.io/pages/vault/atomic
layout: obs
date created: Thursday, January 16th 2025, 2:12:58 pm
date modified: Thursday, January 30th 2025, 1:14:19 am
aliases:
  - CTMC
---

# Continuous-time Markov Chains

Taken from the background section of [Generative Flows on Discrete State-Spaces: Enabling Multimodal Flows with Applications to Protein Co-Design](https://arxiv.org/abs/2402.04997).

## CTMC definition

A CTMC is a stochastic process and probability flow in continuous time ($$t \in [0, 1]$$) acting on a discrete space with $$D$$ dimensions, each of which has $$S_d$$ states. We’ll just consider a single dimension because it’s easier to reason about and is simple to extend back to $$D$$.

A CTMC is defined with a rate matrix $$R_t \in \mathbb{R}^{SxS}$$. $$R_t(x_{t}, j) \; dt$$ is the probability that $$x_t$$ will jump to a different state $$j$$ during the next time step $$dt$$; diagonal is negative sum of other row elements s.t. $$p(x_t, x_t)$$ (stay) is $$1+R_t(x_t, x_t)\;dt$$; and probability of transitioning anywhere from $$x_t$$ is thus in sum 1, while the rows sum to 0. We can get $$Q_t$$ from $$R_t$$[^1]. We can also think in terms of “holding times” as well.

A CTMC is defined in toto by a rate matrix $$R_t$$ (note that this will be a function of time[^2], and a parameterized NN) and an initial distribution $$p_0$$.

## CTMC simulation

We could infinitesimally simulate the sequence trajectory[^3] but in practice we use finite intervals $$\Delta t$$ and this leads us to the *Euler step*:

$$

x_{t+\Delta t} \sim \text{Cat}(\delta\{x_t, x_{t+\Delta t}\} + R_t(x_t, x_{t+\Delta t})\cdot \Delta t)

$$

This is the simplest strategy; there are other fancier ways of choosing when and how frequently to sample (stemming from the holding time view). See the [Gillespie algorithm](https://en.wikipedia.org/wiki/Gillespie_algorithm) and [Tau-leaping](https://en.wikipedia.org/wiki/Tau-leaping).

## Kolmogorov equation

Consider the marginal[^4] distribution of a CTMC at time $$t$$, $$p_t(x_t)$$. We can characterize its dynamics via its time derivative $$\partial_t \;p_t$$. This is referred to as the *probability flow*.

The *Kolmogorov equation* relates the flow to the rate matrix[^5]. In matrix form it can be written as $$\partial_tp_t = R_t^T\cdot p_t$$[^6]. We can also write it for a single element, which is didactically informative:

$$

\partial_tp_t(x_t) = \sum_{j\neq x_t}p_t(j)R_t(j, x_t) - p_t(x_t)\sum_{j\neq x_t}R_t(x_t, j)

$$

This can be written as one sum, not excluding $$j=x_t$$, observing that $$R_t(x_t, x_t)$$ is exactly $$- \sum_{j\neq x_t}R_t(x_t, j)$$. This provides the connection to matrix form; for each entry we multiply $$p_t$$ by a column of the rate matrix.

The first term is the incoming probability flow, and the second the outgoing. Intuitively, the Kolmogorov equation specifies that the marginal probability of being at $$x_t$$ at time $$t$$ changes according to the sum of the probabilities of transitioning in from other states (rate multiplied by probability of being in other state), minus the sum of probabilities of transitioning to any other state[^7]. $$R_t$$ *generates* $$p_t$$ if the Kolmogorov equation holds $$\forall \; t\in[0,1]$$.

The rate matrix provides a crucial connection between the marginals and the probability flow. We will parameterize the rate matrix indirectly through a denoising distribution $$p_{1|t}^\theta(x_1|x_t)$$, and the rate matrix in turn indirectly parameterizes $$\partial_tp_t(x_t)$$. The probability flow is the core object, although we won’t directly interact with it in [Discrete Flow Models](dne.md). Because $$R_t$$ generates $$p_t$$, we can simply simulate the CTMC with $$R_t$$, as shown in [CTMC-simulation](#CTMC-simulation).

# Relevance
See [Discrete Flow Models](dne.md). CTMCs are the bridge from [Flow Matching on continuous state spaces](dne.md) to the discrete state space paradigm.

# Footnotes

[^1]: Though to get $$Q_{t, t+\Delta t}$$, the transition probabilities in a finite time interval, you may need to integrate $$R_t$$ over time. I don’t fully understand this yet.
[^2]: more generally, CTMCs may have a *homogeneous* rate matrix instead, which doesn’t vary over time.
[^3]: i.e., integration, a.k.a., expensive.
[^4]: Marginalized over all of the $$x_{t-1}$$, and before them, all the way back to $$x_0$$.
[^5]: $$R_t$$ is analogous to the vector field $$u_t(x)$$ in [Flow Matching on continuous state spaces](dne.md).
[^6]: $$p_t$$ and its time derivative are vectors of size $$S$$.
[^7]: If you look up the [Kolmogorov equations](https://en.m.wikipedia.org/wiki/Kolmogorov_equations), they’re generally defined as separate forward and backward equations. The above is the forward equation and its continuous-space analog (diffusion) is known as the Fokker-Planck equation. In the case of continuous state spaces we don’t have finite-dimensional probability mass vectors. Instead of using a rate matrix, we use a vector field and write an SDE. The rate matrix lets us write the probability flow as an ODE here.
