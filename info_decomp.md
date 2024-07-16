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
<div class="container">
  <p>
    <img src="data/car.jpg" width="300" />
    <img src="data/truck.jpg" width="300" /> 
  </p>
</div>

It might be an unusual phrasing, but you'd probably understand what they mean.
You might mention the overall size or something about the rear of the vehicle, having an intuitive sense that there is specific variation among vehicles that best distinguishes cars from trucks and other variation that is irrelevant (e.g., the color).

The goal of this post is to build intuition around localizing information, something we naturally do when making sense of the world, and show how it can be formulated with machine learning as a powerful and practical route to interpretability.
The long and short (**TL;DR**) is that we can view the information in data as specific distinctions worth making, in that these distinctions tell us the most about some related quantity we care about.

There are some great intros to information theory online<a class='footstart' key='other-info-resources'></a>. 
The scope here is a little less broad so that we can really hammer home the notion of pointing to specific bits that contain information we care about, though hopefully by the end you'll see it's all quite general.  For this post, we'll repeatedly talk about information in terms of communication between two parties.  

### Information from the perspective of communicating distinctions

You've been transported back in time to the days of the telegraph and tasked with setting up a storm communication system with neighboring towns.
A nearby town can send a binary signal to tell about their weather conditions locally -- essentially a thumbs up or a thumbs down, sent as the voltage in a wire -- and your town will use the information for its own warning system.

<div class="container">
  <figure>
    <img src="data/weather.jpg" width="500" />
    <figcaption>Good weather: `$-1$` <br>Bad weather: `$+1$`</figcaption>
  </figure>
</div>

The mutual information in two random variables is the amount that learning the outcome of one reduces your uncertainty about the other<a class='footstart' key='mutual_info'></a>.
Let's say the weather in a neighboring town is completely unpredictable one hour to the next<a class='footstart' key='weather-caveats'></a>, and balanced such that 50% of the time it's calm and 50% of the time there's a storm.
That town's weather will be one of our random variables, which we'll call `$X$` -- it has two equally probable outcomes (calm or stormy), so it has one bit of uncertainty (aka entropy)<a class='footstart' key='entropy'></a>.
The other random variable we'll use is the message your town receives from the telegraph line, which we'll call `$U$`.
The mutual information between the two, `$I(X;U)$`, is the amount of information transmitted per message -- it's the amount that receiving the message tells us about the other town's weather.
The more money you spend on the telegraph line, the lower the noise in the line and the better you'll be able to infer the other town's weather.
<div class="container">
  <div class='transmission-noise-slider'></div>
</div>

<div class='storm-telegraph-single row'></div>

**Why is the transmitted information lower when the noise increases?**  Once the distributions `$p(u|x=-1)$` and `$p(u|x=+1)$` overlap, there's a decent chance you receive a 0 volt signal, in which case you have no idea whether the original signal was `$-1$` or `$+1$`.  Or, you receive 0.1V, in which case you can be slightly more sure that the nearby town sent `$+1$`, but you're still quite uncertain.  The combination of all of these scenarios means that, on average, you receive less than one bit per message.

#### Information from multiple sources

Now let's say there are two neighboring towns to build telegraph lines between, and you have a fixed budget for the whole project.  How much money should you allocate for each line?  Importantly, due to the surrounding landscape, the weather is not trivially related between all three towns.  A dataset has been collected, with the joint distribution shown below as a heatmap, with extreme weather is represented as <digits>1</digits>.
<div class='sticky-container'>

<div class='storm-telegraph row sticky'></div>

<br>
<br>
<label class="switch">
  <input type="checkbox" name="pareto">
  <span class="toggle round"></span> 
</label>
Display Pareto

With this distribution, we can simulate the full spectrum of information transmission rates from the two towns.  
Adjust the slider bars to allow less or more information from each town.
<div class='storm-probability-sliders'></div>

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
</div>

**At a high level,** the variation in the sources (the weather of towns A and B) is not all equal in the amount of information it shares with the target variable (your town's weather).
By mapping out the predictive error in all ways of selecting partial bits from the sources, the variation is sorted and we can "point" to the variation that is most shared with the target. 
Because mutual information is just shared variation, we've localized the information shared between the sources and the target.

#### Groups of pixels

Occasionally the local board game clubs like to borrow the telegraph lines to play a cooperative game.
The night before, all three clubs meet in one of the towns and draw out a board of light and dark squares, like the one below.

Then, roles are assigned.
Two towns will be communicators and the third will aggregate information.
After working together on communication schemes, the clubs go home and play the following day.
The game proceeds as follows: a square on the board is chosen at random by the two communicator towns, and its position must be communicated to the aggregator via the information-limited telegraph lines.
The aggregator uses the limited information to make a prediction about whether the selected square was light or dark.
After a series of rounds, the towns meet again to check the success of the predictions.

For simplicity, we'll say towns A and B are the communicators.
A selects a row at random and B selects a column at random.



#### Information about bike rentals

<div class='tabular-decomp row'></div>

text

<div class='sticky-container'>
<div class='mod-top-weights row x-sticky x-sticky-lower'></div>

### Credits

Thanks to XYZ for their help with this piece.

<br>

### Footnotes

<a class='footend' key='other-info-resources'></a>
Two of my favorites are [this classic](https://colah.github.io/posts/2015-09-Visual-Information/) by Christopher Olah and 3blue1brown's [video about wordle](https://youtu.be/v68zYyaEmEA).

<a class='footend' key='transmission-caveats'></a> 
assuming there is some standard operating voltage

<a class='footend' key='weather-caveats'></a> 
i.e., forecasting won't help you.


<a class='footend' key='entropy'></a> 
With `$X$` a random variable and `$p(x)$` the probability distribution regarding its outcomes, the entropy is the expected logit value for any outcome, `$H(X)=\mathbb{E}_{x\sim p(x)} [- \log \ p(x)]$`.

<a class='footend' key='mutual_info'></a> 
With `$X$` and `$Y$` two random variables, the mutual information is `$I(X;Y)=H(X)-H(X|Y)=H(Y)-H(Y|X)$`.  It quantifies the amount of shared variation in the two random variables<a class='citestart' key='cover'></a>.

<span class='fn-break'></span>
Modular addition sounds simple and it is. We can easily train 1,000s of models and treat them like fruit flies in neuroscience: small enough such that it is feasible to extract their [connectome](https://www.science.org/doi/abs/10.1126/science.add9330) synapse-by-synapse, yet providing new interesting insights about the system more broadly. We can get a good understanding of the small models we've trained by visualizing all their internals.

<span class='fn-break'></span>

### References

<a class='citeend' key='cover'></a> Elements of Information Theory
Cover, T. & Thomas, J. (1991). John Wiley & Sons, Inc.

<a class='citeend' key='Omnigrok'></a> [Omnigrok: Grokking Beyond Algorithmic Data](https://arxiv.org/pdf/2210.01117.pdf)
Liu, Z., Michaud, E. J., & Tegmark, M. (2022, September). In The Eleventh International Conference on Learning Representations.

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
<script src='source/scripts/init-input-sliders.js'></script>

<link rel='stylesheet' href='source/scripts/tabular/style.css'>
<script src='source/scripts/tabular/init-waves.js'></script>
<script src='source/scripts/tabular/init.js'></script>

<link rel='stylesheet' href='source/scripts/storms/style.css'>
<script src='source/scripts/storms/init-single-line.js'></script>
<script src='source/scripts/storms/init-fixed-joint.js'></script>
<script src='source/scripts/storms/init-modifiable-joint.js'></script>
<script src='source/scripts/storms/init-training-dib.js'></script>

<script src='source/scripts/init-info-plane.js'></script>
<script src='source/scripts/init-storms.js'></script>
<script src='source/scripts/init-animate-steps.js'></script>
<script src='source/scripts/init-embed-vis.js'></script>
<script src='source/scripts/init-swoopy.js'></script> 