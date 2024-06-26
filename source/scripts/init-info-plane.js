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


window.initInfoPlane = async function({sel, state, isBig=true, lossLabel, width=null, title=null}){
  // Plot the frame
  var c = d3.conventions({
    sel: sel.html('').append('div'),
    width: width || (isBig ? 442 : 50),
    height: isBig ? 150 : 30,
    margin: {left: 25, right: 25, top: 25, bottom: 30}
  })

  // Add the per-feature information axis
  c.y2 = d3.scale.linear().range([c.height, 0])
  c.yAxisRight = d3.svg.axis().scale(c.y2).orient("right")
  c.y2.domain([0, 4])

  c.x.domain([0, 20])
  c.y.domain([80, 200])  // change this for diff datasets; could create a plotting params json for each dataset
  // c.yAxis.tickFormat(d3.format('.0%'))

  // c.xAxis.ticks(isBig ? 10 : 3).tickFormat(d3.format(','))
  c.yAxis.ticks(isBig ? 5 : 3)
  c.yAxisRight.ticks(isBig ? 5 : 3)

  d3.drawAxis(c)
  c.svg.select('.y').lower()  // I think this is z order
  util.ggPlot(c)  // I think this just makes a gray background and puts grid lines

  c.svg.append('text.chart-title').at({y: -7, fontSize: 12, textAnchor: 'middle', x: c.width/2})
    .text(title || 'Information decomposition')

  util.addAxisLabel(c, 'Total information used by model (bits)', lossLabel, 'Information per feature (bits)')

  var line = d3.line().x(d => c.x(d.step))

  // Create the data curves
  var distortionPathSel = c.svg.append('path')
    .at({strokeWidth: 2, stroke: util.colors.distortion, fill: 'none'})
  var featurePathSel = c.svg.append('path')
    .at({strokeWidth: 2, stroke: util.colors.feature1, fill: 'none'})

  distortionPathSel.at({d: line.y(d => c.y(d[0]))(state.info_decomp)})

  // The label below the dotted line that follows the cursor... don't think we need this
  // var hoverTick = c.svg.select('.x .tick')
  //   .select(function(){ return this.parentNode.insertBefore(this.cloneNode(true), this.nextSibling) })
  //   .st({opacity: 1}).classed('step-path', 1)
  //   .raise()

  // hoverTick.select('text').st({fill: '#000', fontWeight: 500})
  // hoverTick.select('path').at({d: 'M 0 0 V ' + -c.height, stroke: '#000', strokeDasharray: '3 2'})

  // state.renderAll.step.fns.push(d => {
  //   var step = state.stepIndex*state.hyper.save_every

  //   hoverTick.translate(c.x(step), 0)
  //   hoverTick.select('text').text(d3.format(',')(step))
  // })

  c.svg.append('rect')
    .at({width: c.width, height: c.height + 30, fillOpacity: 0})
    .on('mousemove touchmove', function(){
      d3.event.preventDefault()

      // last training run missing on some models
      var mouseX = d3.clamp(0, d3.mouse(this)[0], c.width - .1)
      state.stepIndex = Math.floor(c.x.clamp(1).invert(mouseX)/state.hyper.save_every)
      state.renderAll.step()
    })


  // if (title?.includes('Sudden Generalization')) return

  // var labelKey = state.hyper.task + '_' + state.slug + '_' + (!!isLoss)
  // var labelOffsets = {
  //   'modular_addition_2023_07_09_19_38_17-index_false': [[260, 115], [7, 50]],
  //   'modular_addition_2023_07_09_19_38_17-index_true': [[305, 80], [30, 115]],
  //   'sparse_parity_2023_07_05_19_45_20_false': [[189, 132], [60, 50]],
  //   'sparse_parity_2023_07_05_19_45_20_true': [[134, 32], [40, 80]],

  //   // openQ
  //   'modular_addition_2023_07_22_20_25_47_true': [[300, 32], [125, 80]],
  //   'modular_addition_2023_07_22_20_37_01_true': [[300, 42], [40, 115]],
  // }[labelKey]

  // if (labelOffsets){
  //   c.svg.appendMany('text', labelOffsets)
  //     .text((d, i) => (i ? 'Train' : 'Test') + ' ' + (isLoss ? 'Loss' : 'Accuracy'))
  //     .st({fill: (d, i) => i ? util.colors.train : util.colors.test, pointerEvents: 'none'})
  //     .translate(d => d)
  //     .classed('overlay-chart-label', 1)
  //   } else{
  //     // console.log(labelKey)
  //   }
}

window.initTabular?.()



