---
layout: post
title: "Gaussian Process Simulation"
author: "James Bowden"
categories: ML
tags: [learning resources, research]
image: gp.jpg
---

Check out this cool **[Gaussian Process Simulation](http://rpradeep.me/gpr/)**! Gaussian processes, or GPs, are an integral part of Bayesian optimization and adaptive experiment design. I came across the linked simulation at the start of my SURF when I was first trying to understand GPs, and was reminded of it today for a funny reason. A GP is basically an infinite multivariate distribution of functions. When learning about GPs, 2D plots are usually used to demonstrate the concept and often show functions sampled from the GP, like [this](https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fpythonhosted.org%2Finfpy%2F_images%2Fsamples_from_posterior.png&f=1&nofb=1) or [this](https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fblog.dominodatalab.com%2Fwp-content%2Fuploads%2F2017%2F03%2Foutput_75_0-1.png&f=1&nofb=1). Because of the way they're depicted, I figured sampling a function from a GP must be relatively simple, as that seems like a practical use for having such a distribution of functions. As it turns out, the 2D case is quite misleading--sampling from a GP is tractable because you've only a 2 by 2 covariance matrix and because one can simply discretize the function on the 2-D domain and construct a joint distribution across those discrete points. In higher dimensions, this is much less trivial, which is quite unfortunate for my project...

