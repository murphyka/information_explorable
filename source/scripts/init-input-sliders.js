window.initProbabilitySliders = function({sel, state, hasColor=true}){
  displayTexts = ['P(y|cc)', 'P(y|cs)', 'P(y|sc)', 'P(y|ss)']
  var sliders = ['p00', 'p01', 'p10', 'p11'].map((key, i) => ({
    sel: sel.append('div.slider'),//.style("position", "relative").style("margin-left", "-150px"),
    key: displayTexts[i],
    i,
    getVal: _ => state[key],
    setVal: d => state[key] = +d
  }))

  sliders.forEach(slider => {
    slider.sel.html(`
      <div'>
        <b>${slider.key}:</b> <val></val>
      </div>
      <div>
        <input type=range class=pslider min=${state.min_slider_value} max=${state.max_slider_value} step=${state.slider_step_size} value=${slider.getVal()}></input>
      </div>
    `)

    slider.sel.select('input[type="range"]')
      .on('input', function () {
        slider.setVal(this.value)
        state.renderAll.modJoint()
      })
    slider.sel.select('val').text(slider.getVal())
    state.renderAll.modJoint.fns.push(() => {
      var value = slider.getVal()
      slider.sel.select('val').text(parseFloat(value).toFixed(2))
      slider.sel.select('input').node().value = value
    })

  })
}
window.initProbabilityButtons = function({sel, state, columnIndex}){
  const gateButtons = [
  ['AND', [0, 0, 0, 1]],
  ['OR', [0, 1, 1, 1]],
  ['XOR', [0, 1, 1, 0]],
  ['NAND', [1, 1, 1, 0]],
  ['MirrorA', [0, 0, 1, 1]],
  ['MirrorB', [0, 1, 0, 1]],
  ]
  if (columnIndex == 2) {
    gateButtons.slice(0, 4).forEach(stuff => {
      buttonSel = sel.append('div.button')//.style("position", "relative").style("margin-left", "800px"),
      buttonSel.html(`<input type="button" class="pbutton" value=${stuff[0]}>`)
      .on('click', function () {
        state.p00 = stuff[1][0]; state.p01 = stuff[1][1]; state.p10 = stuff[1][2]; state.p11 = stuff[1][3]
        state.renderAll.modJoint()
      })
    })
  }
  if (columnIndex == 1) {
    gateButtons.slice(4).forEach(stuff => {
      buttonSel = sel.append('div.button')//.style("position", "relative").style("margin-left", "800px"),
      buttonSel.html(`<input type="button" class="pbutton" value=${stuff[0]}>`)
      .on('click', function () {
        state.p00 = stuff[1][0]; state.p01 = stuff[1][1]; state.p10 = stuff[1][2]; state.p11 = stuff[1][3]
        state.renderAll.modJoint()
      })
    })

    // buttonSel = sel.append('br')

    buttonSel = sel.append('div.button')
    buttonSel.html(`<input type="button" class="pbutton" value="Random" id="random">`)
    .on('click', function () {
      state.p00 = Math.random(); state.p01 = Math.random(); state.p10 = Math.random(); state.p11 = Math.random()
      state.renderAll.modJoint()
    })
  }
  
}

window.initParetoDisplay = function({sel}){
  buttonSel = sel.append('div.switch')
  buttonSel.html(`<label class="switch">
  <input type="checkbox">
  <span class="slider round"></span>
</label>`)


}

window.initNoiseSlider = function({sel, state, hasColor=true}){
  var sliders = ['noise'].map((key, i) => ({
    sel: sel.append('div.slider'),
    key,
    i,
    getVal: _ => parseFloat(state[key]).toFixed(2),
    setVal: d => state[key] = Math.exp(d)
  }))

  sliders.forEach(slider => {
    slider.sel.html(`
      <div style='color:${hasColor ? util.colors[slider.key + 'Input'] : ''}'>
        Line noise (V): <val></val>
      </div>
      <div>
        <input type=range min=${Math.log(state.min_slider_value)} max=${Math.log(state.max_slider_value)} step=${state.slider_step_size} value=${slider.getVal()}></input>
      </div>
      <div style='color:${hasColor ? util.colors[slider.key + 'Input'] : ''}'>
        Transmitted information (bits): <val2></val2>
      </div>
    `)

    slider.sel.select('input[type="range"]')
      .on('input', function () {
        slider.setVal(this.value)
        state.renderAll.modNoise()
      })
    slider.sel.select('val').text(slider.getVal())
    state.renderAll.modNoise.fns.push(() => {
      var value = slider.getVal()
      slider.sel.select('val').text(value)
      slider.sel.select('input').node().value = Math.log(value)
    })

  })
}

window.initTrainDIB = function({sel, state}) {
  buttonSel = sel.append('div.button')//.style("position", "relative").style("margin-left", "800px"),
  buttonSel.html(`<input type="button" class="pbutton" value="Train">`)
  .on('click', function () {
    state.renderAll.trainDIB()
  })
}

window.initPixelButtons = function({sel, state}){

    buttonSel = sel.append('div.button')
    buttonSel.html(`<input type="button" class="pbutton" value="Random" id="random2">`)
    .on('click', function () {

      for (let i=0; i<state.originalDims[0]; i++) {
        for (let j=0; j<state.originalDims[1]; j++) {
          randValue = Math.floor(Math.random()*2)
          state.boardValues[i][j] = randValue;
          state.d3ReadableBoardValues[i*state.originalDims[0]+j] = [i, j, randValue];
        }
      }
      state.renderAll.redraw()
    })
}