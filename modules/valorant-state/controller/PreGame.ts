import { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { PregameState } from '../types/Enums'
import { PreGameState } from '../types/GameSets'
import { PreGame as PreGameType, PreGameInit, Team } from '../types/PreGame'

export class PreGame {

  private _available = false
  private _created = 0
  private _updated = 0
  private _deleted = 0

  private phase ? : PregameState
  private timeLeftUntil = 0
  private teams ? : Team[]

  constructor (private ctx: PluginContext) {}

  public init (data : PreGameInit) {
    this._available = true
    this._created = new Date().getTime()
    this._updated = new Date().getTime()

    this.timeLeftUntil = data.timer.timeLeftUntil
    this.phase = data.timer.phase
    this.teams = data.teams
  }

  public update (data : PreGameType) {
    this._updated = new Date().getTime()
    this.phase = data.PregameState
    this.teams = data.Teams
  }

  public delete (data : PreGameType) {
    /* this._available = false
    this._deleted = new Date().getTime()
    this._updated = new Date().getTime()
    this.phase = data.PregameState
    this.teams = data.Teams */
  }
  
  public getState () : PreGameState {
    return {
      _available: this._available,
      _created: this._created,
      _updated: this._updated,
      _deleted: this._deleted,
      teams: this.teams,
      timer: {
        phase: this.phase,
        timeLeftUntil: this.timeLeftUntil
      }
    }
  }
}