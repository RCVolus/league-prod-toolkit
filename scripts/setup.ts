import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import { createSpinner } from 'nanospinner'
import { randomBytes } from 'crypto'
import { download, getAll } from './install'
import { Asset } from '../core/modules/Module'
import uuidAPIKey from 'uuid-apikey'

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
    message: 'Do you want to enable the authentication?',
    default: false
  })

  return auth.enabled
}

const getInstallAssets = async (): Promise<Asset[]> => {
  const install = await inquirer.prompt({
    type: 'confirm',
    name: 'enabled',
    message: 'Do you want to install Modules and Themes now?',
    default: true
  })

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!install.enabled) return []

  const type = await inquirer.prompt({
    type: 'list',
    name: 'type',
    message: 'Do you want to install single modules/themes or all for a specific game',
    default: 'Game',
    choices: [
      'Game',
      'Single'
    ]
  })

  if (type.type === 'Game') return await getGameSelection()
  else if (type.type === 'Single') return await getModuleSelection()

  return []
}

const getModuleSelection = async (): Promise<Asset[]> => {
  const assets = await getAll()

  const choices = await inquirer.prompt({
    type: 'checkbox',
    name: 'assets',
    choices: assets.map(a => a.name)
  })

  if (choices.assets.length <= 0) {
    console.warn('! Please select at least one Asset')
    return await getModuleSelection()
  }

  const selection = assets.filter(a => {
    return (choices.assets as any[]).includes((i: any) => i.name === a.name)
  })

  return selection
}

const getGameSelection = async (): Promise<Asset[]> => {
  const choices = await inquirer.prompt({
    type: 'checkbox',
    name: 'games',
    choices: [
      'League of Legends',
      'Valorant'
    ]
  })

  if (choices.games.length <= 0) {
    console.warn('! Please select at least one game')
    return await getGameSelection()
  }

  const assets = await getAll()
  const selection: Asset[] = []

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (choices.games.includes('League of Legends')) {
    assets.forEach(a => {
      if (a.name.includes('league')) {
        selection.push(a)
      }
    })
  }
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (choices.games.includes('Valorant')) {
    assets.forEach(a => {
      if (a.name.includes('valo')) {
        selection.push(a)
      }
    })
  }

  const teams = assets.find(a => a.name === 'module-teams')
  if (teams !== undefined) selection.push(teams)
  const caster = assets.find(a => a.name === 'module-caster')
  if (caster !== undefined) selection.push(caster)

  return selection
}

/* const getDatabaseInfo = async (): Promise<any> => {
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
    default: ''
  })

  return {
    clusterUrl: clusterUrl.clusterUrl,
    port: port.port,
    user: user.user,
    password: password.password
  }
} */

const filePath = path.join(__dirname, '..', '..', 'modules', 'plugin-config', 'config.dist.json')
const newFilePath = path.join(__dirname, '..', '..', 'modules', 'plugin-config', 'config.json')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const file = require(filePath)

const askQuestions = async (): Promise<void> => {
  const apiKey = await getApiKey()
  const server = await getServer()
  /* const database = await getDatabaseInfo() */
  const auth = await getAuth()

  file['plugin-webapi'].apiKey = apiKey
  file['plugin-webapi'].server = server
  /* file['plugin-database'] = database */
  file.auth = {
    enabled: auth,
    secreteKey: auth ? randomBytes(48).toString('hex') : '',
    'super-api-key': auth ? 'RCVPT-' + uuidAPIKey.create().apiKey : ''
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

  await installAssets()
}

const installAssets = async (): Promise<void> => {
  try {
    const assets = await getInstallAssets()

    for (const asset of assets) {
      await download(asset)
    }
  } catch (error) {
    console.log(error)
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
askQuestions()
