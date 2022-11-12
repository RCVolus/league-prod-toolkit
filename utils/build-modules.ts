import fs from 'fs'
import { promisify } from 'util'
import path from 'path'
import { exec } from 'child_process'
import console from 'console'
import { PackageJson } from '../core/modules/Module'

const execPromise = promisify(exec)

const modulePath = './modules'

const main = async (): Promise<void> => {
  const data = await fs.promises.readdir(modulePath)
  await Promise.all(
    data.map(async (folderName) => {
      if (!process.argv.includes(folderName)) {
        return
      }

      const currentModulePath = path.join(modulePath, folderName)
      const packageJsonPath = path.join(currentModulePath, 'package.json')

      try {
        // Check that package.json exists
        await fs.promises.stat(packageJsonPath)
      } catch {
        return
      }

      const pkgJson = JSON.parse(
        (await fs.promises.readFile(packageJsonPath)).toString()
      ) as PackageJson

      if (
        (pkgJson.dependencies !== undefined ||
        pkgJson.devDependencies !== undefined) && !process.argv.includes('ni')
      ) {
        // run install
        await execPromise('npm ci', {
          cwd: currentModulePath
        })

        console.log('installed ' + folderName)
      }

      if (
        pkgJson.toolkit.needsBuild !== undefined &&
        pkgJson.toolkit.needsBuild
      ) {
        // run build
        await new Promise<void>((resolve, reject) => {
          exec(
            'npm run build',
            {
              cwd: currentModulePath
            },
            (error, stdout, stderr) => {
              console.log('='.repeat(20))
              console.log('start building ' + folderName)
              console.log(stdout)
              if (error !== null || stderr !== '') {
                return console.log(error ?? stderr)
              }
              console.log('finished building ' + folderName)
              resolve()
            }
          )
        })
      }
    })
  )
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
