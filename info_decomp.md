---
template: post_v2.html
title: What information does a model use?  
socialsummary: An interactive introduction to information decomposition as a route to interpretability.
shareimg: 
shareimgabstract: 
authors: Kieran Murphy, Dani Bassett
date: June 2024
---
<a class='citestart' key='Omnigrok Universality Zhong23 ProgressParity gromov'></a>
<a class='footstart' key='modular'></a>
*grokking*

### Grokking Modular Addition

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

<a class='footend' key='modular'></a> In modular addition, we have two input numbers, `$a$` and `$b$`, and a modulus `$m$`. We want to find the remainder of `$a + b$` when divided by `$m$`.
<span class='fn-break'></span>
This type of addition is often called clock-face addition, because when adding two times, we often report the result modulo 12 (i.e. 5 hours after 8 o’clock is 1 o’clock).
<span class='fn-break'></span>
Modular addition sounds simple and it is. We can easily train 1,000s of models and treat them like fruit flies in neuroscience: small enough such that it is feasible to extract their [connectome](https://www.science.org/doi/abs/10.1126/science.add9330) synapse-by-synapse, yet providing new interesting insights about the system more broadly. We can get a good understanding of the small models we've trained by visualizing all their internals.


### References

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

<link rel='stylesheet' href='../source/third_party/footnote_v2.css'>
<link rel='stylesheet' href='../source/third_party/citation_v2.css'>
<link rel='stylesheet' href='../source/style.css'>

<script id='MathJax-script' async src='https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'></script>
<script defer src='https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/mathtex-script-type.min.js' integrity='sha384-jiBVvJ8NGGj5n7kJaiWwWp9AjC+Yh8rhZY3GtAX8yU28azcLgoRo4oukO87g7zDT' crossorigin='anonymous'></script>

<script src='../source/third_party/d3_.js'></script>
<script src='../source/third_party/d3-scale-chromatic.v1.min.js'></script>
<script src='../source/third_party/tfjsv3.18.0.js'></script>
<script src='../source/third_party/npyjs-global.js'></script>
<script src='../source/third_party/swoopy-drag.js'></script>

<script src='../source/third_party/footnote_v2.js'></script>
<script src='../source/third_party/citation_v2.js'></script>

<script src='../source/scripts/util.js'></script>
<script src='../source/scripts/init-info-plane.js'></script>
<script src='../source/scripts/init-animate-steps.js'></script>
<script src='../source/scripts/init-embed-vis.js'></script>
<script src='../source/scripts/init-input-sliders.js'></script>
<script src='../source/scripts/init-swoopy.js'></script>

<link rel='stylesheet' href='../source/scripts/tabular/style.css'>
<script src='../source/scripts/tabular/init-waves.js'></script>
<script src='../source/scripts/tabular/init.js'></script>
