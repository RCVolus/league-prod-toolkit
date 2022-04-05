import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import { createSpinner } from 'nanospinner'
import { randomBytes } from 'crypto'

const getApiKey = async (): Promise<string> => {
  const apiKey = await inquirer.prompt({
    type: 'input',
    name: 'apiKey',
    message: 'Enter your Riot-API-Key (RGAPI-SECRETKEY)',
    default: 'RGAPI-SECRETKEY'
  })

  return apiKey.apiKey
}

const getServer = async (): Promise<string> => {
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

const getAuth = async (): Promise<boolean> => {
  const auth = await inquirer.prompt({
    type: 'confirm',
    name: 'enabled',
    message: 'Do you want to enabled the authentication?',
    default: false
  })

  return auth.enabled
}

const getDatabaseInfo = async (): Promise<any> => {
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

const filePath = path.join(__dirname, '..', '..', 'modules', 'plugin-config', 'config.dist.json')
const newFilePath = path.join(__dirname, '..', '..', 'modules', 'plugin-config', 'config.json')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const file = require(filePath)

const askQuestions = async (): Promise<void> => {
  const apiKey = await getApiKey()
  const server = await getServer()
  const database = await getDatabaseInfo()
  const auth = await getAuth()

  file['plugin-webapi'].apiKey = apiKey
  file['plugin-webapi'].server = server
  file['plugin-database'] = database
  file.auth = {
    enabled: auth,
    secreteKey: auth ? randomBytes(48).toString('hex') : ''
  }

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

// eslint-disable-next-line @typescript-eslint/no-floating-promises
askQuestions()
