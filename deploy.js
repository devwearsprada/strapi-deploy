const fs = require('fs')
const http = require('http')
const crypto = require('crypto')
// const exec = require('child_process').exec

const json = fs.readFileSync('./services.json', 'utf-8')
const services = JSON.parse(json)

http.createServer((req, res) => {
  req.on('data', (chunk) => {
    for (const i in services) {
      const secret = services[i].secret
      const sig = 'sha1=' +
        crypto
          .createHmac('sha1', secret)
          .update(chunk.toString())
          .digest('hex')

      services[i].sha = sig
    }

    const githubSignature = req.headers['x-hub-signature']
    const match = services.filter((service) => { return service.sha == githubSignature })

    console.log(match.length > 0)
    console.log(match)
    // if (req.headers['x-hub-signature'] == sig) {
    //   console.log('match')
    // }
  })

  res.end()
}).listen(8080)