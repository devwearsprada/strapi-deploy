const fs = require('fs')
const http = require('http')
const crypto = require('crypto')
const exec = require('child_process').exec

const secret = '9d0ad87d-952c-41d9-9800-75163ce13c90'

const json = fs.readFileSync('./services.json', 'utf-8')
const services = JSON.parse(json)

http.createServer((req, res) => {
  req.on('data', (chunk) => {
    const sig = 'sha1=' +
      crypto
        .createHmac('sha1', secret)
        .update(chunk.toString())
        .digest('hex')

    console.log(sig)
    console.log(req.headers)
    if (req.headers['x-hub-signature'] == sig) {
      console.log('match')
    }
  })

  res.end()
}).listen(8080)