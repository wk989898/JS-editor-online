const express = require('express')
const app = express()
const path = require('path')
const fs=require('fs')
const WebSocket = require('ws')

var port = process.argv[2] || 8080
const content = Object.create(null)

app.use('/monaco-editor', express.static(path.resolve('node_modules/monaco-editor')))
  .use('/emmet-monaco-es', express.static(path.resolve('node_modules/emmet-monaco-es')))
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
    res.end(content[stamp]||`not found stamp ${stamp}`)
  })
  .listen(port, () => {
    console.log(`editor runing at http://localhost:${port}`)
    console.log(`html runing at http://localhost:${port}/html`);
  })

const wss = new WebSocket.Server({
  port: 8081
})
wss.on('connection', (ws) => {
  ws.on('message', (res) => {
    const { data, stamp } = JSON.parse(res)
    if (data === 'ws close') {
      delete content[stamp]
    } else {
      try {
        content[stamp] = data
      } catch (error) {
        fs.writeFile(`./log/${getDay()}_${stamp}.txt`,error,()=>{})
        ws.send('too much data!')
        ws.close()
      }
    }
  })
})


function getDay() {
  const now=new Date()
  return `${now.getFullYear()}/${now.getMonth()}/${now.getDay()}`
}