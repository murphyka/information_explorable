---
template: post_v2.html
title: Where is the information in data?  
socialsummary: An interactive introduction to information decomposition as a route to interpretability.
shareimg: 
shareimgabstract: 
authors: Kieran Murphy, Dani Bassett
date: July 2024
---

Imagine someone asks you *"**Where is the information about whether something is a car or a truck?**"*
<p>
  <img src="data/car.jpg" width="300" />
  <img src="data/truck.jpg" width="300" /> 
</p>

It might be an unusual phrasing, but you'd probably understand what they mean.
You might mention the overall size or something about the rear of the vehicle, having an intuitive sense that there is specific variation among vehicles that best distinguishes between cars and trucks and other variation that is irrelevant (e.g., the color).

The goal of this post is to build intuition around localizing relevant information, something we naturally do when making sense of the world, and show how it can be formulated with machine learning as a powerful and practical route to interpretability.
The methodological long and short (**TL;DR**) is that we'll add a loss on the information used about different features in the data, upstream of any model, and it will reveal the most relevant variation contained in the features.  

### Information as communicating distinctions

You've been transported back in time to the days of the telegraph, and tasked with setting up a storm communication system with two neighboring towns.
Each of the towns will send a <digits>0</digits> or <digits>1</digits> to tell about the weather conditions locally, and your town will use the information for its own warning system.
The more money you spend on a transmission line, the lower the noise in the line and the more information that can be sent.<a class='footstart' key='transmission-caveats'></a>
How much should you allocate to each of the transmission lines to the towns?

A dataset has been collected, with the joint distribution shown below as a heatmap, where extreme weather is represented as <digits>1</digits> and unfortunately, tragically likely.<a class='footstart' key='weather-caveats'></a>

<div class='storm-probability-sliders'></div>

<div class='storm-telegraph row'></div>
<div class='storm-transmission-sliders'></div>

With this distribution, we can simulate the full spectrum of information transmission rates from the two towns.  
Adjust the slider bars to allow less or more information from each town.


What does it mean to receive a partial bit from town A?  
Town A sends a discrete variable as input, but noise in the transmission line can cause you to receive the opposite output with some probability.

By displaying the total information in versus the information out, we see there is a spectrum of information allocations starting from zero info from the towns and zero info about your own storm likelihood (the origin) to two bits from the towns and maximal info about your own town (the right hand side).
In between, there are partial information allocations, with a Pareto front (the black curve) of the best allocations for a given budget.

The Pareto front can be traced by maximizing the information from town A first, and then from town B -- indicating that the signal from town A has more relevant information than that of town B.
We can measure all the mutual information terms and place them on the same plot:

Whereas the mutual information terms relate the pristine variables (i.e., the storminess here and the storminess of A), we explored the space of partial information.
It can be seen as the space of lossy compressions of each random variable, where distinctions present in the pristine random variable can be smoothly eroded.
In other words, the distinction between <digits>0</digits> and <digits>1</digits> at town A is perfectly communicated with a one bit transmission line, but it becomes murky with a 0.5 bit transmission line.  
Without a transmission line, there is no distinguishing power in our town about the storminess at town A.

Information theory bestows mathematical rigor to the rather intuitive notion of information as something that reduces uncertainty. 
It has deep connections with many fields of research, and particularly machine learning; if  
You can get very far with just a few building blocks in information theory, starting with entropy as a measure of the amount of uncertainty in a probability distribution<a class='footstart' key='entropy'></a> and then mutual information as the average reduction of uncertainty in one thing when you find out the value of another<a class='footstart' key='mutual_info'></a><a class='citestart' key='cover'></a>.

While the view of mutual information in terms of uncertainty reduction is great, we'll get more mileage here with a slightly different perspective.
Instead, information can be seen as allowing distinctions to be made between outcomes of one variable when given another. 



<a class='citestart' key='Omnigrok Universality Zhong23 ProgressParity gromov'></a>

### Information about bike rentals

<div class='sticky-container'>
<div class='tabular-decomp row'></div>

text

<div class='sticky-container'>
<div class='mod-top-weights row x-sticky x-sticky-lower'></div>


<animate data-animate='top-switches'>switches</animate>

</div>
</div>

[section on regularization](#which-model-constraints-work-best-) and [training colab](https://colab.research.google.com/github/PAIR-code/ai-explorables/blob/master/server-side/grokking/MLP_Modular_Addition.ipynb)

<div class='mod-top-waves row'></div>

<digits>000110010110001010111001001011</digits>

<div class='parity-accuracy row'></div>

<div class='parity-weights row'></div>

<div class='parity-loss row'></div>

<div class='parity-weights-trajectory row'></div>

<div class='sparse-parity-sweep'></div>

<br>

<script type="math/tex">
$$
\mathbf{W}_{\text{embed}} =
\begin{pmatrix}
    \dots & \ldots \\
    \cos(i\frac{2\pi}{67}) & \sin(i \frac{2\pi}{67}) \\
    \dots & \dots \\
\end{pmatrix} \quad
$$
</script>

<div class='row'><div class='embed'></div></div>

### Credits

Thanks to XYZ for their help with this piece.

[Model training code](https://github.com/PAIR-code/ai-explorables/tree/master/server-side/grokking) // [Visualization code](https://github.com/PAIR-code/ai-explorables/tree/master/source/grokking)

### Appendix A: How the Circular Construction Works

<v></v> is in `appendix/init.js`, line 229.  Seems to use d3 to set the variable.
<p>It works! But we're cheating a bit, do you see how **unembed** loops around the circle twice? We need to output a single prediction for "<v></v>" — not separate predictions for "<v></v>" and "<v2></v2>". Directly adding the two predictions for a number together won't work since they're on opposite sides of the circles and will cancel each other out.

Instead, let's incorporate a `$\text{ReLU}(x)$` to fix the repeated outputs.

<br>

Interestingly this circle has a few wrinkles: this construction doesn't give an exact answer!

</div>

<div class='debug-vis row'></div>

**The below give a text entry box but you can absolutely brick the page by entering a large value.  Sliders are created in `appendix/init-input-sliders.js`**
<div class='appendix num-inputs row'>
  <span>Neurons <input type="number" class='n_neurons' min="3" max="10" value="5"></span>  
  <span>Modulus <input type="number" class='modulus' min="12" max="500" value="67"></span>
</div>

<br>

<br>

### Footnotes

<a class='footend' key='transmission-caveats'></a> 
assuming there is some standard operating voltage

<a class='footend' key='weather-caveats'></a> 
It also turns out that weather one day is statistically independent of weather the next, so forecasting won't help you.


<a class='footend' key='entropy'></a> 
With `$X$` a random variable and `$p(x)$` the probability distribution regarding its outcomes, the entropy `$H(X)=\mathbb{E}_{x\sim p(x)} [- \log p(x)]$`.

<a class='footend' key='mutual_info'></a> 
With `$X$` any `$Y$` two random variables, the mutual information is `$I(X;Y)=H(X)-H(X|Y)=H(Y)-H(Y|X)$`.  It quantifies the amount of shared variation in the two random variables.

<span class='fn-break'></span>
Modular addition sounds simple and it is. We can easily train 1,000s of models and treat them like fruit flies in neuroscience: small enough such that it is feasible to extract their [connectome](https://www.science.org/doi/abs/10.1126/science.add9330) synapse-by-synapse, yet providing new interesting insights about the system more broadly. We can get a good understanding of the small models we've trained by visualizing all their internals.

<span class='fn-break'></span>

### References

<a class='citeend' key='cover'></a> [Elements of Information Theory]
Cover, T. & Thomas, J. (1991). John Wiley & Sons, Inc.

<a class='citeend' key='Omnigrok'></a> [Omnigrok: Grokking Beyond Algorithmic Data](https://arxiv.org/pdf/2210.01117.pdf)
Liu, Z., Michaud, E. J., & Tegmark, M. (2022, September). In The Eleventh International Conference on Learning Representations.

<a class='citeend' key='Universality'></a> [A Toy Model of Universality: Reverse Engineering How Networks Learn Group Operations](https://arxiv.org/abs/2302.03025)
Chughtai, B., Chan, L., Nanda, N.  (2023). International Conference on Machine Learning.

<a class='citeend' key='Zhong23'></a>[The Clock and the Pizza: Two Stories in Mechanistic Explanation of Neural Networks](https://arxiv.org/pdf/2306.17844.pdf)
Zhong, Z., Liu, Z., Tegmark, M., & Andreas, J. (2023). arXiv preprint arXiv:2306.17844.

<a class='citeend' key='ProgressParity'></a> [Hidden Progress in Deep Learning: SGD Learns Parities Near the Computational Limit](https://arxiv.org/abs/2207.08799)
Boaz Barak, Benjamin L. Edelman, Surbhi Goel, Sham Kakade, Eran Malach, Cyril Zhang. (2022) Advances in Neural Information Processing Systems, 35, 21750-21764.

<a class='citeend' key='gromov'></a>[Grokking modular arithmetic](https://arxiv.org/abs/2301.02679) Andrey Gromov (2023). arXiv preprint arXiv:2301.02679.

<p id='recirc'></p>
<div class='recirc-feedback-form'></div>

<link rel='stylesheet' href='source/third_party/footnote_v2.css'>
<link rel='stylesheet' href='source/third_party/citation_v2.css'>
<link rel='stylesheet' href='source/scripts/style.css'>

<script id='MathJax-script' async src='https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'></script>
<script defer src='https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/mathtex-script-type.min.js' integrity='sha384-jiBVvJ8NGGj5n7kJaiWwWp9AjC+Yh8rhZY3GtAX8yU28azcLgoRo4oukO87g7zDT' crossorigin='anonymous'></script>

<script src='source/third_party/d3_.js'></script>
<script src='source/third_party/d3-scale-chromatic.v1.min.js'></script>
<script src='source/third_party/tfjsv3.18.0.js'></script>
<script src='source/third_party/npyjs-global.js'></script>
<script src='source/third_party/swoopy-drag.js'></script>

<script src='source/third_party/footnote_v2.js'></script>
<script src='source/third_party/citation_v2.js'></script>

<script src='source/scripts/util.js'></script>
<script src='source/scripts/init-info-plane.js'></script>
<script src='source/scripts/init-storms.js'></script>
<script src='source/scripts/init-animate-steps.js'></script>
<script src='source/scripts/init-embed-vis.js'></script>
<script src='source/scripts/init-input-sliders.js'></script>
<script src='source/scripts/init-swoopy.js'></script>

<link rel='stylesheet' href='source/scripts/tabular/style.css'>
<script src='source/scripts/tabular/init-waves.js'></script>
<script src='source/scripts/tabular/init.js'></script>

<script src='source/scripts/storms/init.js'></script>