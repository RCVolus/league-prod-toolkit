#!/usr/local/bin/node
const { spawn } = require('child_process')
const { writeJSON, exists } = require('fs-extra')
const { randomBytes } = require('crypto')
const uuidAPIKey = require('uuid-apikey')

const onExit = (childProcess) => {
  return new Promise((resolve, reject) => {
    childProcess.once('exit', (code, signal) => {
      if (code === 0) {
        resolve(undefined)
      } else {
        reject(new Error('Exit with error code: ' + code))
      }
    })
    childProcess.once('error', (err) => {
      reject(err)
    })
  })
}

const editConfig = async () => {
  const file = require('./modules/plugin-config/config.json')
  file['plugin-webapi'].apiKey = process.env.RIOT_API_KEY
  file['plugin-webapi'].server = process.env.SERVER

  file.auth = {
    enabled: process.env.AUTH !== 'false',
    secreteKey:
      file.auth.secreteKey ?? process.env.AUTH !== 'false'
        ? randomBytes(48).toString('hex')
        : '',
    'super-api-key':
      file.auth['super-api-key'] ?? process.env.AUTH !== 'false'
        ? 'RCVPT-' + uuidAPIKey.create().apiKey
        : ''
  }

  await writeJSON('modules/plugin-config/config.json', file, { spaces: 2 })
}

const createConfig = async () => {
  // Write config file with environment variables
  const file = require('./modules/plugin-config/config.dist.json')
  file['plugin-webapi'].apiKey = process.env.RIOT_API_KEY
  file['plugin-webapi'].server = process.env.SERVER

  file.auth = {
    enabled: process.env.AUTH !== 'false',
    secreteKey:
      process.env.AUTH !== 'false' ? randomBytes(48).toString('hex') : '',
    'super-api-key':
      process.env.AUTH !== 'false' ? 'RCVPT-' + uuidAPIKey.create().apiKey : ''
  }

  await writeJSON('modules/plugin-config/config.json', file, { spaces: 2 })
}

const main = async () => {
  const checkFile = await exists('./modules/plugin-config/config.json')

  if (checkFile) {
    await editConfig()
  } else {
    await createConfig()
  }

  const startChildProcess = spawn('npm', ['start'], {
    stdio: [process.stdin, process.stdout, process.stderr],
    cwd: '/app'
  })

  await onExit(startChildProcess)
}

main()
