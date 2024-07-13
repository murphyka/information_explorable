
window.initInfoTelegraphDIB = async function({sel, state, isBig=true}){
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
  c.y2 = d3.scaleLinear().domain([0, 1.03]).range([c.height, 0])
  c.y2Axis = d3.axisRight(c.y2).ticks(isBig ? 5 : 3)
  c.svg.append("g") 
        .attr("transform", `translate(${actualWidth},0)`) 
        .call(c.y2Axis) 
        
  c.yAxis.ticks(isBig ? 5 : 3)
  c.svg.attr({"float": "left"})
  d3.drawAxis(c)
  
  c.svg.select('.y').lower()  // z order

  util.addAxisLabel(c, 'Total information from other towns (bits)', 'Information about your town (bits)', y2Text='Information per town (bits)', xOffset=40, yOffset=-40)

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
      .attr("opacity", 0.2)
      .attr("fill", "#69b3a2")
  state.dots.push(dots)
  state.cs.push(c)

  // Train a simple model
  const model = tf.sequential({
   layers: [
     tf.layers.dense({inputShape: [1], units: 32, activation: 'relu'}),
     tf.layers.dense({units: 10, activation: 'softmax'}),
   ]
  });

  model.compile({
    optimizer: 'sgd',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
}

