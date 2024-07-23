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
  state.infoLevels = []
  for (l = decompData.length + 1; (i + decompShape[1]) < l; i += decompShape[1]) {
      parsedDecomp.push(decompData.slice(i, i + decompShape[1]));
      if ((Math.floor(i/decompShape[1]) % 2) == 0) { // get the total info to help with displaying the distinguishability mats
        state.infoLevels.push(decompData[i+12])
      }
  }
  state.infoLevels = state.infoLevels.slice(-40).reverse()  // just the number of mats I saved
  // quick transpose ty stackoverflow
  // state.info_decomp = _.zip(...parsedDecomp)  // actually, we want [time step, index] for d3
  state.info_decomp = parsedDecomp

  state.featureLabels = ['season', 'year', 'month', 'hour', 'holiday?', 'day of week', 'working day?', 'weather', 'temperature', 'apparent temp.', 'humidity', 'wind']
  // state.info_decomp = math.reshape(state.info_decomp.data, state.info_decomp.shape)
  // state.dist_matrices = await util.getFile(state.runPath + '_dist_matrices.npy')
  window.initInfoPlane({
    sel: d3.select('.tabular-decomp'),
    state,
    lossLabel: "RMSE",
    // title: `Information decomposition on ${state.dataset}`
  })


  // var topAccuracySel = d3.select('.tabular-decomp')//.classed('hidden-step', 1)
  state.distMatrices = []
  state.numberFeatures = 12
  for (let featureInd=0; featureInd<state.numberFeatures; featureInd++) {

    distMat = await util.getFile(state.runPath + `_feature${featureInd}_mats.npy`)
    matShape = distMat.shape
    matData = distMat.data
    parsedMat = [];
    let pointerIndex = 0
    for (let l=matData.length+1; (pointerIndex + matShape[1]*matShape[2]) < l; pointerIndex += matShape[1]*matShape[2]) {
      tempMat = []
      for (let j=0; j<matShape[1]; j++) {
        for (let k=0; k<matShape[2]; k++) {
          // tempMat.push(matData.slice(pointerIndex+j*matShape[2], pointerIndex + (j+1)*matShape[2]))
          tempMat.push([j, k, matData[pointerIndex+j*matShape[1]+k]])
        }
      }
      parsedMat.push(tempMat);
    }
    state.distMatrices.push(parsedMat.reverse())
  }

  state.compressionInd = 0
  window.initDistinguishability({
    sel: d3.select('.distinguishability-mats'),
    state,
  })

  window.initCompressionLevelSlider({
    sel: d3.select('.compression-level-slider'),
    state,
  })

  // state.renderAll.compressionLevel.fns.push(d => {
  //   var step = state.stepIndex*state.hyper.save_every

  //   hoverTick.translate(c.x(step), 0)
  //   hoverTick.select('text').text(d3.format(',')(step))
  // })

  // state.renderAll.compressionLevel()

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
}

