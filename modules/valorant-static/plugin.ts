import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import axios from 'axios'

const namespace = 'valorant-static';

interface StaticData {
  versionData: {
    manifestId: string
    branch: string
    version: string
    buildVersion: number
    riotClientVersion: string
    buildDate: Date,
    niceVersion: string
  }
}

module.exports = async (ctx: PluginContext) => {
  const staticData = {} as StaticData

  ctx.LPTE.emit({
    meta: {
      type: 'add-serves',
      namespace: 'ui',
      version: 1
    },
    serves: [{
      frontend: 'frontend',
      id: 'valorant-static'
    }]
  });

  const versionResponse = await axios.get('https://valorant-api.com/v1/version');
  staticData.versionData = versionResponse.data.data;

  const splitVersion = staticData.versionData.version.split('.');
  const niceVersion = splitVersion.length >= 2 ? splitVersion[0] + "." + splitVersion[1] : ''

  staticData.versionData.niceVersion = niceVersion

  ctx.LPTE.on(namespace, 'request-constants', (e: any) => {
    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply,
        namespace: 'reply',
        version: 1,
        reply: e.meta.reply
      },
      constants: staticData
    });
  });

  ctx.LPTE.emit({
    meta: {
      type: 'plugin-status-change',
      namespace: 'lpt',
      version: 1
    },
    status: 'RUNNING'
  });
};
