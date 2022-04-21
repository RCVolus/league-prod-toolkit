import fs from 'fs'
import { promisify } from 'util'
import path from 'path'
import { exec } from 'child_process'
import console from 'console'
import { PackageJson } from '../core/modules/Module'

const readdirPromise = promisify(fs.readdir)
const readFilePromise = promisify(fs.readFile)
const statPromise = promisify(fs.stat)
const execPromise = promisify(exec)

const modulePath = './modules'

let filter = ''
if (process.argv.length === 3) {
  filter = process.argv[2]
}

const main = async (): Promise<void> => {
  const data = await readdirPromise(modulePath)
  await Promise.all(
    data.map(async (folderName) => {
      if (filter !== '' && folderName !== filter) {
        return
      }

      const currentModulePath = path.join(modulePath, folderName)
      const packageJsonPath = path.join(currentModulePath, 'package.json')

      try {
        // Check that package.json exists
        await statPromise(packageJsonPath)
      } catch {
        return
      }

      const pkgJson = JSON.parse((await readFilePromise(packageJsonPath)).toString()) as PackageJson

      if (pkgJson.dependencies !== undefined || pkgJson.devDependencies !== undefined) {
        // run install
        await execPromise('npm ci', {
          cwd: currentModulePath
        })

        console.log('installed ' + folderName)
      }

      if (pkgJson.toolkit.needsBuild !== undefined && pkgJson.toolkit.needsBuild) {
        // run build
        await new Promise<void>((resolve, reject) => {
          exec('npm run build', {
            cwd: currentModulePath
          }, (error, stdout, stderr) => {
            console.log('='.repeat(20))
            console.log('start building ' + folderName)
            console.log(stdout)
            if (error !== null || stderr !== '') {
              return console.log(error ?? stderr)
            }
            console.log('finished building ' + folderName)
            resolve()
          })
        })
      }
    })
  )
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
