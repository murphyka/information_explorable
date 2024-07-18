

window.stormState = window.stormStateX || {
  isLocked: false,
}


window.initStorms = async function(){

  var stateSingle = {}
  stateSingle.renderAll = util.initRenderAll(['modNoise']);
  window.initInfoTelegraphSingle({
    sel: d3.select('.storm-telegraph-single'),
    state: stateSingle,
  })  

  var stateCombo = stormState
  stateCombo.renderAll = util.initRenderAll(['pointHighlighter', 'modJoint']);

  window.initInfoTelegraph({
    selHeatmap: d3.select('.storm-heatmap'),
    selRow: d3.select('.storm-telegraph'),
    state: stateCombo,
  })

}
window.initStorms()