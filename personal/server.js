const express = require('express')
const app = express()
const path = require('path')
const url = require('url')
const WebSocket = require('ws')

var html, port = process.argv[2] || 8080

var server = app.use('/vs', express.static(path.resolve('node_modules/monaco-editor/min/vs')))
.get('/emmet-monaco.min.js', (req, res) => {
  res.sendFile(path.resolve('./node_modules/emmet-monaco-es/dist/emmet-monaco.min.js'))
})
  .get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname,'./main.html'))
  })
  .get('/html', (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    res.send(html)
  })
  .listen(port, () => {
    console.log(`editor runing at http://localhost:${port}`)
    console.log(`html runing at http://localhost:${port}/html`);
  })

const wss = new WebSocket.Server({
  noServer: true
})
server.on('upgrade', (req, socket, head) => {
  let pathname = url.parse(req.url).pathname
  if (pathname === '/ws')
    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.on('message', (res) => {
        html = res
      })
    })
  else socket.destroy()
})
