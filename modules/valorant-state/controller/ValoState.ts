import { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { MatchInfo } from "./MatchInfo";
import { PreGame } from "./PreGame";
import { PostGame } from "./PostGame";
import { GameSets } from '../types/GameSets';
import { Player } from '../types/Match'

export class ValoState {

  public sessionLoopState : "MENUS" | "PREGAME" | "INGAME" = "MENUS"

  preGame : PreGame 
  matchInfo : MatchInfo
  postGame : PostGame
  mvp ? : Player

  gameSets : GameSets = {}

  constructor (private ctx: PluginContext) {
    this.preGame = new PreGame(ctx)
    this.matchInfo = new MatchInfo(ctx)
    this.postGame = new PostGame(ctx)
  }

  public getState () {
    return {
      loopState: this.sessionLoopState,
      matchInfo: this.matchInfo.getState(),
      preGame: this.preGame.getState(),
      postGame: this.postGame.getState(),
      mvp: this.mvp
    }
  }
}