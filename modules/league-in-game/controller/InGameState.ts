import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { AllGameData, Player, Event } from '../types/AllGameData'
import { Config } from '../types/Config'
import { ItemEpicness } from '../types/Items'
import { InGameState as InGameStateType } from '../types/InGameState'

export class InGameState {

  public gameState : InGameStateType
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

    this.gameState = {
      towers : {
        100 : {
          L : {},
          C : {},
          R : {}
        },
        200 : {
          L : {},
          C : {},
          R : {}
        },
      },
      showInhibitors : null,
      inhibitors : {
        100 : {
          L1 : {
            alive : true,
            respawnAt : 0,
            respawnIn : 0,
            percent : 0
          },
          C1 : {
            alive : true,
            respawnAt : 0,
            respawnIn : 0,
            percent : 0
          },
          R1 : {
            alive : true,
            respawnAt : 0,
            respawnIn : 0,
            percent : 0
          }
        },
        200 : {
          L1 : {
            alive : true,
            respawnAt : 0,
            respawnIn : 0,
            percent : 0
          },
          C1 : {
            alive : true,
            respawnAt : 0,
            respawnIn : 0,
            percent : 0
          },
          R1 : {
            alive : true,
            respawnAt : 0,
            respawnIn : 0,
            percent : 0
          }
        },
      },
      player : {
        0 : {
          level : 0,
          items : new Set(),
        },
        1 : {
          level : 0,
          items : new Set(),
        },
        2 : {
          level : 0,
          items : new Set(),
        },
        3 : {
          level : 0,
          items : new Set(),
        },
        4 : {
          level : 0,
          items : new Set(),
        },
        5 : {
          level : 0,
          items : new Set(),
        },
        6 : {
          level : 0,
          items : new Set(),
        },
        7 : {
          level : 0,
          items : new Set(),
        },
        8 : {
          level : 0,
          items : new Set(),
        },
        9 : {
          level : 0,
          items : new Set(),
        }
      }
    }

    this.ctx.LPTE.emit({
      meta: {
        namespace: this.namespace,
        type: 'update',
        version: 1
      },
      state : this.gameState
    })
  }

  public handelData (allGameData: AllGameData) : void {
    if (this.gameData.length > 0) {
      const previousGameData = this.gameData[this.gameData.length -1]
      this.checkPlayerUpdate(allGameData)
      this.checkEventUpdate(allGameData, previousGameData)

      this.actions.forEach((func, i) => {
        func(allGameData, i)
      })
    }

    this.gameData.push(allGameData)
  }

  private checkPlayerUpdate (allGameData: AllGameData) {
    if (this.config.items.length === 0) return
    if (allGameData.allPlayers.length === 0) return

    allGameData.allPlayers.forEach((player, i) => {
      this.checkItemUpdate(player, i)
      this.checkLevelUpdate(player, i)
    })
  }

  private checkLevelUpdate (currentPlayerState: Player, id: number) {
    if (currentPlayerState.level === this.gameState.player[id].level) return
    if (!this.config.level.includes(currentPlayerState.level.toString())) return

    this.gameState.player[id].level = currentPlayerState.level

    this.ctx.LPTE.emit({
      meta: {
        type: 'level-update',
        namespace: this.namespace,
        version: 1
      },
      team: currentPlayerState.team === "ORDER" ? 100 : 200,
      player: id,
      level: currentPlayerState.level
    })
  }

  private checkItemUpdate (currentPlayerState: Player, id: number) {
    const previousItems = this.gameState.player[id].items

    for (const item of currentPlayerState.items) {

      const itemID = item.itemID
      if (previousItems.has(itemID)) continue

      const itemBinFind = this.statics.itemBin.find((i: any) => i.itemID === itemID)
      if (itemBinFind === undefined) continue

      if (!this.itemEpicness.includes(itemBinFind.epicness)) continue

      this.gameState.player[id].items.add(itemID)

      this.ctx.LPTE.emit({
        meta: {
          type: 'item-update',
          namespace: this.namespace,
          version: 1
        },
        team: currentPlayerState.team === "ORDER" ? 100 : 200,
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
        this.handleInhibEvent(event)
      } else if (event.EventName === "TurretKilled") {
        this.handleTowerEvent(event)
      }
    })
  }

  private handleInhibEvent (event: Event) {
    console.log(event)
    const split = event.InhibKilled.split('_') as string[]
    const team = split[1] === 'T1' ? 100 : 200
    const lane = split[2] as 'L1' | 'C1' | 'R1'
    const respawnAt = Math.round(event.EventTime) + (60 * 5)

    console.log(this.gameState.inhibitors[team][lane].alive)

    if (!this.gameState.inhibitors[team][lane].alive) return

    this.gameState.inhibitors[team][lane] = {
      alive : false,
      respawnAt : respawnAt,
      respawnIn : (60 * 5),
      percent : 100
    }

    this.actions.push((allGameData, i) => {
      const gameState = allGameData.gameData
      const diff = respawnAt - Math.round(gameState.gameTime)
      const percent = Math.round((diff * 100) / (60 * 5))

      this.gameState.inhibitors[team][lane] = {
        alive : false,
        respawnAt : respawnAt,
        respawnIn : diff,
        percent : 100
      }

      this.ctx.LPTE.emit({
        meta: {
          namespace: this.namespace,
          type: 'inhib-update',
          version: 1
        },
        team,
        lane,
        percent,
        respawnIn: diff
      })

      if (diff <= 0) {
        this.gameState.inhibitors[team][lane] = {
          alive : true,
          respawnAt : 0,
          respawnIn : 0,
          percent : 0
        }
        this.actions.splice(i, 1)
      }
    })
  }

  private handleTowerEvent (event: Event) {
    console.log(event)
    const split = event.TurretKilled.split('_') as string[]
    const team = split[1] === 'T1' ? 100 : 200
    const lane = split[2] as 'L' | 'C' | 'R'
    const turret = split[3]

    console.log(this.gameState.towers[team][lane][turret])
    if (this.gameState.towers[team][lane][turret] === false) return

    this.gameState.towers[team][lane][turret] = false

    this.ctx.LPTE.emit({
      meta: {
        namespace: this.namespace,
        type: 'tower-update',
        version: 1
      },
      team,
      lane,
      turret
    })
  }
}