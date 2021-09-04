import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { AllGameData, Player } from '../types/AllGameData'
import { Config } from '../types/Config'
import { ItemEpicness } from '../types/Items'

export class InGameState {

  public gameData : any[] = []
  public itemEpicness : number[]

  constructor (
    private namespace: string,
    private ctx: PluginContext,
    private config: Config,
    private statics: any
  ) {
    this.itemEpicness = this.config.items.map(i => ItemEpicness[i])
  }

  public handelData (allGameData: AllGameData) : void {
    if (this.gameData.length > 0) {
      const previousGameData = this.gameData[this.gameData.length -1]
      this.checkPlayerUpdate(allGameData, previousGameData)
    }

    this.gameData.push(allGameData)
  }

  private checkPlayerUpdate (allGameData: AllGameData, previousGameData: AllGameData) {
    if (this.config.items.length === 0) return
    if (allGameData.allPlayers.length === 0 || previousGameData.allPlayers.length === 0) return

    allGameData.allPlayers.forEach((player, i) => {
      this.checkItemUpdate(player, previousGameData.allPlayers[i], i)
      this.checkLevelUpdate(player, previousGameData.allPlayers[i], i)
    })
  }

  private checkLevelUpdate (currentPlayerState: Player, previousPlayerState: Player, id: number) {
    if (previousPlayerState === undefined) return
    if (currentPlayerState.level === previousPlayerState.level) return
    if (!this.config.level.includes(currentPlayerState.level.toString())) return

    this.ctx.LPTE.emit({
      meta: {
        type: 'levelUpdate',
        namespace: this.namespace,
        version: 1
      },
      team: currentPlayerState.team,
      player: id,
      level: currentPlayerState.level
    })
  }

  private checkItemUpdate (currentPlayerState: Player, previousPlayerState: Player, id: number) {
    if (previousPlayerState === undefined) return

    const previousItems = previousPlayerState.items

    for (const item of currentPlayerState.items) {

      const itemID = item.itemID
      if (previousItems.find(i => i.itemID === itemID)) continue

      const itemBinFind = this.statics.itemBin.find((i: any) => i.itemID === itemID)
      if (itemBinFind === undefined) continue

      if (!this.itemEpicness.includes(itemBinFind.epicness)) continue

      this.ctx.LPTE.emit({
        meta: {
          type: 'itemUpdate',
          namespace: this.namespace,
          version: 1
        },
        team: currentPlayerState.team,
        player: id,
        item: itemID
      })
    }
  }
}