import axios from 'axios'
import { version } from '../package.json'
import inquirer from 'inquirer'
import { createWriteStream } from 'fs'
import { join } from 'path'
import { extract } from 'zip-lib'
import { remove } from 'fs-extra'
import { createSpinner } from 'nanospinner'
import { lt } from 'semver'
import type { ReleaseType } from './release'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

const checkVersion = async (): Promise<ReleaseType | undefined> => {
  const res = await axios.get<ReleaseType>('https://prod-toolkit-latest.himyu.workers.dev/', {
    headers: { 'Accept-Encoding': 'gzip,deflate,compress' }
  })

  if (res.status !== 200) {
    console.warn('The current version could not be checked')
    return
  }

  if (lt(version, res.data.tag_name)) {
    return res.data
  }
}

const installUpdateConfirm = async (): Promise<boolean> => {
  const install = await inquirer.prompt({
    type: 'confirm',
    name: 'install',
    message: 'Do you want to install the newest version?',
    default: true
  })

  return install.install
}

async function installUpdate(version: ReleaseType): Promise<void> {
  const spinner = createSpinner(`Downloading ${version.tag_name}`)
  spinner.start()

  const url = version.assets[0].browser_download_url
  const dl = await axios.get(url, {
    responseType: 'stream'
  })

  if (dl.status !== 200) {
    spinner.error({ text: dl.statusText })
    console.log(`Downloading ${version.tag_name} failed: ${dl.statusText} - ${dl.data as string}`)
    return
  }

  const cwd = join(__dirname, '..', '..')

  const savePath = join(cwd, `${version.assets[0].name}.zip`)
  const folderPath = cwd

  await new Promise<void>((resolve, reject) => {
    dl.data.pipe(createWriteStream(savePath))
    dl.data.on('end', async () => {
      spinner.update({
        text: `unpacking ${version.assets[0].name}`
      })

      await extract(savePath, folderPath)
      await remove(savePath)

      spinner.success({
        text: `${version.tag_name} installed`
      })

      resolve(undefined)
    })
    dl.data.on('error', (e: any) => {
      reject(e)
    })
  })
}

async function run(): Promise<void> {
  const updateAvailable = await checkVersion()

  if (updateAvailable === undefined) {
    console.log('There is no new version available')
    return
  }

  console.log('='.repeat(50))
  console.log(`There is a new version available: ${updateAvailable.tag_name}`)
  console.log('='.repeat(50))
  console.log('')

  const confirm = await installUpdateConfirm()

  if (!confirm) {
    console.log('Update declined ending process')
    return
  }

  try {
    await installUpdate(updateAvailable)
  } catch (error) {
    console.error(error)
    return
  }

  try {
    const output = await execPromise('npm i --production')

    console.log(output.stdout)

    if (output.stderr !== '') {
      console.error(output.stderr)
    }
  } catch (error) {
    console.error(error)
  }
}

void run()
