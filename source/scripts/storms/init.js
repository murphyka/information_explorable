

window.stormState = window.stormStateX || {
  isLocked: false,
}


window.initStorms = async function(){

  var state = stormState
  
  window.initInfoTelegraph({
    sel: d3.select('.storm-telegraph'),
    state,
  })


}
window.initStorms()
