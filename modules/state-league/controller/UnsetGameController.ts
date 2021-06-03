import { LPTEvent } from 'league-prod-toolkit/core/eventbus/LPTE'
import { Controller } from './Controller'
import { state } from '../LeagueState'

export class UnsetGameController extends Controller {
  async handle (event: LPTEvent): Promise<void> {
    this.pluginContext.LPTE.emit({
      meta: {
        namespace: 'reply',
        type: e.meta.reply,
        version: 1
      }
    });
  }
}