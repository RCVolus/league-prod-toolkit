import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'

const execPromise = promisify(exec)

const modulesPath = './modules'

const actions = {
  'update to newer version version': 'version',
  'push newest changes to github': 'push',
  'pull newest changes from github': 'pull',
  'commit changes to repo': 'commit',
  'npm update': 'update',
  'run a custom command': 'custom'
}

type Module = [string, string, boolean]

async function getFolder(): Promise<Module[]> {
  const modules: Module[] = []

  const dir = await fs.promises.opendir(modulesPath)

  for await (const folder of dir) {
    if (!folder.isDirectory()) continue

    const modulePath = path.join(modulesPath, folder.name)

    try {
      const moduleConfig = await fs.promises.readFile(
        path.join(modulePath, 'package.json')
      )
      const data = JSON.parse(moduleConfig.toString())

      const name = data.name as string
      const version = data.version as string
      const needBuild = data.toolkit.needsBuild ?? false

      modules.push([modulePath, `${name} - ${version}`, needBuild])
    } catch (e) {
      console.warn(`Failed to load module/plugin in ${modulePath}`, e)
      continue
    }
  }

  return modules
}

async function choseModules(modules: Module[]): Promise<Module[]> {
  const choices = await inquirer.prompt({
    type: 'checkbox',
    name: 'modules',
    choices: modules.map((m) => m[1])
  })

  if (choices.modules.length <= 0) {
    console.warn('! Please select at least one module')
    return await choseModules(modules)
  } else {
    return choices.modules.map((n: string) => modules.find((m) => m[1] === n))
  }
}

async function choseAction(): Promise<string> {
  const choices = await inquirer.prompt({
    type: 'list',
    name: 'action',
    choices: Object.keys(actions)
  })

  return choices.action
}

async function start(): Promise<void> {
  const modules = await getFolder()

  const chosenModules = await choseModules(modules)
  const chosenAction = await choseAction()

  const isAction = chosenAction in actions

  if (!isAction) return

  if (chosenAction === 'update to newer version version') {
    await updateVersion(chosenModules)
  } else if (chosenAction === 'push newest changes to github') {
    await pushChanges(chosenModules)
  } else if (chosenAction === 'pull newest changes from github') {
    await pullChanges(chosenModules)
  } else if (chosenAction === 'commit changes to repo') {
    await commitChanges(chosenModules)
  } else if (chosenAction === 'npm update') {
    await updateNpm(chosenModules)
  } else if (chosenAction === 'run a custom command') {
    await customCommand(chosenModules)
  }
}

async function getNewVersion(): Promise<string> {
  const version = await inquirer.prompt({
    type: 'list',
    name: 'versionType',
    message: 'select a version type',
    choices: ['patch', 'minor', 'major'],
    default: 'patch'
  })

  return version.versionType
}

async function updateVersion(modules: Module[]): Promise<void> {
  const version = await getNewVersion()

  for await (const module of modules) {
    const modulePath = module[0]
    console.log(`${module[1]}:`)

    try {
      const tag = await execPromise(`npm version ${version}`, {
        cwd: modulePath
      })
      console.log(tag.stdout)

      const push = await execPromise('git push origin main --follow-tags', {
        cwd: modulePath
      })
      console.log(push.stdout)
    } catch (e) {
      console.error(e)
    }
  }
}

async function pushChanges(modules: Module[]): Promise<void> {
  for await (const module of modules) {
    const modulePath = module[0]
    console.log(`${module[1]}:`)

    try {
      const push = await execPromise('git push', {
        cwd: modulePath
      })
      console.log(push.stdout)
    } catch (e) {
      console.error(e)
    }
  }
}

async function pullChanges(modules: Module[]): Promise<void> {
  for await (const module of modules) {
    const modulePath = module[0]
    console.log(`${module[1]}:`)

    try {
      const pull = await execPromise('git pull', {
        cwd: modulePath
      })
      console.log(pull.stdout)
    } catch (e) {
      console.error(e)
    }
  }
}

async function updateNpm(modules: Module[]): Promise<void> {
  for await (const module of modules) {
    const modulePath = module[0]
    console.log(`${module[1]}:`)

    try {
      const pull = await execPromise('npm update', {
        cwd: modulePath
      })
      console.log(pull.stdout)
    } catch (e) {
      console.error(e)
    }
  }
}

async function getCommitMessage(): Promise<string> {
  const message = await inquirer.prompt({
    type: 'input',
    name: 'message',
    message: 'Enter a commit massage'
  })

  return message.message
}

async function commitChanges(modules: Module[]): Promise<void> {
  const commitMessage = await getCommitMessage()

  for await (const module of modules) {
    const modulePath = module[0]
    console.log(`${module[1]}:`)

    try {
      const add = await execPromise('git add .', {
        cwd: modulePath
      })
      console.log(add.stdout)

      const commit = await execPromise(`git commit -m "${commitMessage}"`, {
        cwd: modulePath
      })
      console.log(commit.stdout)
    } catch (e) {
      console.error(e)
    }
  }
}
async function getCommand(): Promise<string> {
  const command = await inquirer.prompt({
    type: 'input',
    name: 'command',
    message: 'Enter a command'
  })

  return command.command
}

async function customCommand(modules: Module[]): Promise<void> {
  const commitMessage = await getCommand()

  for await (const module of modules) {
    const modulePath = module[0]
    console.log(`${module[1]}:`)

    try {
      const cmd = await execPromise(commitMessage, {
        cwd: modulePath
      })
      console.log(cmd.stdout)
    } catch (e) {
      console.error(e)
    }
  }
}

start()
