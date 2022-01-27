const fs = require('fs')
const path = require('path')

const apiKey = process.argv[3]
const region = process.argv[4]
const server = process.argv[5]

const filePath = path.join(__dirname, '..', 'modules', 'plugin-config', 'config.dist.json')
const newFilePath = path.join(__dirname, '..', 'modules', 'plugin-config', 'config.json')
const file = require(filePath)

file['provider-webapi'].apiKey = apiKey
file['provider-webapi'].region = region
file['provider-webapi'].server = server

fs.writeFile(newFilePath, JSON.stringify(file, null, 2), function (err) {
  if (err) return console.log(err)
  console.log('Saving config ...')
})
