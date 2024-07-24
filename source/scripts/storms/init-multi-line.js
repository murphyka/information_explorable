
window.initInfoTelegraph = async function({selHeatmap, selRow, state, isBig=true}){
  sels = [selHeatmap, selRow]

  // Plot the frame
  var leftMargin = 50
  var rightMargin = 50
  var topMargin = 25 
  var bottomMargin = 50
  var actualHeight = isBig ? 200 : 30
  var actualWidth = isBig ? 350 : 50

  state.p00 = 0.1
  state.p01 = 0.2
  state.p10 = 0.3
  state.p11 = 0.9

  pdf_data = [
  {A: "calm", B: "calm", value: state.p00}, 
  {A: "stormy", B: "calm", value: state.p10}, 
  {A: "calm", B: "stormy", value: state.p01}, 
  {A: "stormy", B: "stormy", value: state.p11}, 
  ]

  // Labels of row and columns
  var rowLabels = ["calm", "stormy"]
  var colLabels = ["calm", "stormy"]
  state.pdf_svgs = []
  state.pdfxs = []
  state.pdfys = []
  state.valuesText = []
  for (let j=0; j<2; j++) {
    sels[j].append("p").style("align-items", "center")

    pdf_margin = {left: 35, right: rightMargin, top: 30, bottom: bottomMargin}
    pdfWidth = 100
    state.pdf_svgs.push(sels[j]
    .append("svg")
      .attr("width", pdfWidth + pdf_margin.left + pdf_margin.right)
      .attr("height", pdfWidth + pdf_margin.top + pdf_margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + pdf_margin.left + "," + pdf_margin.top + ")"))

    // Build X scales and axis:
    state.pdfxs.push(d3.scaleBand()
      .range([ 0, pdfWidth ])
      .domain(rowLabels)
      .padding(0.01))
    state.pdf_svgs[j].append("g")
      .attr("transform", "translate(0," + -23 + ")")
      .call(d3.axisBottom(state.pdfxs[j]))
      .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", 14)

    pdfxOffset = 40
    pdfyOffset = -23
    state.pdf_svgs[j].append('g')
        .translate([pdfWidth/2, -19])
        .append('text.axis-label')
        .text('Town 1')
        .at({textAnchor: 'middle', fill: '#000'})

    state.pdf_svgs[j]
        .append('g')
        .translate([pdfyOffset, pdfWidth/2])
        .append('text.axis-label')
        .text('Town 2')
        .at({textAnchor: 'middle', fill: '#000', transform: 'rotate(-90)'})

    state.pdf_svgs[j].append('g')
        .translate([pdfWidth/2, pdfWidth+30])
        .append('text.axis-label')
        .text('p(stormy|x1,x2)')
        .at({textAnchor: 'middle', fill: '#000', 'font-size': 18}) //, 'font-weight': 'bold'})

    // Build X scales and axis:
    state.pdfys.push(d3.scaleBand()
      .range([0, pdfWidth ])
      .domain(colLabels)
      .padding(0.01))
    state.pdf_svgs[j].append("g")
      .call(d3.axisLeft(state.pdfys[j]))
      .selectAll("text")
        .attr("transform", "translate(-10,-25)rotate(-90)")
        .style("text-anchor", "end")
        .style("font-size", 14)  

    state.pdf_svgs[j].selectAll("path,line").remove()

    // Build color scale
    var heatmapColor = d3.scaleLinear()
      .range(["white", "#69b3a2"])
      .domain([0,1])


    state.pdf_svgs[j].selectAll()
        .data(pdf_data)
        .enter()
        .append("rect")
        .attr("x", function(d) { return state.pdfxs[j](d.A) })
        .attr("y", function(d) { return state.pdfys[j](d.B) })
        .attr("width", state.pdfxs[j].bandwidth() )
        .attr("height", state.pdfys[j].bandwidth() )
        // .attr("opacity", 0.5)
        .style("fill", function(d) { return heatmapColor(d.value)} )

        
    state.valuesText.push(state.pdf_svgs[j].selectAll(".valuesText")
    .data(pdf_data)
    .enter()
    .append("text"))

    state.valuesText[j].attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("x", function(d, i){ return state.pdfxs[j](d.A)+pdfWidth/4})
        .attr("y", function(d, i){ return state.pdfys[j](d.B)+pdfWidth/4})
        .text(function(d){ return parseFloat(d.value).toFixed(2)})
        .attr("class", "parentText");
    // cards.select("title").text((d) => d.value);
  }



  var c = d3.conventions({
    sel: selRow.append('div'),
    width: actualWidth,
    height: actualHeight,
    margin: {left: leftMargin, right: rightMargin, top: topMargin, bottom: bottomMargin}
  })
  c.x.domain([0, 2])
  c.y.domain([0, 0.5])  

  c.y2 = d3.scaleLinear().domain([0, 1.0]).range([c.height, 0])
  c.y2Axis = d3.axisRight(c.y2).ticks(isBig ? 5 : 3)
  c.svg.append("g") 
        .attr("class", "y2 axis")
        .attr("transform", `translate(${actualWidth},0)`)
        .attr("visibility", "hidden") 
        .call(c.y2Axis) 

  c.yAxis.ticks(isBig ? 5 : 3)
  c.svg.attr({"float": "left"})
  d3.drawAxis(c)

  bars_margin = {left: 35, right: rightMargin, top: topMargin, bottom: bottomMargin}
  bars_width = 100
  var bars_svg = selRow
  .append("svg")
    .attr("width", bars_width + bars_margin.left + bars_margin.right)
    .attr("height", actualHeight + bars_margin.top + bars_margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + bars_margin.left + "," + bars_margin.top + ")");

  state.barx = d3.scaleBand()
  .range([ 0, bars_width ])
  .domain(['town1', 'town2'])
  .padding(0.2);

  bars_svg.append("g")
    .attr("transform", "translate(0," + actualHeight + ")")
    .call(d3.axisBottom(state.barx))
    .selectAll("text")
      .attr("transform", "translate(0,0)rotate(0)")
      .style("text-anchor", "middle")
      .style("font-size", 14)

  // Add Y axis
  state.bary = d3.scaleLinear()
    .domain([0, 1])
    .range([ actualHeight, 0]);
  bars_svg.append("g")
    .call(d3.axisLeft(state.bary));

  // Bars
  barkeys = ['town1', 'town2']
  dummyData = [0.5, 0.75]
  state.bars = bars_svg.selectAll("mybar")
    .data(dummyData)
    .enter()
    .append("rect")
      .attr("x", function(d, i) { return state.barx(barkeys[i]); })
      .attr("y", function(d, i) { return state.bary(d); })
      .attr("width", state.barx.bandwidth())
      .attr("height", function(d, i) { return actualHeight - state.bary(d); })
      .attr("fill", function(d, i) {return util.colors.bars[i];})

  c.svg.select('.y').lower()  // z order

  util.addAxisLabel(c, 'Total information from other towns (bits)', 'X-entropy error, your town (bits)', y2Text='Information per town (bits)', xOffset=45, yOffset=-40)

  

  const numberSampleCompressions = 20
  dummyData = Array(numberSampleCompressions**2).fill(Array(2).fill(0))

  state.pointHighlighter = Math.floor(Math.random() * numberSampleCompressions * numberSampleCompressions)

  let baseRadius = 5
  dots = c.svg.append('g')
    .selectAll("dot")
    .data(dummyData)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return c.x(d[0]); } )
      .attr("cy", function (d) { return c.y(d[1]); } )
      .attr("r", baseRadius)
      .attr("opacity", 0.3)
      .attr("fill", "#69b3a2")
      .on('mouseover', function (d, i) {
        state.pointHighlighter = i;
        state.renderAll.pointHighlighter();
      })

  state.dots = dots

  var p_xy_channeled = tf.tensor([
      [state.p00, state.p01],
      [state.p10, state.p11]])

  p_xy_channeled = tf.tidy(() => {
    return tf.stack([tf.sub(tf.ones([2, 2]), p_xy_channeled), p_xy_channeled], -1)
  })

  p_xy_channeledNormalized = tf.tidy(() => {
    return tf.div(p_xy_channeled, tf.sum(p_xy_channeled))
  })

  var p_xy = tf.reshape(p_xy_channeled, [-1, 2])

  var p_y = tf.sum(p_xy, axis=0)
  var ent_y = tf.tidy(() => {
    return tf.div(tf.sum(tf.mul(tf.neg(p_y), tf.log(p_y))), tf.log(2))
  })
  noise_vals = [1, 0.577, 0.452, 0.371, 0.310, 0.262, 0.222, 0.189, 0.160, 0.135, 0.113, 0.093, 0.076, 0.061, 0.047, 0.034, 0.0235, 0.0140, 0.006, 1e-8]
  info_vals = [0, 0.053, 0.105, 0.158, 0.211, 0.263, 0.316, 0.368, 0.421, 0.474, 0.526, 0.579, 0.632, 0.684, 0.737, 0.789, 0.842, 0.895, 0.947, 1]
  noise_vectors = tf.reshape(tf.stack(tf.meshgrid(noise_vals, noise_vals,  {'indexing': 'ij'}), -1), [-1, 2])
  info_vectors = tf.reshape(tf.stack(tf.meshgrid(info_vals, info_vals, {'indexing': 'ij'}), -1), [-1, 2])
  info_ins_full = tf.sum(info_vectors, axis=1)

  state.info_ins_all = await info_vectors.array()

  state.renderAll.pointHighlighter?.fns.push(() => {
    state.bars.data(state.info_ins_all[state.pointHighlighter])
    state.bars
    .attr("x", function(d, i) { return state.barx(barkeys[i]); })
    .attr("y", function(d, i) { return state.bary(d); })
    .attr("height", function(d, i) { return actualHeight - state.bary(d); })

    state.dots.attr("opacity", function(d, i) { return (i==state.pointHighlighter) ? 1 : 0.3})
    state.dots.attr("fill", function(d, i) { return (i==state.pointHighlighter) ? "#000" : "#69b3a2"})
  })

  state.renderAll.pointHighlighter();
  
  state.c = c
  state.max_slider_value = 1
  state.min_slider_value = 0
  state.slider_step_size = 0.05

  window.initProbabilitySliders({
    sel: d3.select('.storm-probability-sliders').html(''),
    state,
    hasColor: false,
    
  });
  window.initProbabilityButtons({
    sel: d3.select('#buttons1').html(''),
    state,
    columnIndex: 1,
  });
  window.initProbabilityButtons({
    sel: d3.select('#buttons2').html(''),
    state,
    columnIndex: 2,
  });
  paretoDisplayCheckbox = d3.select('.switch').select('input[type="checkbox"]')
  paretoDisplayCheckbox.on("click", function() {
    c.svg.select('.y2.axis').attr("visibility", this.checked ? "visible" : "hidden")
    paretoPathSel.attr("visibility", this.checked ? "visible" : "hidden")
    paretoPathSel0.attr("visibility", this.checked ? "visible" : "hidden")
    paretoPathSel1.attr("visibility", this.checked ? "visible" : "hidden")
  })

  const numberParetoPoints = 20
  dummyData2 = Array(numberParetoPoints).fill(Array(2).fill(0)) 
  var line = d3.line().x(d => c.x(d[0])) 
  var paretoPathSel = c.svg.append('path')
    .at({strokeWidth: 2, stroke: "#000", fill: 'none'})
  var paretoPathSel0 = c.svg.append('path')
    .at({strokeWidth: 2, stroke: util.colors.features[0], fill: 'none'})
  var paretoPathSel1 = c.svg.append('path')
    .at({strokeWidth: 2, stroke: util.colors.features[1], fill: 'none'})

      
  paretoPathSel.at({d: line.y(d => c.y(d[1]))(dummyData2)}).at("visibility", "hidden")
  paretoPathSel0.at({d: line.y(d => c.y2(d[1]))(dummyData2)}).at("visibility", "hidden")
  paretoPathSel1.at({d: line.y(d => c.y2(d[1]))(dummyData2)}).at("visibility", "hidden")
  state.pareto = paretoPathSel
  state.pareto0 = paretoPathSel0
  state.pareto1 = paretoPathSel1

  state.renderAll.modJoint.fns.push(drawTelegraphPlane)
  state.renderAll.modJoint()
  async function drawTelegraphPlane (){

    await tf.nextFrame()
    var p_xy_channeled = tf.tensor([
      [state.p00, state.p01],
      [state.p10, state.p11]])

    pdf_data = [
    {A: "calm", B: "calm", value: state.p00}, 
    {A: "stormy", B: "calm", value: state.p10}, 
    {A: "calm", B: "stormy", value: state.p01}, 
    {A: "stormy", B: "stormy", value: state.p11}, 
    ]
    for (let i = 0; i < 2; i++) {
      state.pdf_svgs[i].selectAll("rect")
        .data(pdf_data)
        .style("fill", function(d) { return heatmapColor(d.value)} )
      state.valuesText[i]
      .data(pdf_data)
      .text(function(d){ return parseFloat(d.value).toFixed(2)})
    }
    p_xy_channeled = tf.tidy(() => {
      return tf.stack([tf.sub(tf.ones([2, 2]), p_xy_channeled), p_xy_channeled], -1)
    })

    p_xy_channeled = tf.tidy(() => {
      return tf.div(p_xy_channeled, tf.sum(p_xy_channeled))
    })

    p_xy = tf.reshape(p_xy_channeled, [-1, 2])

    p_y = tf.sum(p_xy, axis=0)
    ent_y = tf.tidy(() => {
      return tf.div(tf.sum(tf.mul(tf.neg(p_y), tf.log(p_y))), tf.log(2))
    })
    noise_vectors = tf.tidy(() => {
      return tf.reshape(tf.stack(tf.meshgrid(noise_vals, noise_vals,  {'indexing': 'ij'}), -1), [-1, 2])
    })
    info_vectors = tf.tidy(() => {
      return tf.reshape(tf.stack(tf.meshgrid(info_vals, info_vals, {'indexing': 'ij'}), -1), [-1, 2])
    })
    info_ins_full = tf.sum(info_vectors, axis=1)

    // state.info_ins_all = await info_vectors.array()
    info_vectors.array().then(vals => {
      state.info_ins_all = vals
    })

    p_ui_cond_xi = tf.tidy(() => {
      return tf.concat([
        tf.concat([tf.ones([numberSampleCompressions**2, 2, 1, 1]), tf.reshape(noise_vectors, [numberSampleCompressions**2, 2, 1, 1])], -1),
        tf.concat([tf.reshape(noise_vectors, [numberSampleCompressions**2, 2, 1, 1]), tf.ones([numberSampleCompressions**2, 2, 1, 1])], -1)
      ], -2)  // 400, 2, 2, 2  ==>  400, channel, u, x
    })
    p_ui_cond_xi = tf.tidy(() => {
      return tf.div(p_ui_cond_xi, tf.sum(p_ui_cond_xi, axis=-2, keepdims=true))
    })
    reshape_channels = [1, 1, 1, 2, 2, 2]
    tile_channels = [numberSampleCompressions**2, 2, 2, 1, 1, 1]
    p_uxy = tf.tidy(() => {
      return tf.tile(tf.reshape(p_xy_channeled, reshape_channels), tile_channels)  // 400, 2, 2, 2, 2, 2  ==> 400, u1, u2, x1, x2, y
    })
    for (let channel_id = 0; channel_id < 2; channel_id++) {
      reshape_channels = [numberSampleCompressions**2, 1, 1, 1, 1, 1]
      reshape_channels[channel_id+1] = 2
      reshape_channels[channel_id+3] = 2

      tile_channels = [1, 2, 2, 2, 2, 2]
      tile_channels[channel_id+1] = 1
      tile_channels[channel_id+3] = 1

      p_uxy = tf.tidy(() => {
        return tf.mul(p_uxy, tf.tile(tf.reshape(tf.gather(p_ui_cond_xi, channel_id, axis=1), reshape_channels), tile_channels))
      })
    }
    p_uy = tf.sum(p_uxy, axis=[3, 4])
    p_ux = tf.sum(p_uxy, axis=-1)

    p_u = tf.sum(p_ux, axis=[3, 4])
    p_u_p_y = tf.tidy(() => {
      return tf.mul(
      tf.tile(tf.reshape(p_u, [numberSampleCompressions**2, 2, 2, 1]), [1, 1, 1, 2]), 
      tf.tile(tf.reshape(p_y, [1, 1, 1, 2]), [numberSampleCompressions**2, 2, 2, 1]))
    })

    ent_pupy = tf.tidy(() => {
      return tf.sum(tf.mul(tf.neg(p_u_p_y), tf.where(tf.greater(p_u_p_y, 0), tf.log(p_u_p_y), 0)), axis=[1, 2, 3])
    })
    ent_puy = tf.tidy(() => {
      return tf.sum(tf.mul(tf.neg(p_uy), tf.where(tf.greater(p_uy, 0), tf.log(p_uy), 0)), axis=[1, 2, 3])
    })
    info_y_u = tf.tidy(() => {
      return tf.div(tf.sub(ent_pupy, ent_puy), tf.log(2))
    })
    
    error_outs_all = ent_y.sub(info_y_u)
    // infoPlaneData = await tf.stack([info_ins_full, error_outs_all], 1).array()
    
    // min_error = await tf.min(error_outs_all).array()
    // ent_y_out = await ent_y.array()
    combinedVals = tf.stack([tf.min(error_outs_all), ent_y])
    combinedVals.array().then(vals => {
      min_error = vals[0]
      ent_y_out = vals[1]
      state.c.y.domain([min_error*0.97, ent_y_out*1.03])
      state.c.svg.select('.y.axis').call(c.yAxis)
      
    })
    infoPlaneData = tf.stack([info_ins_full, error_outs_all], 1)
    infoPlaneData.array().then(vals => {
      state.dots.data(vals)
      state.dots
      .attr("cx", function(d) {return c.x(d[0])})
      .attr("cy", function(d) {return c.y(d[1])})
    })


    unique_info_vals = tf.linspace(0, 2, numberParetoPoints)
    min_vals = []
    min_error_allocs = []
    for (let i=0; i<numberParetoPoints; i++) {
      matching_template = tf.tidy(() => {
        return tf.where(tf.less(tf.abs(tf.sub(tf.sum(info_vectors, axis=1),tf.gather(unique_info_vals, i))), tf.tensor(0.03)), error_outs_all, tf.onesLike(error_outs_all).mul(10))
      })
      min_val = tf.min(matching_template)
      min_ind = tf.argMin(matching_template)
      min_vals.push(min_val)
      min_error_allocs.push(tf.gather(info_vectors, min_ind))
      tf.dispose([matching_template, min_ind])
    }

    min_vals = tf.stack(min_vals)
    min_error_allocs = tf.stack(min_error_allocs)

    together = tf.tidy(() => {
      return tf.concat([tf.stack([unique_info_vals, min_vals], 1), min_error_allocs], 1)
    })
    together.array().then(together => {
      state.pareto
        .at({d: line.y(d => state.c.y(d[1]))(together)})
      state.pareto0
        .at({d: line.y(d => state.c.y2(d[2]))(together)})
      state.pareto1
        .at({d: line.y(d => state.c.y2(d[3]))(together)})
    })

  tf.dispose([
    together,
    min_error_allocs,
    min_vals,
    unique_info_vals,
    matching_template,
    infoPlaneData,
    combinedVals,
    error_outs_all,
    info_y_u,
    ent_puy,
    ent_pupy,
    p_u_p_y,
    p_u,
    p_uy,
    p_ux,
    p_uxy,
    p_ui_cond_xi,
    info_ins_full,
    info_vectors,
    noise_vectors,
    ent_y,
    p_y,
    p_xy,
    p_xy_channeled,
    p_xy_channeledNormalized,
    ])
  console.log(tf.memory().numBytes, tf.memory().numTensors, tf.memory().unreliable)

  }

}
