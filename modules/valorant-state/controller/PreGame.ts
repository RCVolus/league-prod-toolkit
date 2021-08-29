import { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { PregameState } from '../types/Enums'
import { PreGame as PreGameType, PreGameInit } from '../types/PreGame'

export class PreGame {

  private _available = false
  private _created = 0
  private _updated = 0
  private _deleted = 0

  private phase ? : PregameState
  private timeLeftUntil = 0

  constructor (private ctx: PluginContext) {}

  public init (data : PreGameInit) {
    this._available = true
    this._created = new Date().getTime()
    this._updated = new Date().getTime()

    this.timeLeftUntil = data.timer.timeLeftUntil
    this.phase = data.timer.phase
  }

  public update (data : PreGameType) {
    this._updated = new Date().getTime()
    this.phase = data.PregameState

    // TODO
  }

  public delete () {
    this._available = false
    this._deleted = new Date().getTime()
  }
  
  public getState () {
    return {
      _available: this._available,
      _created: this._created,
      _updated: this._updated,
      _deleted: this._deleted,
      timer: {
        phase: this.phase,
        timeLeftUntil: this.timeLeftUntil
      }
    }
  }
}