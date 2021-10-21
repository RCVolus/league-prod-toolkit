import { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { PostGameState } from '../types/GameSets'
import { Match as MatchData } from '../types/Match'

export class PostGame {
  private _available = false
  private _created = 0
  private _updated = 0
  private _deleted = 0

  private data ? : MatchData

  constructor (private ctx: PluginContext) {}

  public init (data : MatchData) {
    this._available = true
    this._created = new Date().getTime()
    this._updated = new Date().getTime()

    this.data = data
  }

  public delete () {
    this.data = undefined
    this._available = false
    this._deleted = new Date().getTime()
  }
  
  public getState () : PostGameState {
    return {
      _available: this._available,
      _created: this._created,
      _updated: this._updated,
      _deleted: this._deleted,
      ...this.data
    }
  }
}