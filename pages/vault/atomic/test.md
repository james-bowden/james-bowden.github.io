 in that there's some underlying continuous (time-varying) diffusion process (though in that case, it's still discrete time) which represents probabilities of discrete transitions and so is tethered to a discrete diffusion process as well. I guess they're arguing here that by using the continuous-time variant, they'll get more control + get to use flows and such.
[^5]: Think of this as defining a probability mass vector.
[^6]: b/c state space is discrete
[^7]: It’s effectively an extra degree of freedom that gets fixed; see [Gauges](dne.md) for somewhat relevant discussion.
[^8]: See “Formulating Discrete Probability Flow Through Optimal Transport”
[^9]: Seems like practically then, may need to not allow any of the probabilities to go to 0 (unless truly no chance of going there ever again in trajectory).
[^10]: Cites again “Formulating discrete probability flow through optimal transport”
[^11]: Simply b/c it’s a lever and so there must be some maximum? What makes us think this is an effective control lever? Intuition, …
[^12]: notably, not including side-chains.
[^13]: Can think of SO3 as a sphere, and then tangent space is like a tangent plane to a point on the sphere; a linear approximation at a point. SO3 is a curved manifold and can’t naively add rotation matrices (operations don’t commute). Tan SO3 is a linear space, and is amenable to addition. While SO3 is the rotations themselves as points, Tan SO3 has velocities (rates of rotation) as points. To map from SO3 to its tangent space we use logarithm map and to get back we use exponential map. All of this is desirable for optimization b/c we’d rather do it in a linear space. In the context of OT-style linear interpolation, it’s also much easier to do in Tan SO3; simply scale by $t$.
[^14]: SO3: group of all possible rotations around the origin. Has 3 DoF. SE3: group of all possible rotations AND translations from the origin. Has 6 DoF.
[^15]: scRMSD, side-chain RMSD, metric given for each generated sequence, representing how consistent that sequence is with the structure. This is done by computing a structure for each generated sequence (by RF or AF) and then taking RMSD w/ the provided structure
