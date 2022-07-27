import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import { createSpinner } from 'nanospinner'

const newFilePath = path.join(
  __dirname,
  '..',
  '..',
  'modules',
  'plugin-config',
  'config.json'
)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const file = require(newFilePath)

const getApiKey = async (): Promise<string> => {
  const apiKey = await inquirer.prompt({
    type: 'input',
    name: 'apiKey',
    message: 'Enter your Riot-API-Key (RGAPI-SECRETKEY)',
    default: (file['plugin-webapi'].apiKey as string) ?? 'RGAPI-SECRETKEY'
  })

  return apiKey.apiKey
}

const askQuestions = async (): Promise<void> => {
  const apiKey = await getApiKey()

  file['plugin-webapi'].apiKey = apiKey

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
