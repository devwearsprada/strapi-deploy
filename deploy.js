const fs = require('fs')
const http = require('http')
const crypto = require('crypto')
const exec = require('child_process').exec

const json = fs.readFileSync('./services.json', 'utf-8')
const services = JSON.parse(json)

const SERVICES_ROOT = '~/web/'
const PM2_CMD = `cd ${SERVICES_ROOT} && pm2 startOrRestart ecosystem.config.js`

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

    if (match.length > 0) {
      console.log(match[0]);
      exec(`cd ${match[0].repo} && git pull && ${match[0].strapi_cmd} && ${PM2_CMD}`, (error, stdout, stderr) => {
        if (error) {
          console.log(`exec error: ${error}`)
          return
        }
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)
      })
    }

  })
  res.end()
})
  .listen(8080)
