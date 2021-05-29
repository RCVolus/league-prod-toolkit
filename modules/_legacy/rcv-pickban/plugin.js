const WebSocket = require('ws');

const namespace = 'rcv-pickban';

let config = {}
const initialState = {
  connected: false,
  data: {}
}

module.exports = async (ctx) => {
  const state = initialState;

  // Register new UI page
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'OP: rcv-pickban',
      frontend: 'frontend',
      id : 'op-rcv-pickban'
    }]
  });

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request', e => {
    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply,
        namespace: 'reply',
        version: 1
      },
      state
    });
  });

  // Emit event that we're ready to operate
  ctx.LPTE.emit({
    meta: {
      type: 'plugin-status-change',
      namespace: 'lpt',
      version: 1
    },
    status: 'RUNNING'
  });

  // Wait for all plugins to load
  await ctx.LPTE.await('lpt', 'ready', 1000000);

  const response = await ctx.LPTE.request({
    meta: {
      type: 'request',
      namespace: 'config',
      version: 1
    }
  });
  config = response.config;

  const connect = () => {
    const websocket = new WebSocket(config.backend);

    websocket.onopen = () => {
      ctx.log.debug('Websocket opened');
      ctx.log.info('Connection to pick-ban-ui succeeded!');
    }
    websocket.onclose = () => {
      ctx.log.debug('Connection to pick-ban-ui closed. Attempting reconnect in 500ms.');
      setTimeout(connect, 500);
    }
    websocket.onerror = (error) => {
      ctx.log.debug('Websocket error from pick-ban-ui: ' + JSON.stringify(error));
    }
  
    websocket.onmessage = msg => {
      const parsed = JSON.parse(msg.data)
      if (parsed.eventType === 'newState') {
        if (JSON.stringify(state.data) === '{}') {
          if (
            parsed.state.blueTeam.bans.length === 5 &&
            parsed.state.redTeam.bans.length === 5 &&
            parsed.state.blueTeam.picks.filter(pick => pick.champion.id === 0 && pick.isActive === false).length === 0 &&
            parsed.state.redTeam.picks.filter(pick => pick.champion.id === 0 && pick.isActive === false).length === 0) {
              ctx.log.info('Saved pick-ban order!')
              state.data = parsed.state;
            }
        }
      }
    }
  }

  connect();
};
