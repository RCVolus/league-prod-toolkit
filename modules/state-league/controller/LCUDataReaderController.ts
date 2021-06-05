import { LPTEvent } from 'league-prod-toolkit/core/eventbus/LPTE'
import { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { Controller } from './Controller'
import { state } from '../LeagueState'
import { convertState } from '../champselect/convertState'
import { leagueStatic } from '../plugin'

export class LCUDataReaderController extends Controller {
  leagueStatic: any
  refreshTask?: NodeJS.Timeout

  constructor (pluginContext: PluginContext) {
    super(pluginContext)

    this.emitChampSelectUpdate = this.emitChampSelectUpdate.bind(this)
  }

  emitChampSelectUpdate (): void {
    this.pluginContext.LPTE.emit({
      meta: {
        namespace: 'state-league',
        type: 'champselect-update',
        version: 1
      },
      data: convertState(state, state.lcu.champselect as any, leagueStatic),
      isActive: state.lcu.champselect._available
    });
  }

  async handle (event: LPTEvent): Promise<void> {
    // Lobby
    if (event.meta.type === 'lcu-lobby-create') {
      state.lcu.lobby = { ...state.lcu.lobby, ...event.data }
      state.lcu.lobby._available = true
      state.lcu.lobby._created = new Date()
      state.lcu.lobby._updated = new Date()
    }
    if (event.meta.type === 'lcu-lobby-update') {
      state.lcu.lobby = { ...state.lcu.lobby, ...event.data }
      state.lcu.lobby._available = true
      state.lcu.lobby._updated = new Date()
    }
    if (event.meta.type === 'lcu-lobby-delete') {
      state.lcu.lobby._available = false
      state.lcu.lobby._deleted = new Date()
    }

    // Champ select
    if (event.meta.type === 'lcu-champ-select-create') {
      state.lcu.champselect = { ...state.lcu.champselect, ...event.data }
      state.lcu.champselect._available = true
      state.lcu.champselect._created = new Date()
      state.lcu.champselect._updated = new Date()

      if (!this.refreshTask) {
        this.refreshTask = setInterval(this.emitChampSelectUpdate, 500);
      }

      this.emitChampSelectUpdate()

      this.pluginContext.log.info('Flow: champselect - active')
    }
    if (event.meta.type === 'lcu-champ-select-update') {
      state.lcu.champselect = { ...state.lcu.champselect, ...event.data }
      state.lcu.champselect._available = true
      state.lcu.champselect._updated = new Date()

      if (!this.refreshTask) {
        this.refreshTask = setInterval(this.emitChampSelectUpdate, 500);
      }

      this.emitChampSelectUpdate()
    }
    if (event.meta.type === 'lcu-champ-select-delete') {
      state.lcu.champselect._available = false
      state.lcu.champselect._deleted = new Date()

      if (this.refreshTask) {
        clearInterval(this.refreshTask)
      }

      this.emitChampSelectUpdate()

      this.pluginContext.log.info('Flow: champselect - inactive')

      // Continue in flow
      this.pluginContext.log.info('')
    }

    // End of game
    if (event.meta.type === 'lcu-end-of-game-create') {
      state.lcu.eog = event.data
      state.lcu.eog._available = true
    }
    if (event.meta.type === 'lcu-end-of-game-delete') {
      state.lcu.eog._available = false
    }
  }
}