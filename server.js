const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')
const url = require('url')
const WebSocket = require('ws')

var port = process.argv[2] || 8080
const content = Object.create(null)

var server = app.use('/vs', express.static(path.resolve('node_modules/monaco-editor/min/vs')))
  .get('/emmet-monaco.min.js', (req, res) => {
    res.sendFile(path.resolve('./node_modules/emmet-monaco-es/dist/emmet-monaco.min.js'))
  })
  .get('/', (req, res) => {
    res.sendFile(path.resolve('./main.html'))
  })
  .get('/html', (req, res) => {
    const stamp = req.query.stamp
    if (stamp === void 0) {
      res.status(403)
      return res.end()
    }
    res.setHeader('Content-Type', 'text/html')
    res.end(content[stamp] || `not found stamp ${stamp}`)
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
        const { data, stamp } = JSON.parse(res)
        if (data === 'ws close') {
          delete content[stamp]
        } else {
          try {
            content[stamp] = data
          } catch (error) {
            fs.writeFile(`./log/${getDay()}_${stamp}.txt`, error, () => { })
            ws.send('too much data!')
            ws.close()
          }
        }
      })
    })
  else socket.destroy()
})


function getDay() {
  const now = new Date()
  return `${now.getFullYear()}/${now.getMonth()}/${now.getDay()}`
}