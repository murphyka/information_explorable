

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
    sel: d3.select('.storm-telegraph'),
    state: stateCombo,
  })

  window.initInfoTelegraphModJoint({
    sel: d3.select('.storm-telegraph-mod-joint'),
    state: stateCombo,
  })

  window.initInfoTelegraphDIB({
    sel: d3.select('.storm-telegraph-dib'),
    state: stateCombo,
  })




}
window.initStorms()