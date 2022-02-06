const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const { createSpinner } = require('nanospinner')

const getApiKey = async () => {
  const apiKey = await inquirer.prompt({
    type: 'input',
    name: 'apiKey',
    message: 'Enter your Riot-API-Key (RGAPI-SECRETKEY)',
    default: 'RGAPI-SECRETKEY'
  })

  return apiKey.apiKey
}

const getServer = async () => {
  const server = await inquirer.prompt({
    type: 'list',
    name: 'server',
    message: 'Enter your server (EUW1)',
    default: 'EUW1',
    choices: [
      'BR1',
      'EUN1',
      'EUW1',
      'JP1',
      'KR',
      'LA1',
      'LA2',
      'NA1',
      'OC1',
      'TR1',
      'RU',
    ]
  })

  return server.server
}

const filePath = path.join(__dirname, '..', 'modules', 'plugin-config', 'config.dist.json')
const newFilePath = path.join(__dirname, '..', 'modules', 'plugin-config', 'config.json')
const file = require(filePath)

const askQuestions = async () => {
  const apiKey = await getApiKey()
  const server = await getServer()

  file['provider-webapi'].apiKey = apiKey
  file['provider-webapi'].server = server

  const spinner = createSpinner('Saving config')

  try {
    await fs.promises.writeFile(newFilePath, JSON.stringify(file, null, 2))
    spinner.success({
      text: 'config saved'
    })
  } catch (err) {
    spinner.error({
      text: err.message
    })
  }
}

askQuestions()
