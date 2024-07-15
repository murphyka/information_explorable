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

// window.initTransmissionSliders = function({sel, state, hasColor=true}){
//   var sliders = ['Info, town A', 'Info, town B'].map((key, i) => ({
//     sel: sel.append('div.slider'),
//     key,
//     i,
//     getVal: _ => state[key],
//     setVal: d => state[key] = +d
//   }))

//   sliders.forEach(slider => {
//     slider.sel.html(`
//       <div style='color:${hasColor ? util.colors[slider.key + 'Input'] : ''}'>
//         ${slider.key}: <val></val>
//       </div>
//       <div>
//         <input type=range min=${state.min_slider_value} max=${state.max_slider_value} step=${state.slider_step_size} value=0.9></input>
//       </div>
//     `)

//     slider.sel.select('input[type="range"]')
//       .on('input', function () {
//         slider.setVal(this.value)
//         state.renderAll.modJoint()
//       })
//     state.renderAll.modJoint.fns.push(() => {
//       var value = slider.getVal()
//       slider.sel.select('val').text(value)
//       slider.sel.select('input').node().value = value
//     })

//   })
// }


window.initProbabilitySliders = function({sel, state, hasColor=true}){
  var sliders = ['p00', 'p01', 'p10', 'p11'].map((key, i) => ({
    sel: sel.append('div.slider'),
    key,
    i,
    getVal: _ => state[key],
    setVal: d => state[key] = +d
  }))

  sliders.forEach(slider => {
    slider.sel.html(`
      <div style='color:${hasColor ? util.colors[slider.key + 'Input'] : ''}'>
        ${slider.key}: <val></val>
      </div>
      <div>
        <input type=range min=${state.min_slider_value} max=${state.max_slider_value} step=${state.slider_step_size} value=${slider.getVal()}></input>
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

  const gateButtons = [
  ['AND', [0, 0, 0, 1]],
  ['OR', [0, 1, 1, 1]],
  ['XOR', [0, 1, 1, 0]],
  ['NAND', [1, 1, 1, 0]],
  ]
  gateButtons.forEach(stuff => {
    buttonSel = sel.append('div.button')
    buttonSel.html(`<input type="button" class="button" value=${stuff[0]}>`)
    .on('click', function () {
      state.p00 = stuff[1][0]; state.p01 = stuff[1][1]; state.p10 = stuff[1][2]; state.p11 = stuff[1][3]
      state.renderAll.modJoint()
    })
  })
  buttonSel = sel.append('div.button')
  buttonSel.html(`<input type="button" class="button" value="random">`)
  .on('click', function () {
    state.p00 = Math.random(); state.p01 = Math.random(); state.p10 = Math.random(); state.p11 = Math.random()
    state.renderAll.modJoint()
  })
  
}

window.initNoiseSlider = function({sel, state, hasColor=true}){
  var sliders = ['noise'].map((key, i) => ({
    sel: sel.append('div.slider'),
    key,
    i,
    getVal: _ => parseFloat(state[key]).toFixed(2),
    setVal: d => state[key] = +d
  }))

  sliders.forEach(slider => {
    slider.sel.html(`
      <div style='color:${hasColor ? util.colors[slider.key + 'Input'] : ''}'>
        Line noise (V): <val></val>
      </div>
      <div>
        <input type=range min=${state.min_slider_value} max=${state.max_slider_value} step=${state.slider_step_size} value=${slider.getVal()}></input>
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
      slider.sel.select('input').node().value = value
    })

  })
}

