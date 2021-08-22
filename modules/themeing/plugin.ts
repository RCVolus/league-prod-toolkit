import { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'
import sass from 'node-sass'

const namespace = 'themeing';

interface ThemeConfig {
  name: string
  author: string
  version: string
}

interface Theme {
  config: ThemeConfig,
  folder: string,
  scss: string,
  id: string
}

let themes: Theme[]

const getThemes = async (ctx: PluginContext): Promise<Theme[]> => {
  const themesPath = path.join(__dirname, '../themes')

  const themes: Theme[] = []

  const dir = await fs.promises.opendir(themesPath)
  for await (const folder of dir) {
    const themePath = path.join(themesPath, folder.name);

    let themeConfig: ThemeConfig
    let scss: string
    try {
      themeConfig = require(path.join(themePath, 'theme.json'))
      scss = await fs.promises.readFile(path.join(themePath, 'index.scss'), 'utf-8');
    } catch (e) {
      ctx.log.warn(`Failed to load theme in ${themePath}`, e)
      continue
    }

    const theme: Theme = {
      config: themeConfig,
      folder: themePath,
      scss,
      id: folder.name
    }
    themes.push(theme)
  }

  return themes
}

/**
 * Returns the currently active theme, by reading the 'id' file on the file system,
 * or null if there currently is no theme active
 */
const getActiveTheme = async (): Promise<string | null> => {
  const idFilePath = path.join(__dirname, '../frontend/active/id')

  try { 
    await fs.promises.stat(idFilePath)
  } catch (e) {
    return null;
  }

  const activeTheme = (await fs.promises.readFile(idFilePath, 'utf-8')).trim()
  return activeTheme;
}

module.exports = async (ctx: PluginContext) => {
  // Register new UI page
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'Themeing',
      frontend: 'frontend',
      id: 'op-themeing'
    }]
  });

  let activeTheme = await getActiveTheme()

  // Emit event that we're ready to operate
  ctx.LPTE.emit({
    meta: {
      type: 'plugin-status-change',
      namespace: 'lpt',
      version: 1
    },
    status: 'RUNNING'
  });

  themes = await getThemes(ctx)

  ctx.LPTE.on(namespace, 'get-themes', event => {
    ctx.LPTE.emit({
      meta: {
        type: event.meta.reply as string,
        namespace: 'reply',
        version: 1
      },
      themes,
      activeTheme
    })
  })

  ctx.LPTE.on(namespace, 'reload-themes', async event => {
    themes = await getThemes(ctx);
    ctx.LPTE.emit({
      meta: {
        type: event.meta.reply as string,
        namespace: 'reply',
        version: 1
      },
      themes,
      activeTheme
    })
  })

  ctx.LPTE.on(namespace, 'activate-theme', async event => {
    activeTheme = event.theme as string

    const themePath = path.join(__dirname, '../themes/', activeTheme)
    const activePath = path.join(__dirname, '../frontend/active')
    const idFilePath = path.join(activePath, 'id')
    const gitKeepFilePath = path.join(activePath, '.gitkeep')

    try {
      await fse.emptyDir(activePath)
      await fse.copy(themePath, activePath)

      fs.writeFile(idFilePath, activeTheme, () => {})
      fs.writeFile(gitKeepFilePath, '', () => {})
    } catch (e) {
      ctx.log.error('Applying theme failed', e)
    }

    sass.render({
      file: path.join(activePath, 'index.scss')
    }, async (err, result) => {
      if (err) {
        ctx.log.error('Failed to compile scss', err)
        return;
      }

      fs.writeFile(path.join(activePath, 'index.css'), result.css, () => {})
    });

    ctx.LPTE.emit({
      meta: {
        type: event.meta.reply as string,
        namespace: 'reply',
        version: 1
      },
      themes,
      activeTheme
    })
  })

  await ctx.LPTE.await('lpt', 'ready', 150000);
};
