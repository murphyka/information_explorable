---
template: post_v2.html
title: Where is the information in data?  
subtitle: An interactive tutorial about identifying the most relevant variation in data through compression
socialsummary: An interactive introduction to information decomposition as a route to interpretability.
shareimg: 
shareimgabstract: 
authors: <a href=https://kieranamurphy.com>Kieran Murphy</a>, <a href=https://complexsystemsupenn.com>Dani Bassett</a>
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
You might mention the overall size or something about the rear, understanding that there is specific variation among vehicles that best distinguishes cars from trucks and other variation that is less relevant (e.g., the color).

The goal of this post is to build intuition around localizing information, something we naturally do to make sense of the world, and show how it can be formulated with machine learning as a route to interpretability.
The long and short (**TL;DR**) is that we can view the information in data as specific distinctions worth making, in that these distinctions tell us the most about some other quantity we care about.

This post presents a different take on mutual information than other intros to information theory<a class='footstart' key='other-info-resources'></a>.
Rather than talking about the mutual information between two variables as something fixed in stone, we will introduce auxiliary variables that encapsulate some variation in a variable and compress away the rest.
The auxiliary variables can be thought of as messages sent by one party who observes the original "source" variable, to another party who will use the information to predict a "target" variable<a class='footstart' key='info-bottleneck'></a>.

### Communicating information

You've been transported back in time to the days of the telegraph and tasked with setting up a storm communication system with neighboring towns.
A town sends a binary signal to tell about their weather conditions locally, using a voltage of `$-1$` for calm weather and `$+1$` for stormy weather.

<div class="container">
  <figure>
    <img src="data/weather.jpg" width="400" />
    <figcaption>Calm weather: `$-1\text{V}$` <br>Stormy weather: `$+1\text{V}$`</figcaption>
  </figure>
</div>

Let's say the weather in a neighboring town (town A) is completely unpredictable one hour to the next<a class='footstart' key='weather-caveats'></a>, and it's calm half the time, stormy the other half of the time.
That town's weather will be one of our "source" random variables, which we'll call `$X_A$`.
It has two equally probable outcomes (calm or stormy), so `$X_A$` has one bit of uncertainty (aka entropy)<a class='footstart' key='entropy'></a>.

The message your town receives from the telegraph line will be our auxiliary random variable -- call it `$U_A$`.
The mutual information between the two, `$I(X_A;U_A)$`, is the amount of information transmitted per message -- it's the amount that receiving a message reduces your uncertainty about town A's weather<a class='footstart' key='mutual_info'></a>.
The more money you spend on the telegraph line, the lower the noise in the line and the better you'll be able to infer the other town's weather.
<div class="container">
  <div class='transmission-noise-slider'></div>
</div>

<div class='storm-telegraph-single row'></div>

**Why is the transmitted information lower when the noise increases?**  As the distributions `$p(u|x=C)$` <coloredText style="background:#D5E5F0;">(blue)</coloredText> and `$p(u|x=S)$` <coloredText style="background:#F7D1D2;">(red)</coloredText> overlap, there's a growing chance of receiving a low voltage signal (i.e., around `$0\text{V}$`), in which case you remain uncertain about whether the original signal was `$-1\text{V}$` or `$+1\text{V}$` even after receiving the message.  The transmitted information can **at most** reduce your uncertainty by one bit because that is the amount of uncertainty you started with, so as the chance of receiving ambiguous messages grows, the transmitted information necessarily drops.  

#### Information from multiple sources

Now let's say there are two neighboring towns (A and B<a class='footstart' key='b-weather'></a>) with which to build telegraph lines, and you have a fixed budget for the whole project. How much money should you allocate for each line?  


Due to the surrounding landscape, the weather is not trivially related between their towns and yours.  
A dataset has been collected (using the random variable `$Y$` to describe the weather in your town), shown below in terms of the conditional distributions `$p(y=\text{stormy} |x_\text{A}, x_\text{B})$`.

<div class='storm-heatmap' align='center'></div>

To get the most value out of the telegraph lines, we need to localize the information contained in the sources `$X_A$` and `$X_B$` about the target `$Y$`.
In order to do that, we'll look at all the possible ways to communicate information about the sources -- effectively simulating every possible budget allocation.

<div class='sticky-container'>

<div class='storm-telegraph row sticky'></div>

Each dot in plot above represents a different information allocation between the two towns, and each one lowers your error in predicting `$Y$` (your town's weather) a different amount<a class='footstart' key='y-not-info'></a>.
In the top left, you don't receive any information from the other towns and your error is maximal. 
In the bottom right, you receive one bit of information from each town, and the error is as low as you can go (which is set by the total mutual information between sources and target `$I(X_A,X_B;Y)$`).

What we've done is laid out all the ways to select variation from the source variables.
Localizing the information the sources contain about the target means identifying the variation that lowers the error the most.
The most informative variation lies along the [Pareto front](https://en.wikipedia.org/wiki/Pareto_front) -- the curve of allocations that lower the error most while spending the least on the telegraph lines.
Let's display these optimal information allocations by clicking the button below.

<label class="switch">
  <input type="checkbox" name="pareto">
  <span class="toggle round"></span> 
</label> *Display optimal information allocations*

The right vertical axis now displays the optimal amount of information to receive from each town.
If your budget only allows for one total bit of transmitted information, it's best to get about 3/4 of a bit from town A and 1/4 of a bit from town B.
Phrased more generally, given the statistical relationship observed in the dataset, we've found a spectrum of the most informative variation in `$X_A$` and `$X_B$` about `$Y$`.

Let's change the statistical relationship between the towns' weather. 
Adjust the sliders or click on the buttons below, and watch for changes in the optimal information allocations. 
<div class='container'>
  <div class='storm-probability-sliders'></div>
  <div class='storm-probability-buttons' id='buttons1'></div>
  <div class='storm-probability-buttons' id='buttons2'></div>
</div>

When mirroring town A's weather (<digits>MirrorA</digits>), we see that there is no information in B as it does nothing to reduce our predictive error.
With the logic gates, we see that both towns contain relevant information because the optimal allocation is an equal split.
<digits>XOR</digits> is unique among the logic gates in that the error is slow to decrease in the low-information regime, and in the greater discrepancy between optimal and suboptimal information allocations<a class='footstart' key='xor'></a>. 

</div>

Whereas a typical information theory treatment of this scenario might have looked at `$I(X_A;Y)$`, `$I(X_B;Y)$`, and `$I(X_A,X_B;Y)$`, we explored the space of partial information allocations by introducing the auxiliary variables `$U_A$` and `$U_B$`.
We've searched through all possible lossy compressions of each source random variable to identify the information contained in each that is most predictive of the target.
<!-- 
**At a high level,** the variation in the sources (the weather of towns A and B) is not all equal in the amount of information it shares with the target variable (your town's weather).
By mapping out the predictive error in all ways of selecting partial bits from the sources, the variation is sorted and we can "point" to the variation that is most shared with the target. 
Because mutual information is just shared variation, we've localized the information shared between the sources and the target. -->

#### Searching through the sea of variation with machine learning

Having proven yourself with the economical storm warning system, the three towns have tasked you with building another communication system.
Your town is home to the largest hospital in the region, but towns A and B contain specialized testing devices that your hospital regularly needs.
A blood sample is sent off to town A, and their device measures one of four results; another sample is sent to B and its (different) device can also output one of four results.
Whether or not to administer a full dose of a particular drug depends on the results from A and B.
**Where, in each of the test results, is the information about whether to administer the drug?**

Since we are only interested in the Pareto front -- the information allocations that maximize predictive power -- we can set this up as an optimization problem.
Specifically, we'll pass the possible messages for town A through a variational encoder and those for town B through a second one.
These variational encoders look just like the front half of a variational autoencoder (VAE)<a class='citestart' key='vae'></a>
We can penalize the transmitted information in the same way VAEs do: with the expected KL divergence with some arbitrary (but convenient) prior.
Then the encodings, which will already have compressed away some information about the inputs, will be used for prediction of the target, and the whole setup can be trained end-to-end with gradient descent.

<div class="container">
  <img src="data/schematic.svg" width="300" />
</div>

Let's see how it does, by sweeping over the cost of transmitting information.
On the left is the distribution to model with the predictive models' reconstruction below it.
The trajectory of information allocations versus error is mapped out during training, with the trajectory greyed out during the first stage -- where the relationship between `$X_1$`, `$X_2$`, and `$Y$` are learned with effectively no information cost -- and full color during the second.

<div class='pixel-game row'></div>

<div class='container'>
  <div class='train-dib-button'></div>
  <div class='pixel-buttons' id='buttons3'></div>
</div>

Note, the training process is happening in your browser, so the models are lightweight and the learning rate is high.
The model will occasionally fail to fit the simple distribution.

Underneath the information plane are the one dimensional latent spaces corresponding to `$U_1$` and `$U_2$`.
The colored Gaussians are the representations of the specific test outcomes, while the gray Gaussian is the prior to which all embeddings must conform when the information penalty is high.

Try the <digits>checker</digits> pattern.
The information about `$Y$` is quite apparent in the latent spaces.
Outcomes A and C collapse, as do B and D; the same happens for `$U_2$`.
Evidently the distinction between test results (A or C) and (B or D) is the one bit of relevance to `$Y$`.
The other bit is irrelevant.

By sweeping the information penalty, we use machine learning to search through compression schemes and find the optimal information allocations.
This allows us to "point" to where the information about `$Y$` is most economically stored.
Beyond finding the optimal budget allocations, we can also tell the two towns where to focus their test resolution, say for new versions of their test devices.

#### Where is the information in the bikeshare dataset?

We've focused on small-scale examples so that we could visualize as much as possible.
Let's move on to a real world dataset, a classic for evaluating interpretable machine learning methods.

*Bikeshare*<a class='citestart' key='bikeshare'></a> is a dataset containing hourly bike rentals in Washington, D.C. in 2011 and 2012, combined with a handful of weather descriptors at each point in time.
The goal is to predict the number of bikes rented given time and weather information, and to shed light on the learned relationship.

<div class="container">
  <figure>
    <img src="data/bike.jpg" width="300" />
  </figure>
</div>

Our source variables `$X_i$` are the time and weather descriptors.
Some, like temperature and humidity, are continuous variables.
Others are categorical, including the season and the hour of the day.
We want to identify -- out of all of the variation in these descriptors -- the specific bits that are most connected with bike rentals.
Where do you think the information resides?

We ran the optimization offline, but you can run it yourself with the code on <a href="https://github.com/distributed-information-bottleneck/distributed-information-bottleneck.github.io">github</a>. 

<div class='sticky-container'>
<div class='tabular-decomp row sticky'></div>

The optimal information allocations are shown above, and there's a lot to note.

The <digits>hour</digits> feature is by far the most important, which is fairly intuitive. 
The dataset includes rentals in the middle of the night, which are surely different than in the middle of the day. 
<digits>temperature</digits> is important and contributes a growing share as the total information increases.
By contrast, <digits>year</digits> and <digits>working day?</digits> contributed their partial bit and saturate. 
<digits>wind</digits> and <digits>apparent temperature</digits> contribute almost nothing, with the latter presumably because we've already gotten information from the <digits>temperature</digits> feature.

For reference, interpretable methods that are based on linear combinations of the features (e.g., Neural Additive Models<a class='citestart' key='nam'></a>) achieve RMSE of 100.
For a fully nonlinear processing of the features, we need only 4 or 5 bits of information.
We don't mind that the processing is opaque: our source of interpretability is the information in the features. 

**What are the specific bits of variation in the different features?**
Below are distinguishability matrices for the twelve features as a function of the total information extracted.
The matrices visualize the distinctions between feature values that are passed along to the predictve model, and are agnostic to the dimensionality of the latent space.
The matrix entries are white if the feature values are indistinguishable (same as when the posterior distributions coincided in the above example) and blue depending on the degree of distinguishability<a class='footstart' key='bhat'></a>.
The auxiliary variables select the distinctions among feature values that are worth communicating to the predictive model.
<div class="container">
  <div class='compression-level-slider'></div>
</div>
<div class='distinguishability-mats row' width="50"></div>

</div>

#### Conclusion

By using auxiliary variables to compress our source variables, we gain the ability to identify specific variation across all the sources that is most predictive of the target variable.
Rather than measuring the mutual information between subsets of the sources and the target -- which can nevertheless be insightful -- we obtain a continuous spectrum of the important bits and a soft ramp to interpretability.

If you find this manner of analysis intriguing and want to learn more, check out our recent papers on the topic:

<a class="paper-title-link" href="https://arxiv.org/abs/2211.17264">Interpretability with full complexity by constraining feature information</a> ICLR 2023

<a class="paper-title-link" href="https://www.pnas.org/doi/abs/10.1073/pnas.2312988121">Information decomposition in complex systems via machine learning</a> PNAS 2024

### Acknowledgements

We thank Sam Dillavou and XYZ for feedback on this post.

<br>

### Footnotes

<a class='footend' key='other-info-resources'></a>
Two great ones to check out are [this classic](https://colah.github.io/posts/2015-09-Visual-Information/) by Christopher Olah and 3blue1brown's [video about wordle](https://youtu.be/v68zYyaEmEA).

<a class='footend' key='info-bottleneck'></a> 
If you're familiar with the information bottleneck<a class='citestart' key='ib'></a>, that's exactly what we're talking about, except we'll have more than one source variable.

<a class='footend' key='weather-caveats'></a> 
i.e., forecasting won't help you.

<a class='footend' key='entropy'></a> 
Formally, with `$X$` a random variable and `$p(x)$` the probability distribution over its outcomes, the entropy is the expected log probability value for any outcome, `$H(X)=\mathbb{E}_{x\sim p(x)} [- \log \ p(x)]$`.

<a class='footend' key='mutual_info'></a> 
Formally, with `$X$` and `$Y$` two random variables, the mutual information is `$I(X;Y)=H(X)-H(X|Y)=H(Y)-H(Y|X)$`.  It quantifies the amount of shared variation in the two random variables<a class='citestart' key='cover'></a>.

<a class='footend' key='b-weather'></a> 
Town B's weather is, oddly enough, completely independent of town A's weather.  It's also a 50/50 split between calm and stormy.

<a class='footend' key='y-not-info'></a> 
The vertical axis could have displayed the mutual information `$I(U_A,U_B;Y)$` instead of cross entropy error `$BCE=H(Y)-I(U_A,U_B;Y)$`, so that all quantities are mutual information terms, but later we'll want to use other errors like RMSE, so we opted for consistency.

<a class='footend' key='xor'></a>
Look at the difference in error between half a bit from each town and one bit from either town. 
The difference in error is large for XOR while it's almost nothing for the other logic gates. 

<a class='footend' key='bhat'></a> 
Specifically, we use the Bhattacharyya coefficient between the posterior distributions, which is one when they perfectly overlap and zero when they have no overlap.

### References

<a class='citeend' key='ib'></a> Elements of Information Theory
Cover, T. & Thomas, J. (1991). John Wiley & Sons, Inc.

<a class='citeend' key='cover'></a> [The information bottleneck method](https://arxiv.org/abs/physics/0004057)
Tishby, N., Pereira, F. C., & Bialek, W. arXiv preprint physics/0004057 (2000).

<a class='citestart' key='vae'></a> [Auto-encoding variational Bayes](https://arxiv.org/abs/1312.6114)
Kingma, D. & Welling, M. arXiv preprint arXiv:1312.6114 (2013).

<a class='citestart' key='dvib'></a> [Deep variational information bottleneck](https://arxiv.org/abs/1612.00410)
Alemi, A. A., Fischer, I., Dillon, J. V., Murphy, K. (ICLR 2017).

<a class='citeend' key='bikeshare'></a> [UCI machine learning repository](https://archive.ics.uci.edu/)
Dua, D., & Graff, C. (2017).

<a class='citeend' key='nam'></a> [Neural additive models: Interpretable machine learning with neural nets](https://archive.ics.uci.edu/)
Agarwal, R., Melnick, L., Frosst, N., Zhang, X., Lengerich, B., Caruana, R., & Hinton, G. (NeurIPS 2021).

<link rel='stylesheet' href='source/third_party/footnote_v2.css'>
<link rel='stylesheet' href='source/third_party/citation_v2.css'>
<link rel='stylesheet' href='source/scripts/style.css'>

<script id='MathJax-script' async src='https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'></script>
<script defer src='https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/mathtex-script-type.min.js' integrity='sha384-jiBVvJ8NGGj5n7kJaiWwWp9AjC+Yh8rhZY3GtAX8yU28azcLgoRo4oukO87g7zDT' crossorigin='anonymous'></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js"></script>
<script src='source/third_party/d3_.js'></script>
<script src='source/third_party/d3-scale-chromatic.v1.min.js'></script>
<!-- <script src='source/third_party/tfjsv3.18.0.js'></script> -->
<script src='source/third_party/npyjs-global.js'></script>
<script src='source/third_party/swoopy-drag.js'></script>

<script src='source/third_party/footnote_v2.js'></script>
<script src='source/third_party/citation_v2.js'></script>

<script src='source/scripts/util.js'></script>
<script src='source/scripts/init-input-sliders.js'></script>

<link rel='stylesheet' href='source/scripts/tabular/style.css'>
<script src='source/scripts/tabular/init.js'></script>
<script src='source/scripts/tabular/init-distinguishability.js'></script>

<link rel='stylesheet' href='source/scripts/storms/style.css'>
<script src='source/scripts/storms/init-single-line.js'></script>
<script src='source/scripts/storms/init-multi-line.js'></script>

<script src='source/scripts/pixels/init-pixels.js'></script>
<link rel='stylesheet' href='source/scripts/pixels/style.css'>


<script src='source/scripts/init-info-plane.js'></script>
<script src='source/scripts/init-storms.js'></script>
<script src='source/scripts/init-pixel-game.js'></script>
<script src='source/scripts/init-animate-steps.js'></script>
<script src='source/scripts/init-embed-vis.js'></script>
<script src='source/scripts/init-swoopy.js'></script> 