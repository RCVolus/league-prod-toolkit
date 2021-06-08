import { LPTEvent } from 'league-prod-toolkit/core/eventbus/LPTE'
import { Controller } from './Controller'
import { state } from '../LeagueState'

export class RequestController extends Controller {
  async handle (event: LPTEvent): Promise<void> {
    this.pluginContext.LPTE.emit({
      meta: {
        type: event.meta.reply as string,
        namespace: 'reply',
        version: 1
      },
      state
    })
  }
}