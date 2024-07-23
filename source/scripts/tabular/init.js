/* Copyright 2023 Google LLC. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/



window.tabularState = window.tabularStateX || {
  isLocked: false,
  dataset: 'bikeshare',
}

window.initTabular = async function(){

  var state = tabularState
  state.runPath = `${state.dataset}`
  state.renderAll = util.initRenderAll(['compressionLevel', 'curveHighlighter'])
  
  // Grab the information decomp and the distinguishability matrices
  var almostParsedDecomp = await util.getFile(state.runPath + '_info_decomp.npy')
  // stone age reshape
  var decompShape = almostParsedDecomp.shape
  var decompData = almostParsedDecomp.data
  var parsedDecomp = [];
  var i = 0;
  for (l = decompData.length + 1; (i + decompShape[1]) < l; i += decompShape[1]) {
      parsedDecomp.push(decompData.slice(i, i + decompShape[1]));
  }
  // quick transpose ty stackoverflow
  // state.info_decomp = _.zip(...parsedDecomp)  // actually, we want [time step, index] for d3
  state.info_decomp = parsedDecomp

  state.feature_labels = ['season', 'year', 'month', 'hour', 'holiday?', 'day of week', 'working day?', 'weather', 'temperature', 'apparent temp.', 'humidity', 'wind']
  // state.info_decomp = math.reshape(state.info_decomp.data, state.info_decomp.shape)
  // state.dist_matrices = await util.getFile(state.runPath + '_dist_matrices.npy')
  window.initInfoPlane({
    sel: d3.select('.tabular-decomp'),
    state,
    lossLabel: "RMSE",
    // title: `Information decomposition on ${state.dataset}`
  })

  // init annotations quickly to avoid pop in
  var annotations = [
    {
      "parent": ".mod-top-accuracy > div",
      "minWidth": 850,
      "html": "The model quickly fits the <b style='color:var(--color-train)'>training data</b> with 100% accuracy...",
      "st": {
        "top": 40,
        "left": 80,
        "width": 170
      },
      "path": "M -4,-38 A 34.887 34.887 0 0 1 -45,-66"
    },
    {
      "parent": ".mod-top-accuracy > div",
      "minWidth": 850,
      "html": "...but doesn't do better than random guessing on the <b style='color:var(--color-test)'>test data</b>",
      "st": {
        "top": 105,
        "left": 110,
        "width": 150,
        "textAlign": "right"
      },
      "path": "M 4,-28 A 15.78 15.78 0 0 1 19,-3"
    },
    {
      "parent": ".mod-top-accuracy > div",
      "minWidth": 850,
      "html": "After more training, accuracy on the test data improves — the model <b>generalizes</b>!",
      "st": {
        "top": 90,
        "left": 320,
        "width": 190
      },
      "path": "M 129,-14 A 42.847 42.847 0 0 0 200,-32"
    },
    {
      "parent": ".mod-top-accuracy > div",
      "minWidth": 850,
      "html": "Mouse over to scrub through training",
      "st": {
        "top": 115,
        "left": 680,
        "width": 130,
        "opacity": 0
      },
      "path": "M 46,-13 A 48.574 48.574 0 0 1 -22.999998092651367,9.000000953674316",
      "class": "scroll-show no-shadow"
    },
    {
      "parent": ".mod-top-waves > div:last-child > div > div",
      "minWidth": 1000,
      "html": "Each line shows a single neuron",
      "st": {
        "top": 75,
        "left": 395,
        "width": 110
      },
      "path": "M 67,-15 A 45.998 45.998 0 0 1 -1,9",
      "class": "no-shadow"
    },
    {
      "parent": ".mod-top-waves > div:last-child > div > div",
      "minWidth": 1050,
      "html": "Neurons repeating 7 times at the end of training are in this row",
      "st": {
        "top": 265,
        "left": 395,
        "width": 145
      },
      "path": "M 64,-70 A 51.92 51.92 0 0 0 9,-124",
      "class": "no-shadow"
    }
  ]
  var topAccuracySel = d3.select('.tabular-decomp')//.classed('hidden-step', 1)

  var distMatrices = d3.select('.tabular-decomp-dist-matrices').html('')
  // window.initEmbedVis({
  //   sel: distMatrices.append('div'),
  //   state,
  //   maxY: 5,
  //   sx: 5,
  //   sy: 4,
  //   type: 'dist_matrices',
  // })
  // window.initEmbedVis({
  //   sel: distMatrices.append('div'),
  //   state,
  //   maxY: 5,
  //   sx: 5,
  //   sy: 4,
  //   type: 'out_embed_t_w',
  //   xAxisLabel: 'Output Number',
  //   yAxisLabel: '',
  // })

  // state.renderAll.compressionLevel.fns.push(d => {
  //   var step = state.stepIndex*state.hyper.save_every

  //   hoverTick.translate(c.x(step), 0)
  //   hoverTick.select('text').text(d3.format(',')(step))
  // })

  // c.svg.append('rect')
  //   .at({width: c.width, height: c.height + 30, fillOpacity: 0})
  //   .on('mousemove touchmove', function(){
  //     d3.event.preventDefault()

  //     // last training run missing on some models
  //     var mouseX = d3.clamp(0, d3.mouse(this)[0], c.width - .1)
  //     state.stepIndex = Math.floor(c.x.clamp(1).invert(mouseX)/state.hyper.save_every)
  //     state.renderAll.step()
  //   })



  state.renderAll.compressionLevel()

  // initSwoopy(annotations)
  // var observer = new IntersectionObserver(entries => {
  //   entries.forEach(entry => {
  //     if (entry.isIntersecting){
  //       d3.select('.scroll-show').st({opacity: 1})
  //       topAccuracySel.classed('hidden-step', 0)
  //     }
  //   })
  // }, {root: null, rootMargin: '0px', threshold: 1.0})
  // observer.observe(distMatrices.node())


  util.addAria([
    {selector: '.tabular', label: `Information decomposition for a tabular dataset, where the most important bits for lowering the loss are extracted from each of the features.`},
  ])
}
window.initTabular()
