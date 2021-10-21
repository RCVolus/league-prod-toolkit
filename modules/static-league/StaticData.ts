import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import fetch from 'node-fetch';
import fs from 'fs';
import fse from 'fs-extra'
import path from 'path';
import tar from 'tar';
import https from 'https';

export default class StaticData {

  private readyHandler?: () => void

  private _finishedCenteredImg = false
  private _finishedAdditionalFileDownloading = false
  private _finishedDragonTail = false

  public version : string

  /**
   * @param ctx Plugin Context
   * @param version target game version if none given, current version will be used
   */
  constructor (private ctx: PluginContext, private config: any) {
    this.version = this.config.gameVersion
    this._startUp()
  }

  private async _startUp () {
    if (!this.version) {
      await this.setCurrentVersion()
    }

    if (!this.config['last-downloaded-version'] || this.config['last-downloaded-version'] !== this.version) {
      this.getDDragon()
      this.getAdditionalFiles()
    } else {
      this._finishedCenteredImg = true
      this._finishedAdditionalFileDownloading = true
      this._finishedDragonTail = true
      
      if (this.readyHandler) this.readyHandler()
    }
  }

  public onReady (handler: () => void) : void {
    if (this._finishedDragonTail && this._finishedCenteredImg && this._finishedAdditionalFileDownloading) {
      handler()
    } else {
      this.readyHandler = handler
    }
  }

  private _readyCheck () {
    if (!this.readyHandler) return

    if (!this._finishedDragonTail || !this._finishedCenteredImg || !this._finishedAdditionalFileDownloading) return

    this.readyHandler()
    this._setDownloadVersion()
  }

  private _setDownloadVersion () {
    if (!this.readyHandler) return

    this.ctx.LPTE.emit({
      meta: {
        type: 'set',
        namespace: 'config',
        version: 1
      },
      config: {
        "last-downloaded-version": this.version
      }
    });
  }

  private async setCurrentVersion () {
    const gvRequest = await fetch("https://ddragon.leagueoflegends.com/api/versions.json")
    const gvJson = await gvRequest.json()
    return this.version = gvJson[0] as string
  }

  private getDDragon () { 
    const tarFileName = `dragontail-${this.version}.tgz`
    const tarFilePath = path.join(__dirname, '..', 'frontend', tarFileName)
    const tarURI = `https://ddragon.leagueoflegends.com/cdn/${tarFileName}`

    const file = fs.createWriteStream(tarFilePath);
    this.ctx.log.info('start downloading dragontail.tgz')

    https.get(tarURI, (response) => {
      response.pipe(file);
  
      if (response.headers['content-language']) {
        var len = parseInt(response.headers['content-language'], 10);
        var cur = 0;
        var total = len / 1048576;
  
        response.on("data", (chunk: any) => {
          cur += chunk.length;
          this.ctx.log.debug("Downloading " + (100 * cur / len).toFixed(2) + "% " + (cur / 1048576).toFixed(2) + " mb\r" + ".<br/> Total size: " + total.toFixed(2) + " mb");
        });
      }
  
      file.on("finish", () => {
        this.ctx.log.info('finish downloading dragontail.tgz')
        file.close();
        this.unpackDDragon()
      })
    }).on('error', (err) => { // Handle errors
      fs.unlink(tarFilePath, () => {
        this.ctx.log.debug(tarFilePath + 'file unlinked')
      });
      this.ctx.log.error(err.message)
    });
  }

  private unpackDDragon () {
    const dDragonPaths = [
      `${this.version}/img/champion`,
      `${this.version}/img/item`,
      `${this.version}/img/profileicon`,
      `${this.version}/data/de_DE/map.json`,
      `${this.version}/data/de_DE/runesReforged.json`,
      `${this.version}/data/de_DE/champion.json`,
      `${this.version}/data/de_DE/item.json`,
      `img/champion`,
      `img/perk-images/Styles`,
    ]
  
    const tarFileName = `dragontail-${this.version}.tgz`
    const tarFilePath = path.join(__dirname, '..', 'frontend', tarFileName)
    const dataPath = path.join(__dirname, '..', 'frontend')

    this.ctx.log.info('start unpacking dragontail.tgz')
    fs.createReadStream(tarFilePath)
    .on('error', this.ctx.log.debug)
    .pipe(
      tar.x({ cwd: dataPath, newer: true }, dDragonPaths)
      .on('finish', async () => {
        this.ctx.log.info('finish unpacking dragontail.tgz')
        await fs.promises.unlink(tarFilePath);
        this.copyDDragonFiles()
      })
    )
  }

  private async copyDDragonFiles () {
    this.ctx.log.info('moving files to frontend')

    const dataPath = path.join(__dirname, '..', 'frontend')
    const versionDirPath = path.join(__dirname, '..', 'frontend', this.version as string)

    await fse.copy(versionDirPath, dataPath)

    this.removeVersionDir(versionDirPath)
    this.getAllCenteredImg()

    this.ctx.log.info('finish moving files to frontend')
  }

  private async removeVersionDir (versionDirPath: string) {
    this.ctx.log.info('delete versioned folder')
    await fs.promises.rmdir(versionDirPath, { recursive: true })
    this._finishedDragonTail = true
    this._readyCheck()
    this.ctx.log.info('finish deleting versioned folder')
  }

  private async getAllCenteredImg () {
    this.ctx.log.info("start downloading centered images")

    const base = path.join(__dirname, '..', 'frontend', 'img', 'champion', 'centered')

    if (!fs.existsSync(base)) {
      await fs.promises.mkdir(base, { recursive: true })
    }

    const champions : Array<any> = Object.values(require(`../frontend/data/de_DE/champion.json`).data)

    for (const champ of champions) {
      const champId = champ.key
      await this._downloadCenteredImg(base, champId)
    }

    this._finishedCenteredImg = true
    this._readyCheck()
    this.ctx.log.info("finish downloading centered images")
  }

  private async _downloadCenteredImg (base: string, champId : number) {
    const dest = path.join(base, champId.toString()) + '.jpg'
    const url = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-splashes/${champId}/${champId}000.jpg`

    let file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        this.ctx.log.debug(`downloaded img for ${champId}`)
        Promise.resolve(true)
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {
        this.ctx.log.error(`downloaded failed img for ${champId} with: ${err.message}`)
        Promise.reject(err)
      });
    })
  }

  private async getAdditionalFiles () {
    if (!this.version) return

    this.ctx.log.info("start downloading additional files")

    const base = path.join(__dirname, '..', 'frontend', 'data')
    const versionSplit = this.version.split('.')
    const mainVersion = `${versionSplit[0]}.${versionSplit[1]}`

    // Item Bin
    const itemBinUri = `https://raw.communitydragon.org/${mainVersion}/game/global/items/items.bin.json`
    const itemBinRes = await fetch(itemBinUri)
    const itemBin = await itemBinRes.json()
    const itemBinPath = path.join(base, 'item.bin.json')
    fs.writeFile(itemBinPath, JSON.stringify(itemBin), (err) => {
      if (err) this.ctx.log.error(err.message);
    });

    this._finishedAdditionalFileDownloading = true
    this._readyCheck()
    this.ctx.log.info("finish downloading additional files")
  }
}