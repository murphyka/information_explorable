

window.stormState = window.stormStateX || {
  isLocked: false,
}


window.initStorms = async function(){

  var state = stormState
  state.renderAll = util.initRenderAll(['pointHighlighter', 'modJoint']);
  window.initInfoTelegraph({
    sel: d3.select('.storm-telegraph'),
    state,
  })

  window.initInfoTelegraphModJoint({
    sel: d3.select('.storm-telegraph-mod-joint'),
    state,
  })

  window.initInfoTelegraphDIB({
    sel: d3.select('.storm-telegraph-dib'),
    state,
  })


}
window.initStorms()