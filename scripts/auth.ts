import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import { createSpinner } from 'nanospinner'
import { randomBytes } from 'crypto'
import uuidAPIKey from 'uuid-apikey'

const getAuth = async (): Promise<boolean> => {
  const auth = await inquirer.prompt({
    type: 'confirm',
    name: 'enabled',
    message: 'Do you want to enable the authentication?',
    default: false
  })

  return auth.enabled
}

const newFilePath = path.join(__dirname, '..', '..', 'modules', 'plugin-config', 'config.json')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const file = require(newFilePath)

const askQuestions = async (): Promise<void> => {
  const auth = await getAuth()

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
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
askQuestions()