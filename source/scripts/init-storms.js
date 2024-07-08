
window.initInfoTelegraph = async function({sel, state, isBig=true}){
  state.renderAll = util.initRenderAll(['step', 'input', 'dim', 'pointHighlighter']);

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
  c.x.domain([0, 2])
  c.y.domain([0, 0.5])  

  c.yAxis.ticks(isBig ? 5 : 3)
  c.svg.attr({"float": "left"})
  d3.drawAxis(c)
  state.pointHighlighter = -1

  state.renderAll.pointHighlighter?.fns.push(() => {
    bars.data(state.info_ins_all[state.pointHighlighter])
    bars
    .attr("x", function(d, i) { return barx(barkeys[i]); })
    .attr("y", function(d, i) { return bary(d); })
    .attr("height", function(d, i) { return actualHeight - bary(d); })
    })

  // c.svg.on('mouseleave', () => {state.pointHighlighter = -1; state.renderAll.pointHighlighter() })


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
  .domain(['townA', 'townB'])
  .padding(0.2);

  bars_svg.append("g")
    .attr("transform", "translate(0," + actualHeight + ")")
    .call(d3.axisBottom(barx))
    .selectAll("text")
      .attr("transform", "translate(15,0)rotate(0)")
      .style("text-anchor", "end");

  // Add Y axis
  var bary = d3.scaleLinear()
    .domain([0, 1])
    .range([ actualHeight, 0]);
  bars_svg.append("g")
    .call(d3.axisLeft(bary));

  // Bars
  barkeys = ['townA', 'townB']
  dummyData = [0.5, 0.75]
  bars = bars_svg.selectAll("mybar")
    .data(dummyData)
    .enter()
    .append("rect")
      .attr("x", function(d, i) { console.log(i); return barx(barkeys[i]); })
      .attr("y", function(d, i) { console.log(d); return bary(d); })
      .attr("width", barx.bandwidth())
      .attr("height", function(d, i) { return actualHeight - bary(d); })
      .attr("fill", function(d, i) {return util.colors.bars[i];})

  // const yAxis = d3.svg.axis()
  //       .scale(yScale)
  //       .orient('left')
  //       .ticks()
  c.svg.select('.y').lower()  // z order
  // util.ggPlot(c)  // just makes a gray background and puts grid lines

  // c.svg.append('text.chart-title').at({y: -7, fontSize: 12, textAnchor: 'middle', x: c.width/2})
  //   .text('Information plane')

  util.addAxisLabel(c, 'Total information from other towns (bits)', 'Information about your town (bits)')

  state.max_slider_value = 1
  state.min_slider_value = 0
  state.slider_step_size = 0.05

  state.p00 = 1
  state.p01 = 0.
  state.p10 = 1
  state.p11 = 0.9

  window.initTransmissionSliders({
    sel: d3.select('.storm-transmission-sliders').html(''),
    state,
    hasColor: false,
  });

  window.initProbabilitySliders({
    sel: d3.select('.storm-probability-sliders').html(''),
    state,
    hasColor: false,
  });

  dummyData = []
  for (let i=0; i<400; i++) {
      dummyData.push([0, 0])
  }
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
      .style("fill", "#69b3a2")
      .on('mouseover', function (d, i) {
        state.pointHighlighter = i;
        d3.select(this).transition().duration(100)
        .style("r", 5)
        .style("fill", "#000")
        .style("opacity", 1)
        state.renderAll.pointHighlighter();
      })
      .on('mouseout', function (d, i) {
        state.pointHighlighter = -1;
        d3.select(this).transition().duration(100)
        .style("r", baseRadius)
        .style("fill", "#69b3a2")
        .style("opacity", 0.3)
      })

  state.renderAll.input.fns.push(drawTelegraphPlane)
  state.renderAll.input()
  async function drawTelegraphPlane (){
    var p_xy_channeled = tf.tensor([
      [state.p00, state.p01],
      [state.p10, state.p11]])

    p_xy_channeled = tf.stack([tf.sub(tf.ones([2, 2]), p_xy_channeled), p_xy_channeled], -1)

    p_xy_channeled = tf.div(p_xy_channeled, tf.sum(p_xy_channeled))

    var p_xy = tf.reshape(p_xy_channeled, [-1, 2])

    var p_y = tf.sum(p_xy, axis=0)
    var ent_y = tf.div(tf.sum(tf.mul(tf.neg(p_y), tf.log(p_y))), tf.log(2))


    noise_vals = [1, 0.577, 0.452, 0.371, 0.310, 0.262, 0.222, 0.189, 0.160, 0.135, 0.113, 0.093, 0.076, 0.061, 0.047, 0.034, 0.0235, 0.0140, 0.006, 1e-8]
    info_vals = [0, 0.053, 0.105, 0.158, 0.211, 0.263, 0.316, 0.368, 0.421, 0.474, 0.526, 0.579, 0.632, 0.684, 0.737, 0.789, 0.842, 0.895, 0.947, 1]
    noise_vectors = tf.reshape(tf.stack(tf.meshgrid(noise_vals, noise_vals,  {'indexing': 'ij'}), -1), [-1, 2])
    info_vectors = tf.reshape(tf.stack(tf.meshgrid(info_vals, info_vals, {'indexing': 'ij'}), -1), [-1, 2])
    info_ins_all = await (tf.sum(info_vectors, axis=1).array())

    state.info_ins_all = await info_vectors.array()

    p_ui_cond_xi = tf.concat([
      tf.concat([tf.ones([400, 2, 1, 1]), tf.reshape(noise_vectors, [400, 2, 1, 1])], -1),
      tf.concat([tf.reshape(noise_vectors, [400, 2, 1, 1]), tf.ones([400, 2, 1, 1])], -1)
      ], -2)  // 400, 2, 2, 2  ==>  400, channel, u, x
    p_ui_cond_xi = tf.div(p_ui_cond_xi, tf.sum(p_ui_cond_xi, axis=-2, keepdims=true))
    reshape_channels = [1, 1, 1, 2, 2, 2]
    tile_channels = [400, 2, 2, 1, 1, 1]
    p_uxy = tf.tile(tf.reshape(p_xy_channeled, reshape_channels), tile_channels)  // 400, 2, 2, 2, 2, 2  ==> 400, u1, u2, x1, x2, y
    for (let channel_id = 0; channel_id < 2; channel_id++) {
      reshape_channels = [400, 1, 1, 1, 1, 1]
      reshape_channels[channel_id+1] = 2
      reshape_channels[channel_id+3] = 2

      tile_channels = [1, 2, 2, 2, 2, 2]
      tile_channels[channel_id+1] = 1
      tile_channels[channel_id+3] = 1

      p_uxy = tf.mul(p_uxy, tf.tile(tf.reshape(tf.gather(p_ui_cond_xi, channel_id, axis=1), reshape_channels), tile_channels))
    }
    p_uy = tf.sum(p_uxy, axis=[3, 4])
    p_ux = tf.sum(p_uxy, axis=-1)

    p_u = tf.sum(p_ux, axis=[3, 4])
    p_u_p_y = tf.mul(
      tf.tile(tf.reshape(p_u, [400, 2, 2, 1]), [1, 1, 1, 2]), 
      tf.tile(tf.reshape(p_y, [1, 1, 1, 2]), [400, 2, 2, 1]))

    ent_pupy = tf.sum(tf.mul(tf.neg(p_u_p_y), tf.where(tf.greater(p_u_p_y, 0), tf.log(p_u_p_y), 0)), axis=[1, 2, 3])
    ent_puy = tf.sum(tf.mul(tf.neg(p_uy), tf.where(tf.greater(p_uy, 0), tf.log(p_uy), 0)), axis=[1, 2, 3])
    info_y_u = tf.div(tf.sub(ent_pupy, ent_puy), tf.log(2))
      
    info_outs_all = await info_y_u.array()
    var infoPlaneData = [];
    var i = 0;
    for (i=0; i<info_ins_all.length; i++) {
        infoPlaneData.push([info_ins_all[i], info_outs_all[i]])
    }

    max_info = await tf.max(info_y_u).array()
   
    c.y.domain([0, Math.max(max_info*1.03, 0.2)])
    c.svg.select('.y.axis').call(c.yAxis)

    dots.data(infoPlaneData)
    dots
    .attr("cx", function(d) {return c.x(d[0])})
    .attr("cy", function(d) {return c.y(d[1])})


  }

  
  


}

window.initStorms?.()