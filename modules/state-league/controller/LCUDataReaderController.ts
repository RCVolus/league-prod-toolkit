import { LPTEvent } from 'league-prod-toolkit/core/eventbus/LPTE'
import { Controller } from './Controller'
import { state } from '../LeagueState'
import convertChampselect from '../champselect'

export class LCUDataReaderController extends Controller {
  emitChampSelectUpdate (): void {
    this.pluginContext.LPTE.emit({
      meta: {
        namespace: 'state-league',
        type: 'champselect-update',
        version: 1
      },
      data: convertChampselect(state.lcu.champselect),
      isActive: state.lcu.champselect._available
    });
  }

  async handle (event: LPTEvent): Promise<void> {
    // Lobby
    if (event.meta.type === 'lcu-lobby-create') {
      state.lcu.lobby = event.data
      state.lcu.lobby._available = true
    }
    if (event.meta.type === 'lcu-lobby-update') {
      state.lcu.lobby = event.data
      state.lcu.lobby._available = true
    }
    if (event.meta.type === 'lcu-lobby-delete') {
      state.lcu.lobby._available = false
    }

    // Champ select
    if (event.meta.type === 'lcu-champ-select-create') {
      state.lcu.champselect = event.data
      state.lcu.champselect._available = true

      this.emitChampSelectUpdate()
    }
    if (event.meta.type === 'lcu-champ-select-update') {
      state.lcu.champselect = event.data
      state.lcu.champselect._available = true

      this.emitChampSelectUpdate()
    }
    if (event.meta.type === 'lcu-champ-select-delete') {
      state.lcu.champselect._available = false

      this.emitChampSelectUpdate()
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