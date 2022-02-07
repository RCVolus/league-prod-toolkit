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
    message: 'Enter your server',
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
      'RU'
    ]
  })

  return server.server
}

const getDatabaseInfo = async () => {
  const clusterUrl = await inquirer.prompt({
    type: 'input',
    name: 'clusterUrl',
    message: 'Enter your Database cluster-url',
    default: 'localhost'
  })

  const port = await inquirer.prompt({
    type: 'number',
    name: 'port',
    message: 'Enter your Database port',
    default: 27017
  })

  const user = await inquirer.prompt({
    type: 'input',
    name: 'user',
    message: 'Enter your Database user',
    default: 'root'
  })

  const password = await inquirer.prompt({
    type: 'input',
    name: 'password',
    message: 'Enter your Database password',
    default: '12345'
  })

  return {
    clusterUrl: clusterUrl.clusterUrl,
    port: port.port,
    user: user.user,
    password: password.password
  }
}

const filePath = path.join(__dirname, '..', 'modules', 'plugin-config', 'config.dist.json')
const newFilePath = path.join(__dirname, '..', 'modules', 'plugin-config', 'config.json')
const file = require(filePath)

const askQuestions = async () => {
  const apiKey = await getApiKey()
  const server = await getServer()
  const database = await getDatabaseInfo()

  file['provider-webapi'].apiKey = apiKey
  file['provider-webapi'].server = server
  file.database = database

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
