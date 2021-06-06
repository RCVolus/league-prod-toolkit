import { LPTEvent } from 'league-prod-toolkit/core/eventbus/LPTE';
import { PluginContext } from 'league-prod-toolkit/core/modules/Module';

export abstract class Controller {
  pluginContext: PluginContext

  constructor (pluginContext: PluginContext) {
    this.pluginContext = pluginContext
  }

  abstract handle (event: LPTEvent): Promise<void>
}