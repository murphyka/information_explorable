
window.initInfoTelegraphSingle = async function({sel, state, isBig=true}){
  sel.append("p")
  // Plot the frame
  var leftMargin = 50
  var rightMargin = 50 
  var topMargin = 25 
  var bottomMargin = 50
  var actualHeight = isBig ? 250 : 30
  var actualWidth = isBig ? 350 : 50
  var c = d3.conventions({
    sel: sel.append('div'),
    width: actualWidth,
    height: actualHeight,
    margin: {left: leftMargin, right: rightMargin, top: topMargin, bottom: bottomMargin}
  })

  const voltageRange = 5
  c.x.domain([-voltageRange, voltageRange])
  c.y.domain([0, 0.5])  

  c.yAxis.ticks(isBig ? 5 : 3)
  c.svg.attr({"float": "left"})
  d3.drawAxis(c)

  util.addAxisLabel(c, 'Message received, u (volts)', 'P(u)')


  state.noise = 1.

  const outputVoltages = tf.linspace(-voltageRange, voltageRange, 250)
  const binWidth = tf.gather(outputVoltages, 1).sub(tf.gather(outputVoltages, 0))
  var noiseTF = tf.tensor(state.noise)
  const rootTwoPi = tf.tensor(2*Math.PI).sqrt()
  // Really, plot the conditional dists divided by 2, so they add to the displayed joint
  var pdfData = tf.exp(outputVoltages.sub(1).div(noiseTF).square().neg().div(2)).div(noiseTF).div(rootTwoPi).div(2)

  var bothpdf = pdfData.add(tf.reverse(pdfData))

  var info = tf.sum(bothpdf.mul(binWidth).mul(tf.where(tf.greater(bothpdf, 0), tf.log(bothpdf), 0)))
  info = info.sub(tf.sum(pdfData.mul(binWidth).mul(2).mul(tf.where(tf.greater(pdfData, 0), tf.log(pdfData.mul(2)), 0))))
  info = tf.neg(info).div(tf.log(2))
  state.transmittedInfo = await info.array()

  state.max_slider_value = 5
  state.min_slider_value = 0.2
  state.slider_step_size = 0.05

  state.renderAll.modNoise.fns.push(drawMessagePlane)

  window.initNoiseSlider({
    sel: d3.select('.transmission-noise-slider').html(''),
    state,
    hasColor: false,
  });

  

  var plotData1 = await tf.stack([outputVoltages, pdfData], 1).array()

  var plotData2 = await tf.stack([outputVoltages.neg(), pdfData], 1).array()
  var plotDataBoth = await tf.stack([outputVoltages.neg(), bothpdf], 1).array()

  var line = d3.line().x(d => c.x(d[0]))

  // Create the data curves
  var ProbabilityPath1 = c.svg.append('path')
    .at({strokeWidth: 2, stroke: util.colors.distortion, fill: '#d7191c', opacity: 0.2})
    .at({d: line.y(d => c.y(d[1]))(plotData1)})


  var ProbabilityPath2 = c.svg.append('path')
    .at({strokeWidth: 2, stroke: util.colors.distortion, fill: '#2c7bb6', opacity: 0.2})
    .at({d: line.y(d => c.y(d[1]))(plotData2)})


  var ProbabilityPathBoth = c.svg.append('path')
    .at({strokeWidth: 2, stroke: util.colors.distortion, fill: 'none'})
    .at({d: line.y(d => c.y(d[1]))(plotDataBoth)})

  //////////// Bars
  bars_margin = {left: leftMargin, right: rightMargin, top: topMargin, bottom: bottomMargin}
  bars_width = 100
  var bars_svg = sel
  .append("svg")
    .attr("width", bars_width + bars_margin.left + bars_margin.right)
    .attr("height", actualHeight + bars_margin.top + bars_margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + bars_margin.left + "," + bars_margin.top + ")");

  var barx = d3.scaleBand()
  .range([ 0, bars_width ])
  .domain(['Transmitted info'])
  .padding(0.2);

  bars_svg.append("g")
    .attr("transform", "translate(0," + actualHeight + ")")
    .call(d3.axisBottom(barx))
    .selectAll("text")
      .attr("transform", "translate(0,0)rotate(0)")
      .style("text-anchor", "middle")
      .style("font-size", 14)

  // Add Y axis
  var bary = d3.scaleLinear()
    .domain([0, 1])
    .range([ actualHeight, 0]);
  bars_svg.append("g")
    .call(d3.axisLeft(bary));

  // Bars
  barkey = ['Transmitted info']
  infoVal = [state.transmittedInfo]
  bars = bars_svg.selectAll("mybar")
    .data(infoVal)
    .enter()
    .append("rect")
      .attr("x", function(d, i) { return barx(barkey[i]); })
      .attr("y", function(d, i) { return bary(d); })
      .attr("width", barx.bandwidth())
      .attr("height", function(d, i) { return actualHeight - bary(d); })
      .attr("fill", function(d, i) {return util.colors.bars[i];})

  state.renderAll.modNoise()
  async function drawMessagePlane (){
    noiseTF = tf.tensor(state.noise)
    pdfData = tf.exp(outputVoltages.sub(1).div(noiseTF).square().neg().div(2)).div(noiseTF).div(rootTwoPi).div(2)
    // pdfData = tf.div(pdfData, tf.sum(pdfData.mul(binWidth))).div(2)
    bothpdf = pdfData.add(tf.reverse(pdfData))

    tf.max(bothpdf).array().then(maxVal => {
      c.y.domain([0, maxVal*1.03])
      c.svg.select('.y.axis').call(c.yAxis)
    })

    tf.stack([outputVoltages, pdfData], 1).array().then(plotData1 => {
      plotData1 = [[-voltageRange, 0], ...plotData1, [voltageRange, 0]]  // to force the fill to the corners of the plot
      ProbabilityPath1.at({d: line.y(d => c.y(d[1]))(plotData1)})
    })
    tf.stack([outputVoltages.neg(), pdfData], 1).array().then(plotData2 => {
      plotData2 = [[voltageRange, 0], ...plotData2, [-voltageRange, 0]]
      ProbabilityPath2.at({d: line.y(d => c.y(d[1]))(plotData2)})  
    })

    tf.stack([outputVoltages.neg(), bothpdf], 1).array().then(plotDataBoth => {
      ProbabilityPathBoth.at({d: line.y(d => c.y(d[1]))(plotDataBoth)})
    })

    info = tf.sum(bothpdf.mul(binWidth).mul(tf.where(tf.greater(bothpdf, 0), tf.log(bothpdf), 0)))
    info = info.sub(tf.sum(pdfData.mul(2).mul(binWidth).mul(tf.where(tf.greater(pdfData, 0), tf.log(pdfData.mul(2)), 0))))
    tf.neg(info).div(tf.log(2)).array().then(val => {
      state.transmittedInfo = val
      d3.select('val2').text(parseFloat(state.transmittedInfo).toFixed(2))
      bars.data([val])
      bars
      .attr("x", function(d, i) { return barx(barkey[i]); })
      .attr("y", function(d, i) { return bary(d); })
      .attr("height", function(d, i) { return actualHeight - bary(d); })
    })
    
  }

}

