import { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { GameMode, GameType, Map } from '../types/Enums'
import { MatchInfoState } from '../types/GameSets'
import { PlayerName } from '../types/Player'
import { PreGameInit, Team } from '../types/PreGame'

export class MatchInfo {
  private _available = false
  private _created = 0
  private _updated = 0
  private _deleted = 0

  private id ? : string
  private participants ? : PlayerName[] 
  private map ? : Map
  private gameMode ? : GameMode
  private gameType ? : GameType
  private teams ? : Team[]

  constructor (private ctx: PluginContext) {}

  public init (data : PreGameInit) {
    this._available = true
    this._created = new Date().getTime()
    this._updated = new Date().getTime()

    this.id = data.ID
    this.participants = data.participants
    this.teams = data.teams
    this.map = data.map
    this.gameMode = data.gameMode
    this.gameType = data.gameType
  }

  public updateTeam (teams : Team[]) {
    this._updated = new Date().getTime()
    this.teams = teams
  }

  public delete () {
    this.id = undefined
    this.participants = undefined
    this.teams = undefined
    this.map = undefined
    this.gameMode = undefined
    this.gameType = undefined

    this._available = false
    this._deleted = new Date().getTime()
  }
  
  public getState () : MatchInfoState {
    return {
      _available: this._available,
      _created: this._created,
      _updated: this._updated,
      _deleted: this._deleted,
      id: this.id,
      participants: this.participants,
      teams: this.teams,
      map: this.map,
      gameMode: this.gameMode,
      gameType: this.gameType,
    }
  }
}