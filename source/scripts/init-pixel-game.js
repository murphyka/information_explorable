window.initPixels = async function(){
  var stateExample = {}
  stateExample.renderAll = util.initRenderAll(['modA']);
  window.initPixelExample({
    sel: d3.select('.pixel-space-example'),
    state: stateExample,
  })

  var statePixels = {}
  window.initPixelGame({
    sel: d3.select('.pixel-game'),
    state: statePixels,
  })

}
window.initPixels()