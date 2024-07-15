// https://github.com/1wheel/roadtolarissa Copyright 2018 Adam Pearce
// https://github.com/linxiaowu66/marked-kaTex Copyright (c) 2011-2014, Christopher Jeffrey

var fs = require('fs')
var {exec, execSync} = require('child_process')

var source = `${__dirname}/source`
var public = `${__dirname}/public`
if (!fs.existsSync(public)) fs.mkdirSync(public)

function rsyncSource(){
  exec(`rsync -a --exclude _posts --exclude _templates ${source}/ ${public}/`)
}
rsyncSource()

// https://github.com/markedjs/marked/issues/1538#issuecomment-526189561
var katex = require('katex')
var marked = require('marked')
marked.setOptions({smartypants: true})

var renderer = new marked.Renderer()
function mathsExpression(expr){
  try {
    if (expr.match(/^\$\$[\s\S]*\$\$$/)) {
      expr = expr.substr(2, expr.length - 4)
      return katex.renderToString(expr, { displayMode: true })
    } else if (expr.match(/^\$[\s\S]*\$$/)) {
      expr = expr.substr(1, expr.length - 2)
      return katex.renderToString(expr, { isplayMode: false })
    }
  } catch(e){
    console.log(e)
    console.log(expr)
  }
}

var rendererCode = renderer.code
renderer.code = function(code, lang, escaped) {
  if (!lang) {
    var math = mathsExpression(code)
    if (math) return math
  }

  return rendererCode(code, lang, escaped)
}

var rendererCodespan = renderer.codespan
renderer.codespan = function(text) {
  var math = mathsExpression(text)
  if (math) return math

  rendererCodespan(text)
}


var templates = {}
var str = fs.readFileSync(public + '/../post_v2.html', 'utf8')
var templateName = 'post_v2.html'
templates[templateName] = d => eval('`' + str + '`')


var posts = [parsePost(public + '/../info_decomp.md')]
  
function parsePost(path){
  var str = fs.readFileSync(path, 'utf8')
  if (str[0] == '<') str = str.split('License.\n-->')[1]
  var [top, body] = str
    .replace('---\n', '')
    .split('\n---\n')

  var html = body

  html = marked(body, {renderer})
  

  var post = {html}
  top.split('\n').forEach(line => {
    var [key, val] = line.split(/: (.+)/)
    post[key] = val
  })

  return post
}

function writePost(post){
  var dir = public + post.permalink
  // if (!fs.existsSync(dir)) execSync(`mkdir ${dir}`)
  // fs.writeFileSync(`${dir}/index.html`, templates[post.template](post))
  fs.writeFileSync(public + '/../index.html', templates[post.template](post))

  var outposts = JSON.parse(JSON.stringify(posts))
  outposts.forEach(d => delete d.html)
  fs.writeFileSync(public + '/posts.json', JSON.stringify(outposts, null, 2))


}

posts.forEach(writePost)

if (process.argv.includes('--watch')){
  require('chokidar').watch(source).on('change', path => {
    rsyncSource()
    if (path.includes('_posts/')) writePost(parsePost(path))
  })
}
