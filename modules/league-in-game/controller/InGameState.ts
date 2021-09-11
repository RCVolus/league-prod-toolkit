import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { AllGameData, Player, Event } from '../types/AllGameData'
import { Config } from '../types/Config'
import { ItemEpicness } from '../types/Items'

export class InGameState {

  public gameData : any[] = []
  public itemEpicness : number[]

  public actions : Array<(allGameData : AllGameData, i: number) => void> = []

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
      this.checkEventUpdate(allGameData, previousGameData)

      this.actions.forEach((func, i) => {
        func(allGameData, i)
      })
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

  // ---

  private checkEventUpdate (allGameData: AllGameData, previousGameData: AllGameData) {
    if (allGameData.events.Events.length === 0 || previousGameData.events.Events.length === 0) return

    const newEvents = allGameData.events.Events.slice(previousGameData.events.Events.length)

    newEvents.forEach(event => {
      if (event.EventName === "InhibKilled") {
        this.handleBaronEvent(event)
      }
    })
  }

  private handleBaronEvent (event: Event) {
    const split = event.InhibKilled.split('_') as string[]
    const team = split[1] === 'T1' ? 100 : 200
    const lane = split[2]
    const respawnAt = Math.round(event.EventTime) + (60 * 5)

    this.actions.push((allGameData, i) => {
      const gameState = allGameData.gameData
      const diff = respawnAt - Math.round(gameState.gameTime)
      const percent = Math.round((diff * 100) / (60 * 5))

      this.ctx.LPTE.emit({
        meta: {
          namespace: this.namespace,
          type: 'inhibUpdate',
          version: 1
        },
        team,
        lane,
        percent
      })

      if (diff <= 0) {
        this.actions.splice(i, 1)
      }
    })
  }
}