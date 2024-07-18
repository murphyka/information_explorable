
window.initPixelGame = async function({sel, state, isBig=true}){
  state.boardValues = [[1, 0, 1, 0], [0, 1, 0, 1], [1, 0, 1, 0], [0, 1, 0, 1]]
  state.reconstructions = []
  state.pdf_svgs = []
  state.pdfxs = []
  state.pdfys = []
 // Plot the frame
  var leftMargin = 0
  var rightMargin = 0
  var topMargin = 25 
  var bottomMargin = 50
  var actualHeight = isBig ? 200 : 30
  var actualWidth = isBig ? 350 : 50

  // Labels of row and columns
  var rowLabels = ["stormy", "calm"]
  var colLabels = ["stormy", "calm"]
  
  sel.append("p").style("align-items", "center")
  for (let j=0; j<9; j++) {
    pdf_margin = {left: 35, right: rightMargin, top: topMargin, bottom: bottomMargin}
    pdf_width = 50
    state.pdf_svgs.push(sel
    .append("svg")
      .attr("width", pdf_width + pdf_margin.left + pdf_margin.right)
      .attr("height", pdf_width + pdf_margin.top + pdf_margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + pdf_margin.left + "," + pdf_margin.top + ")"))

    // Build X scales and axis:
    state.pdfxs.push(d3.scaleBand()
      .range([ 0, pdf_width ])
      .domain(rowLabels)
      .padding(0.01))

  // Build X scales and axis:
  state.pdfys.push(d3.scaleBand()
    .range([ pdf_width, 0 ])
    .domain(colLabels)
    .padding(0.01))


  state.pdf_svgs[j].selectAll("path,line").remove();

  // Build color scale
  var heatmapColor = d3.scaleLinear()
    .range(["white", "#69b3a2"])
    .domain([0,1])


  state.pdf_svgs[j].selectAll()
      .data(pdf_data)
      .enter()
      .append("rect")
      .attr("x", function(d) { return state.pdfxs[j](d.A) })
      .attr("y", function(d) { return state.pdfys[j](d.B) })
      .attr("width", state.pdfxs[j].bandwidth() )
      .attr("height", state.pdfys[j].bandwidth() )
      .style("fill", function(d) { return heatmapColor(d.value)} )
  }
    
}
