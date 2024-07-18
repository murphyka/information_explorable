window.initPixels = async function(){

  var statePixels = {}
  statePixels.renderAll = util.initRenderAll(['modBoard']);
  window.initPixelGame({
    sel: d3.select('.pixel-game'),
    state: statePixels,
  })

}
window.initPixels()