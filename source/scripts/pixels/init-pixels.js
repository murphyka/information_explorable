
window.initPixelGame = async function({sel, state, isBig=true}){
  state.renderAll = util.initRenderAll(['redraw', 'trainDIB', 'varyTrainingStep']);
  state.numberTrainingSteps = 1000
  state.displayEvery = 5
  state.trainingStepDisplayIndex = 0

  state.trainingBoards = []
  state.trainingDistMats1 = []
  state.trainingDistMats2 = []
  state.trainingLatents1 = []
  state.trainingLatents2 = []
  state.trainingInfoAllocs1 = []
  state.trainingInfoAllocs2 = []
  state.trainingError = []

  batchSize = 1024
  learningRate = 2e-2
  betaStart = tf.scalar(1e-3)
  betaEnd = tf.scalar(6e-1)
  betas = tf.exp(tf.log(betaStart).add(tf.range(0, state.numberTrainingSteps, 1, dtype='float32').div(state.numberTrainingSteps).mul(tf.log(betaEnd.div(betaStart)))))
  betasDisplay = await tf.exp(tf.log(betaStart).add(tf.range(0, state.numberTrainingSteps/state.displayEvery, 1, dtype='float32').div(state.numberTrainingSteps/state.displayEvery).mul(tf.log(betaEnd.div(betaStart))))).array()
  
  let maxTotalInfoInDisplay = 2
  let maxSingleInfoInDisplay = 1
  // sel.append("p").style("align-items", "center")

  state.boardValues = [[0, 0, 0, 0], [1, 1, 1, 1], [1, 0, 0, 0], [1, 1, 1, 1]]
  state.originalDims = [state.boardValues.length, state.boardValues[0].length]

  state.d3ReadableBoardValues = []
  d3zeroedBoardValues = []
  d3zeroedBoardValuesDist1 = []
  d3zeroedBoardValuesDist2 = []
  state.rowLabels = ['A', 'B', 'C', 'D']
  state.colLabels = ['a', 'b', 'c', 'd']
  for (let i=0; i<state.boardValues.length; i++){
    for (let j=0; j<state.boardValues[0].length; j++){
      state.d3ReadableBoardValues.push([state.rowLabels[i], state.colLabels[j], state.boardValues[i][j]])
      d3zeroedBoardValues.push([state.rowLabels[i], state.colLabels[j], 0.5])
      d3zeroedBoardValuesDist1.push([state.rowLabels[i], state.rowLabels[j], 1])
      d3zeroedBoardValuesDist2.push([state.colLabels[i], state.colLabels[j], 1])
    }
  }
  
  //// Make the boards
  sel.append("p")
  .style("align-items", "center")

  boardSel = sel.append("div")
  .style("flex-direction", "column")
  .style("width", "200px")
  .style("overflow", "auto")
  .style("height", "100%")

  pdf_margin = {left: 40, right: 20, top: 40, bottom: 0}
  pdfWidth = 100
  clickableBoardSVG = boardSel
  .append("svg")
    .attr("width", pdfWidth + pdf_margin.left + pdf_margin.right)
    .attr("height", pdfWidth + pdf_margin.top + pdf_margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + pdf_margin.left + "," + pdf_margin.top + ")")

  // Build X scales and axis:
  clickableBoardX = d3.scaleBand()
    .range([ 0, pdfWidth ])
    // .domain(d3.range(state.boardValues.length))
    .domain(state.rowLabels)
    .padding(0.01)

  clickableBoardSVG.append("g")
      .attr("transform", "translate(0," + -23 + ")")
      .call(d3.axisBottom(clickableBoardX))
      .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", 14)
        .style("font-weight", "bold")
        .style("fill", function(d, i) {
          return util.colors.features[i]
        })


  // Build X scales and axis:
  clickableBoardY = d3.scaleBand()
    .range([ 0, pdfWidth ])
    // .domain(d3.range(state.boardValues[0].length))
    .domain(state.colLabels)
    .padding(0.01)

  clickableBoardSVG.append("g")
      .call(d3.axisLeft(clickableBoardY))
      .selectAll("text")
        // .attr("transform", "translate(-10,-10)rotate(-90)")
        .style("text-anchor", "middle")
        .style("font-size", 14)
        .style("font-weight", "bold")
        .style("fill", function(d, i) {
          return util.colors.features[i+state.originalDims[0]]
        })

    clickableBoardSVG
      .append('g')
      .translate([-21, pdfWidth/2])
      .append('text.axis-label')
      .text('Town 2')
      .at({textAnchor: 'middle', fill: '#000', transform: 'rotate(-90)'})

    clickableBoardSVG
      .append('g')
      .translate([pdfWidth/2, -19])
      .append('text.axis-label')
      .text('Town 1')
      .at({textAnchor: 'middle', fill: '#000'})
       
  clickableBoardSVG.selectAll("path,line").remove();

  // Build color scale
  var heatmapColor = d3.scaleSequential(d3.interpolateBrBG).domain([-0.3, 1.3]);
  clickableBoardSVG.selectAll()
      .data(state.d3ReadableBoardValues)
      .enter()
      .append("rect")
      .attr("x", function(d) {return clickableBoardX(d[0]) })
      .attr("y", function(d) { return clickableBoardY(d[1]) })
      .attr("width", clickableBoardX.bandwidth() )
      .attr("height", clickableBoardY.bandwidth() )
      .style("fill", function(d) { return heatmapColor(d[2])} )
      .on("click", function(d, i) { 
        state.boardValues[Math.floor(i/state.originalDims[0])][i%state.originalDims[0]] = 1-d[2];
        state.d3ReadableBoardValues[i] = [d[0], d[1], 1-d[2]];
        state.renderAll.redraw()
      })

  async function redrawBoard() {
    clickableBoardSVG.selectAll("rect")
      .data(state.d3ReadableBoardValues)
      .style("fill", function(d) { return heatmapColor(d[2])} )
  }
  state.renderAll.redraw?.fns.push(redrawBoard)
  // now draw the fitted board

  state.fittedBoardSVG = boardSel
  .append("svg")
    .attr("width", pdfWidth + pdf_margin.left + pdf_margin.right)
    .attr("height", pdfWidth + pdf_margin.top + pdf_margin.bottom)

  .append("g")
    .attr("transform",
          "translate(" + pdf_margin.left + "," + pdf_margin.top + ")")

  // Build X scales and axis:
  fittedBoardX = d3.scaleBand()
    .range([ 0, pdfWidth ])
    // .domain(d3.range(state.boardValues.length))
    .domain(state.rowLabels)
    .padding(0.01)

  state.fittedBoardSVG.append("g")
      .attr("transform", "translate(0," + -23 + ")")
      .call(d3.axisBottom(fittedBoardX))
      .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", 14)
        .style("font-weight", "bold")
        .style("fill", function(d, i) {
          return util.colors.features[i]
        })


  // Build X scales and axis:
  fittedBoardY = d3.scaleBand()
    .range([ 0, pdfWidth ])
    // .domain(d3.range(state.boardValues[0].length))
    .domain(state.colLabels)
    .padding(0.01)

  state.fittedBoardSVG.append("g")
      .call(d3.axisLeft(fittedBoardY))
      .selectAll("text")
        // .attr("transform", "translate(-10,-10)rotate(-90)")
        .style("text-anchor", "middle")
        .style("font-size", 14)
        .style("font-weight", "bold")
        .style("fill", function(d, i) {
          return util.colors.features[i+state.originalDims[0]]
        })

    state.fittedBoardSVG
      .append('g')
      .translate([-21, pdfWidth/2])
      .append('text.axis-label')
      .text('Town 2')
      .at({textAnchor: 'middle', fill: '#000', transform: 'rotate(-90)'})

    state.fittedBoardSVG
      .append('g')
      .translate([pdfWidth/2, -19])
      .append('text.axis-label')
      .text('Town 1')
      .at({textAnchor: 'middle', fill: '#000'})
       
  state.fittedBoardSVG.selectAll("path,line").remove();

  state.fittedBoardSVG.selectAll()
      .data(d3zeroedBoardValues)
      .enter()
      .append("rect")
      .attr("x", function(d) {return fittedBoardX(d[0]) })
      .attr("y", function(d) { return fittedBoardY(d[1]) })
      .attr("width", fittedBoardX.bandwidth() )
      .attr("height", fittedBoardY.bandwidth() )
      .style("fill", function(d) { return heatmapColor(d[2])} )

  ////////////////////////////////////// Display the information allocation
  var leftMargin = 60
  var rightMargin = 60
  var topMargin = 25 
  var bottomMargin = 50
  var actualHeight = isBig ? 200 : 30
  var actualWidth = isBig ? 350 : 50
  var c = d3.conventions({
    sel: sel.append('div'),
    width: actualWidth,
    height: actualHeight,
    margin: {left: leftMargin, right: rightMargin, top: topMargin, bottom: bottomMargin}
  })
  c.x.domain([0, maxTotalInfoInDisplay])
  c.y.domain([0, 1])  

  c.y2 = d3.scaleLinear().domain([0, maxSingleInfoInDisplay]).range([c.height, 0])
  c.y2Axis = d3.axisRight(c.y2).ticks(isBig ? 5 : 3)
  c.svg.append("g") 
        .attr("class", "y2 axis")
        .attr("transform", `translate(${actualWidth},0)`)
        .call(c.y2Axis) 

  c.yAxis.ticks(isBig ? 5 : 3)
  // c.svg.attr({"float": "left"})
  d3.drawAxis(c)

  c.svg.select('.y').lower()  // z order

  util.addAxisLabel(c, 'Total information from other towns (bits)', 'Error (RMSE)', y2Text='Information per town (bits)', xOffset=45, yOffset=-40)

  dummyData2 = [[0, 0]]

  var line = d3.line().x(d => c.x(d[0])) 

  var errorPathSelRampUp = c.svg.append('path')
    .at({strokeWidth: 2, stroke: "#000", fill: 'none', opacity: 0.2})
    .at({d: line.y(d => c.y(d[1]))(dummyData2)})

  var errorPathSelTurnAround = c.svg.append('path')
    .at({strokeWidth: 2, stroke: "#000", fill: 'none'})
    .at({d: line.y(d => c.y(d[1]))(dummyData2)})

  state.currMarkerRMSE = c.svg.selectAll("myCircles").data(dummyData2)
    .enter()
    .append("circle")
    .attr("fill", "black")
    .attr("stroke", "none")
    .attr("cx", function(d) { return c.x(d[0]) })
    .attr("cy", function(d) { return c.y(d[1]) })
    .attr("r", 3)

  state.currMarkerInfo1 = c.svg.selectAll("myCircles").data(dummyData2)
    .enter()
    .append("circle")
    .attr("fill", util.colors.features[0])
    .attr("stroke", "none")
    .attr("cx", function(d) { return c.x(d[0]) })
    .attr("cy", function(d) { return c.y2(d[1]) })
    .attr("r", 3)

  state.currMarkerInfo2 = c.svg.selectAll("myCircles").data(dummyData2)
    .enter()
    .append("circle")
    .attr("fill", util.colors.features[1])
    .attr("stroke", "none")
    .attr("cx", function(d) { return c.x(d[0]) })
    .attr("cy", function(d) { return c.y2(d[1]) })
    .attr("r", 3)

  state.townInfosRampUp = []
  state.townInfosTurnAround = []

  for (let townInd=0; townInd<2; townInd++) {
    state.townInfosRampUp.push(c.svg.append('path')
    .at({strokeWidth: 2, stroke: util.colors.features[townInd], fill: 'none', opacity: 0.2})
    .at({d: line.y(d => c.y2(d[1]))(dummyData2)}))
    state.townInfosTurnAround.push(c.svg.append('path')
    .at({strokeWidth: 2, stroke: util.colors.features[townInd], fill: 'none'})
    .at({d: line.y(d => c.y2(d[1]))(dummyData2)}))
  }

  for (let columnIndex=3; columnIndex<=5; columnIndex++) {
    window.initPixelButtons({
      sel: d3.select(`#buttons${columnIndex}`).html(''),
      state,
      columnIndex,
    });
  }

  window.initTrainingProgressSlider({
    sel: d3.select('.training-progress-slider').html(''),
    state,
  })

  async function drawTrainingStep() {
    state.fittedBoardSVG.selectAll("rect")
        .data(state.trainingBoards[state.trainingStepDisplayIndex])
        .style("fill", function(d) { return heatmapColor(d)} )

    state.distinguishabilitySVGs[0].selectAll("rect")
          .data(state.trainingDistMats1[state.trainingStepDisplayIndex])
          .style("fill", function(d) { return util.distinguishabilityColorMap(d)} )

    state.distinguishabilitySVGs[1].selectAll("rect")
          .data(state.trainingDistMats2[state.trainingStepDisplayIndex])
          .style("fill", function(d) { return util.distinguishabilityColorMap(d)} )

    for (let inputInd=0; inputInd<state.originalDims[0]; inputInd++) {
      plotData = []
      state.trainingLatents1[state.trainingStepDisplayIndex][inputInd].forEach((v, i) => plotData.push([xxLatentInputsJS[i], v]))
      state.latentCurves[inputInd]
        .at({d: d3.line()
          .x(d => state.cs[0].x(d[0]))
          .y(d => state.cs[0].y(d[1]))(plotData)})
      }

    for (let inputInd=0; inputInd<state.originalDims[1]; inputInd++) {
      plotData = []
      state.trainingLatents2[state.trainingStepDisplayIndex][inputInd].forEach((v, i) => plotData.push([xxLatentInputsJS[i], v]))
      state.latentCurves[state.originalDims[0]+inputInd]
        .at({d: d3.line()
          .x(d => state.cs[1].x(d[0]))
          .y(d => state.cs[1].y(d[1]))(plotData)})
      }

    state.currMarkerRMSE.datum(state.trainingError[state.trainingStepDisplayIndex])
      .attr("cx", function(d) { return c.x(d[0]) })
      .attr("cy", function(d) { return c.y(d[1]) })

    state.currMarkerInfo1.datum(state.trainingInfoAllocs1[state.trainingStepDisplayIndex])
      .attr("cx", function(d) { return c.x(d[0]) })
      .attr("cy", function(d) { return c.y2(d[1]) })
    state.currMarkerInfo2.datum(state.trainingInfoAllocs2[state.trainingStepDisplayIndex])
      .attr("cx", function(d) { return c.x(d[0]) })
      .attr("cy", function(d) { return c.y2(d[1]) })
  }
  state.renderAll.varyTrainingStep?.fns.push(drawTrainingStep)
  
  //////////////////////////// Show the latent spaces
  var leftMargin = 20
  var rightMargin = 20
  var topMargin = 40
  var bottomMargin = 40
  var latentHeight = 80
  var latentWidth = 150
  const xxLatentInputs = tf.linspace(-4, 4, 250)
  const xxLatentInputsJS = await xxLatentInputs.array()
  const xxLatentBinWidth = tf.gather(xxLatentInputs, 1).sub(tf.gather(xxLatentInputs, 0))
  let prioryyLatents = tf.exp(xxLatentInputs.square().neg().div(2))
  prioryyLatents = tf.div(prioryyLatents, tf.sum(prioryyLatents).mul(xxLatentBinWidth))
  state.cs = []
  state.latentCurves = []
  state.distinguishabilitySVGs = []
  
  tf.stack([xxLatentInputs, prioryyLatents], -1).array().then(priorData => {
    let latentRepPathSel;
    for (let latentInd=0; latentInd<2; latentInd++) {
      state.cs.push(d3.conventions({
        sel: sel.append('div'),
        width: latentWidth,
        height: latentHeight,
        margin: {left: leftMargin, right: rightMargin, top: topMargin, bottom: bottomMargin}
      }))
      state.cs[latentInd].x.domain([-4, 4])
      state.cs[latentInd].y.domain([0, 1])

      // state.cs[latentInd].yAxis.ticks(isBig ? 5 : 3)
      // d3.drawAxis(state.cs[latentInd])

      // Draw the prior
      state.cs[latentInd].svg.append('path').datum(priorData)
          .at({strokeWidth: 2, stroke: '#aaa', fill: '#ccc'})
          .at({d: d3.line()
            .x(d => state.cs[latentInd].x(d[0]))
            .y(d => state.cs[latentInd].y(d[1]))})

      for (let inputInd=0; inputInd<state.originalDims[latentInd]; inputInd++) {
        state.latentCurves.push(state.cs[latentInd].svg.append('path').datum(priorData)
          .at({strokeWidth: 2, stroke: util.colors.features[inputInd+latentInd*state.originalDims[0]], fill: 'none'})
          .at({d: d3.line()
            .x(d => state.cs[latentInd].x(d[0]))
            .y(d => state.cs[latentInd].y(d[1]))}))
      }
      state.cs[latentInd].svg.append("text")
        .attr("x", (latentWidth / 2))             
        .attr("y", latentHeight+25)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .text(`Town ${latentInd+1}: latent space`);

      //////// And now the distinguishability mats

      distLabels = [state.rowLabels, state.colLabels][latentInd]
      boardSel = sel.append("div")
      .style("flex-direction", "column")
      .style("width", latentWidth)
      .style("overflow", "auto")
      .style("height", latentHeight)

      pdf_margin = {left: 40, right: 20, top: 20, bottom: 40}
      pdfWidth = 100
      state.distinguishabilitySVGs.push(boardSel
      .append("svg")
        .attr("width", pdfWidth + pdf_margin.left + pdf_margin.right)
        .attr("height", pdfWidth + pdf_margin.top + pdf_margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + pdf_margin.left + "," + pdf_margin.top + ")"))

      // Build X scales and axis:
      distSVGX = d3.scaleBand()
        .range([ 0, pdfWidth ])
        // .domain(d3.range(state.boardValues.length))
        .domain(distLabels)
        .padding(0.01)

    state.distinguishabilitySVGs[latentInd].append("g")
        .attr("transform", "translate(0," + -23 + ")")
        .call(d3.axisBottom(distSVGX))
        .selectAll("text")
          .style("text-anchor", "middle")
          .style("font-size", 14)
          .style("font-weight", "bold")
          .style("fill", function(d, i) {
            return util.colors.features[i+state.originalDims[0]*latentInd]
          })

    // Build X scales and axis:
    distSVGY = d3.scaleBand()
      .range([ 0, pdfWidth ])
      // .domain(d3.range(state.boardValues[0].length))
      .domain(distLabels)
      .padding(0.01)

    state.distinguishabilitySVGs[latentInd].append("g")
        .call(d3.axisLeft(distSVGY))
        .selectAll("text")
          // .attr("transform", "translate(-10,-10)rotate(-90)")
          .style("text-anchor", "middle")
          .style("font-size", 14)
          .style("font-weight", "bold")
          .style("fill", function(d, i) {
            return util.colors.features[i+state.originalDims[0]*latentInd]
          })
         
    state.distinguishabilitySVGs[latentInd].selectAll("path,line").remove();

    state.distinguishabilitySVGs[latentInd].selectAll()
        .data([d3zeroedBoardValuesDist1, d3zeroedBoardValuesDist2][latentInd])
        .enter()
        .append("rect")
        .attr("x", function(d) {return distSVGX(d[0]) })
        .attr("y", function(d) { return distSVGY(d[1]) })
        .attr("width", distSVGX.bandwidth() )
        .attr("height", distSVGY.bandwidth() )
        .style("fill", function(d) { return util.distinguishabilityColorMap(d[2])} )

    state.distinguishabilitySVGs[latentInd].append("text")
        .attr("x", (pdfWidth / 2))             
        .attr("y", pdfWidth+25)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .text('Distinguishability');
      }

  })
  
  window.initTrainDIB({
    sel: d3.select('.train-dib-button').html(''),
    state,
  });

  state.renderAll.trainDIB?.fns.push(trainDIB)

  async function trainDIB (){
    state.trainingBoards = []
    state.trainingDistMats1 = []
    state.trainingDistMats2 = []
    state.trainingLatents1 = []
    state.trainingLatents2 = []
    state.trainingInfoAllocs1 = []
    state.trainingInfoAllocs2 = []
    state.trainingError = []

    state.manualOverride = false
    // console.log(tf.memory().numBytes, tf.memory().numTensors, tf.memory().unreliable)

    //////// Set up the networks
    encoders = []
    tensorBoard = tf.tensor2d(state.boardValues).cast('float32')
    const latentDim = 1
    for (let k=0; k<2; k++) {
      encoderInputs = tf.input({shape: [state.originalDims[k]]})
      const zMean = tf.layers.dense({units: latentDim, useBias: false, kernelInitializer: 'glorotNormal'}).apply(encoderInputs)
      const zLogVar = tf.layers.dense({units: latentDim, useBias: false, kernelInitializer: 'glorotNormal'}).apply(encoderInputs)
      const z = new sampleLayer().apply([zMean, zLogVar])
      const encoderOutputs = [zMean, zLogVar, z]
      encoders.push(tf.model({inputs: encoderInputs, outputs: encoderOutputs}))
    }
    
    const intermediateDim = 64
    const combinedEncoderInput = tf.input({shape: [latentDim*2]})
    const x1Linear = tf.layers.dense({units: intermediateDim, useBias: true, kernelInitializer: 'glorotNormal'}).apply(combinedEncoderInput)
    const x1 = tf.layers.leakyReLU().apply(x1Linear)
    const x2Linear = tf.layers.dense({units: intermediateDim, useBias: true, kernelInitializer: 'glorotNormal'}).apply(x1)
    const x2 = tf.layers.leakyReLU().apply(x2Linear)
    const y = tf.layers.dense({units: 1, useBias: true, kernelInitializer: 'glorotNormal'}).apply(x2)
    const decoder = tf.model({inputs: combinedEncoderInput, outputs: y})

    //////// Training step
    beta = tf.variable(betaStart, trainable=false)
    losses = []
    

    maxTotalInfoInDisplay = 2
    maxSingleInfoInDisplay = 1

    errorPathSelRampUp.at({d: line.y(d => c.y(d[1]))(dummyData2)})
    errorPathSelTurnAround.at({d: line.y(d => c.y(d[1]))(dummyData2)})
    state.townInfosRampUp[0]
      .at({d: line.y(d => c.y2(d[1]))(dummyData2)})
    state.townInfosTurnAround[0]
      .at({d: line.y(d => c.y2(d[1]))(dummyData2)})
    state.townInfosRampUp[1]
      .at({d: line.y(d => c.y2(d[1]))(dummyData2)})
    state.townInfosTurnAround[1]
      .at({d: line.y(d => c.y2(d[1]))(dummyData2)})

    optimizer = tf.train.adam(learningRate)

    numberAveragingRepeats = 128
    inds1Exhaustive = tf.tidy(() => {
      return tf.range(0, state.originalDims[0], 1, dtype='float32')
        .expandDims(1).tile([1, state.originalDims[1]]).reshape([-1])
    })
    inds2Exhaustive = tf.tidy(() => {
      return tf.range(0, state.originalDims[1], 1, dtype='float32')
      .expandDims(0).tile([state.originalDims[0], 1]).reshape([-1])
    })

    inps1Exhaustive = tf.tidy(() => {
      return tf.oneHot(tf.range(0, state.originalDims[0], 1, dtype='int32'), state.originalDims[0])
      .expandDims(1).tile([1, state.originalDims[1], 1]).reshape([-1, state.originalDims[0]]).tile([numberAveragingRepeats, 1])
    })
    inps2Exhaustive = tf.tidy(() => {
      return tf.oneHot(tf.range(0, state.originalDims[1], 1, dtype='int32'), state.originalDims[1])
      .expandDims(0).tile([state.originalDims[0], 1, 1]).reshape([-1, state.originalDims[1]]).tile([numberAveragingRepeats, 1])
    })
    tensorBoardTiled = tf.tidy(() => {
      return tensorBoard.expandDims(0).tile([numberAveragingRepeats, 1, 1])
    })

    tensorBoardOneHot = tf.oneHot(tensorBoard.cast('int32'), 2)
    function generateBatch() {
      return tf.tidy(() => {
        const inds1 = tf.randomUniformInt([batchSize], 0, state.originalDims[0])
        const inds2 = tf.randomUniformInt([batchSize], 0, state.originalDims[1])
        const inps1 = tf.oneHot(inds1, state.originalDims[0])
        const inps2 = tf.oneHot(inds2, state.originalDims[1])
        const gatheredBoardValues = tf.gatherND(tensorBoard, tf.stack([inds1, inds2], -1)).reshape([-1, 1])  // for mse
        // gatheredBoardValues = tf.gatherND(tensorBoardOneHot, tf.stack([inds1, inds2], -1)).reshape([-1, 2])  // for xent
        return [inps1, inps2, gatheredBoardValues]
      })
    }
    // console.log(await tf.time(generateBatch))
    let turnAround = false 
    let turnAroundInd
    for (let stepNum = 0; stepNum < state.numberTrainingSteps; stepNum++) {
      // console.time()
      // beta.assign(betas.gather(stepNum))
      const [inps1, inps2, gatheredBoardValues] = generateBatch()
      optimizer.minimize(() => tf.tidy(() => {
        const [zMean1, zLogVar1, z1] = encoders[0].apply(inps1);
        const [zMean2, zLogVar2, z2] = encoders[1].apply(inps2);
        const outputs = decoder.apply(tf.concat([z1, z2], -1));
        const pred = [zMean1, zLogVar1, zMean2, zLogVar2, outputs];
      return combinedLoss(gatheredBoardValues, pred, betas.gather(stepNum))
      }), false); // returnCost: true
      // losses.push(trainLoss)  
      tf.dispose([inps1, inps2, gatheredBoardValues])

      //////// Update the displays
      if (stepNum % state.displayEvery == 0) {
        // console.time()
        await tf.nextFrame();
        // console.log(tf.memory().numBytes, tf.memory().numTensors, tf.memory().unreliable)
        // get the output
        let [zMean1, zLogVar1, zMean2, zLogVar2, outputs] = callModels(encoders[0], encoders[1], decoder)

        outputsShaped = tf.tidy(() => {
          return outputs.reshape([numberAveragingRepeats, state.originalDims[0], state.originalDims[1]])
        })
        rmse = tf.tidy(() => {
          return outputsShaped.sub(tensorBoardTiled).square().mean().sqrt()
        })

        rmse.array().then(val => {
          losses.push(rmse)
        })
        
        boardVals = tf.tidy(() => {
          // return tf.stack([inds1Exhaustive, inds2Exhaustive, outputsShaped.mean(0).reshape([-1])], -1)
          return outputsShaped.mean(0).reshape([-1])
        })
        boardVals.array().then(vals => {
          state.trainingBoards.push(vals)
        })

        // update the latent vecs
        zMean1Scalar = tf.tidy(() => {
          return zMean1.reshape([numberAveragingRepeats, state.originalDims[0], state.originalDims[1]]).mean(0).mean(1)
        })
        zLogVar1Scalar = tf.tidy(() => {
          return zLogVar1.reshape([numberAveragingRepeats, state.originalDims[0], state.originalDims[1]]).mean(0).mean(1)
        })
        zMean2Scalar = tf.tidy(() => {
          return zMean2.reshape([numberAveragingRepeats, state.originalDims[0], state.originalDims[1]]).mean(0).mean(0)
        })
        zLogVar2Scalar = tf.tidy(() => {
          return zLogVar2.reshape([numberAveragingRepeats, state.originalDims[0], state.originalDims[1]]).mean(0).mean(0)
        })

        bhats1 = computeBhatDists(zMean1Scalar, zLogVar1Scalar)
        // bhats1Display = tf.stack([inds1Exhaustive, inds2Exhaustive, bhats1.reshape([-1])], -1)
        bhats1Display = bhats1.reshape([-1, 1])
        bhats1Display.array().then(vals => {
          state.trainingDistMats1.push(vals)
        })
        bhats2 = computeBhatDists(zMean2Scalar, zLogVar2Scalar)
        bhats2Display = bhats2.reshape([-1, 1])
        bhats2Display.array().then(vals => {
          state.trainingDistMats2.push(vals)
        })
        pdfData1 = tf.tidy(() => {
          res = tf.exp(xxLatentInputs.expandDims(0)
            .sub(zMean1Scalar.expandDims(1))
            .div(zLogVar1Scalar.expandDims(1)
              .div(2)
              .exp())
            .square().neg().div(2))
          res = tf.div(res, tf.sum(res, 1, true).mul(xxLatentBinWidth))
          return res
        })

        pdfData1.array().then(vals => {
          state.trainingLatents1.push(vals)
        })
        pmfData1 = tf.tidy(() => {
          return pdfData1.mul(xxLatentBinWidth)
        })
        jointpmf1 = tf.tidy(() => {
          return pmfData1.mean(0, true)
        })

        info1 = tf.tidy(() => {
          return tf.where(pmfData1.greater(1e-6), 
            pmfData1.div(jointpmf1).log(), 
            tf.zerosLike(pmfData1)).mul(pmfData1).sum(1).mean().div(Math.log(2))
        })
        pdfData2 = tf.tidy(() => {
          res = tf.exp(xxLatentInputs.expandDims(0)
            .sub(zMean2Scalar.expandDims(1))
            .div(zLogVar2Scalar.expandDims(1)
              .div(2)
              .exp())
            .square().neg().div(2))
          res = tf.div(res, tf.sum(res, 1, true).mul(xxLatentBinWidth))
          return res
        })

        pdfData2.array().then(vals => {
          state.trainingLatents2.push(vals)
        })

        pmfData2 = tf.tidy(() => {
          return pdfData2.mul(xxLatentBinWidth)
        })
        jointpmf2 = tf.tidy(() => {
          return pmfData2.mean(0, true)
        })

        info2 = tf.tidy(() => {
          return tf.where(pmfData2.greater(1e-6), pmfData2.div(jointpmf2).log(), tf.zerosLike(pmfData2)).mul(pmfData2).sum(1).mean().div(Math.log(2))
        })
        plotVals = tf.tidy(() => {
          return tf.stack([info1, info2, rmse])
        })
        plotVals.array().then(vals => {
          i1 = vals[0]
          i2 = vals[1]
          rmseVal = vals[2]
          totalInfo = i1+i2 
          state.trainingError.push([totalInfo, rmseVal])
          
          if ((state.trainingError.length > 10) && (!turnAround)) {
            lastInfoDiffs = 0
            for (let m=2; m<5; m++) {
              lastInfoDiffs += state.trainingError.slice(-m, -m+1)[0][0]-state.trainingError.slice(-m-1, -m)[0][0]
            }
            if (lastInfoDiffs < 0) {
              turnAroundInd = state.trainingError.length
              turnAround = true
            }
          }

          // update the bounds of the info plane
          maxTotalInfoInDisplay = Math.max(totalInfo, maxTotalInfoInDisplay)
          c.x.domain([0, maxTotalInfoInDisplay])
          c.svg.select('.x.axis').call(c.xAxis)

          maxSingleInfoInDisplay = Math.max(i1, i2, maxSingleInfoInDisplay)
          c.y2.domain([0, maxSingleInfoInDisplay])
          c.svg.select('.y2.axis').call(c.y2Axis)

          state.trainingInfoAllocs1.push([totalInfo, i1])
          state.trainingInfoAllocs2.push([totalInfo, i2])

          if (!turnAround) {
            errorPathSelRampUp.at({d: line.y(d => c.y(d[1]))(state.trainingError)})
            state.townInfosRampUp[0]
              .at({d: line.y(d => c.y2(d[1]))(state.trainingInfoAllocs1)})
            state.townInfosRampUp[1]
              .at({d: line.y(d => c.y2(d[1]))(state.trainingInfoAllocs2)})
              // .style("opacity", function (d) {console.log(d); return d})
          } else {
            errorPathSelRampUp.at({d: line.y(d => c.y(d[1]))(state.trainingError.slice(0, turnAroundInd+1))})
            errorPathSelTurnAround.at({d: line.y(d => c.y(d[1]))(state.trainingError.slice(turnAroundInd))})
            state.townInfosRampUp[0]
              .at({d: line.y(d => c.y2(d[1]))(state.trainingInfoAllocs1.slice(0, turnAroundInd+1))})
            state.townInfosTurnAround[0]
              .at({d: line.y(d => c.y2(d[1]))(state.trainingInfoAllocs1.slice(turnAroundInd))})
            state.townInfosRampUp[1]
              .at({d: line.y(d => c.y2(d[1]))(state.trainingInfoAllocs2.slice(0, turnAroundInd+1))})
            state.townInfosTurnAround[1]
              .at({d: line.y(d => c.y2(d[1]))(state.trainingInfoAllocs2.slice(turnAroundInd))})
          }
          if (!state.manualOverride) {
            state.trainingStepDisplayIndex = state.trainingError.length-1
            state.renderAll.varyTrainingStep()
          }
          
        })
        tf.dispose([
          zMean1, 
          zMean2, 
          zLogVar1, 
          zLogVar2, 
          zMean1Scalar, 
          zMean2Scalar, 
          zLogVar1Scalar, 
          zLogVar2Scalar,
          bhats1,
          bhats1Display,
          bhats2,
          bhats2Display, 
          pdfData1, 
          pdfData2, 
          pmfData1, 
          pmfData2, 
          jointpmf1, 
          jointpmf2, 
          rmse,
          boardVals,
          plotVals,
          outputs,
          outputsShaped,
          info1,
          info2])
        // console.timeEnd()
        // await tf.nextFrame()
        // state.trainingStepDisplayIndex = state.trainingBoards.length-1
        // state.renderAll.varyTrainingStep()
      } 
      

    }
    tf.dispose([
      inps1Exhaustive, 
      inds1Exhaustive, 
      inps2Exhaustive, 
      inds2Exhaustive, 
      tensorBoardTiled,
      optimizer, 
      tensorBoard, 
      ...encoders, 
      decoder, 
      tensorBoardTiled, 
      inps1Exhaustive, 
      inps2Exhaustive, 
      inds1Exhaustive, 
      inds2Exhaustive,
      ])
    console.log(tf.memory().numBytes, tf.memory().numTensors, tf.memory().unreliable)
  }

}

function computeBhatDists(mus, logvars) {
  return tf.tidy(() => {
    N = mus.shape[0]
    embedding_dimension = 1
    mus1 = tf.tile(tf.reshape(mus, [N, 1, 1]), [1, N, 1])
    logvars1 = tf.tile(tf.reshape(logvars, [N, 1, 1]), [1, N, 1])
    mus2 = tf.tile(tf.reshape(mus, [1, N, 1]), [N, 1, 1])
    logvars2 = tf.tile(tf.reshape(logvars, [1, N, 1]), [N, 1, 1])
    difference_mus = mus1.sub(mus2)
    difference_mus = tf.expandDims(difference_mus, -1)
    difference_mus_T = tf.transpose(difference_mus, [0, 1, 3, 2])

    sigma_diag = (tf.exp(logvars1).add(tf.exp(logvars2))).mul(0.5)
    sigma_mat = tf.expandDims(sigma_diag, -1)
      .mul(tf.expandDims(tf.onesLike(sigma_diag), -2))
        .mul(tf.reshape(tf.eye(embedding_dimension), [1, 1, embedding_dimension, embedding_dimension]))
    sigma_mat_inv = tf.expandDims(tf.onesLike(sigma_diag).div(sigma_diag), -1)
    .mul(tf.expandDims(tf.onesLike(sigma_diag), -2))
    .mul(tf.reshape(tf.eye(embedding_dimension), [1, 1, embedding_dimension, embedding_dimension]))

    determinant_sigma = tf.prod(sigma_diag, -1)
    determinant_sigma1 = tf.exp(tf.sum(logvars1, -1))
    determinant_sigma2 = tf.exp(tf.sum(logvars2, -1))
    term1 = tf.reshape(difference_mus_T.matMul(sigma_mat_inv).matMul(difference_mus), [N, N]).mul(0.125)
    term2 = tf.log(determinant_sigma.div(tf.sqrt(determinant_sigma1.mul(determinant_sigma2)))).mul(0.5)
    return tf.exp(term1.add(term2).neg())
  })
}

function callModels(enc1, enc2, dec) {
  return tf.tidy(() => {
    [zMean1, zLogVar1, z1] = enc1.apply(inps1Exhaustive);
    [zMean2, zLogVar2, z2] = enc2.apply(inps2Exhaustive);
    outputs = dec.apply(tf.concat([z1, z2], -1))
    // outputs = dec.apply(tf.concat([zMean1, zMean2], -1));
    return [zMean1, zLogVar1, zMean2, zLogVar2, outputs]
  })
}

// tyvm https://github.com/songer1993/tfjs-vae/blob/master/vanilla-vae/model.js
class sampleLayer extends tf.layers.Layer {
  constructor(args) {
    super({})
  }

  computeOutputShape(inputShape) {
    return inputShape[0];
  }

  call(inputs, kwargs) {
    return tf.tidy(() => {
      const [zMean, zLogVar] = inputs;
      const batch = zMean.shape[0];
      const dim = zMean.shape[1];
      const epsilon = tf.randomNormal([batch, dim]);
      const half = tf.scalar(0.5);
      const temp = zLogVar.mul(half).exp().mul(epsilon);
      const sample = zMean.add(temp);
      return sample;
    });
  }

  getClassName() {
    return 'sampleLayer';
  }
}

function reconstructionLoss(yTrue, yPred) {
  return tf.tidy(() => {
    let reconstruction_loss;
    reconstruction_loss = tf.losses.meanSquaredError(yTrue, yPred)
    // yPred = tf.concat([yPred, tf.zerosLike(yPred)], -1)
    // reconstruction_loss = tf.losses.softmaxCrossEntropy(yTrue, yPred)
    // reconstruction_loss = reconstruction_loss.mul(tf.scalar(yPred.shape[1]));
    return reconstruction_loss;
  });
}

function klLoss(zMean, zLogVar) {
  return tf.tidy(() => {
    let klLoss;
    klLoss = tf.scalar(1).add(zLogVar).sub(zMean.square()).sub(zLogVar.exp());
    klLoss = tf.sum(klLoss, -1);
    klLoss = klLoss.mul(tf.scalar(-0.5));
    klLoss = tf.mean(klLoss)
    return klLoss;
  });
}

function combinedLoss(yTrue, yPred, beta) {
  return tf.tidy(() => {
    const [zMean1, zLogVar1, zMean2, zLogVar2, y] = yPred  
    const reconstruction_loss = reconstructionLoss(yTrue, y)
    const klLoss1 = klLoss(zMean1, zLogVar1).mul(beta)
    const klLoss2 = klLoss(zMean2, zLogVar2).mul(beta)
    const totalLoss = tf.mean(reconstruction_loss.add(klLoss1).add(klLoss2))
    return totalLoss
  });
}