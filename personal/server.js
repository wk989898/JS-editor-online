const express = require('express')
const app = express()
const path = require('path')
const WebSocket = require('ws')

var html,port=process.argv[2]||8080

app.use('/monaco-editor',express.static(path.resolve('node_modules/monaco-editor')))
.use('/emmet-monaco-es',express.static(path.resolve('node_modules/emmet-monaco-es')))
.get('/', (req, res) => {
  res.sendFile(path.resolve('./main.html'))
})
.get('/html',(req,res)=>{
  res.setHeader('Content-Type','text/html')
  res.send(html)
})
.listen(port, () => {
  console.log(`editor runing at http://localhost:${port}`)
  console.log(`html runing at http://localhost:${port}/html`);
})

const wss = new WebSocket.Server({
  port: port+1
})
wss.on('connection',(ws)=>{
  ws.on('message',(res)=>{
    html=res
  })
})
