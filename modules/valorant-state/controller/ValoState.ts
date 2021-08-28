import { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { MatchInfo } from "./MatchInfo";
import { PreGame } from "./PreGame";

export class ValoState {

  public sessionLoopState ? : "MENUS" | "PREGAME" | "INGAME"

  preGame : PreGame 
  matchInfo : MatchInfo

  constructor (private ctx: PluginContext) {
    this.preGame = new PreGame(ctx)
    this.matchInfo = new MatchInfo(ctx)
  }

  public getState () {
    return {
      loopState: this.sessionLoopState,
      matchInfo: this.matchInfo.getState(),
      preGaem: this.preGame.getState()
    }
  }
}