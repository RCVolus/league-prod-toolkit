const config = require('./config.json');
const fs = require('fs');
const path = require('path');

module.exports = (ctx) => {
  ctx.LPTE.on('config', 'request', e => {
    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply,
        namespace: 'reply',
        version: 1
      },
      config: config[e.meta.sender.name]
    });
  });

  ctx.LPTE.on('config', 'set', e => {
    for (const key of Object.keys(e.config)) {
      config[e.meta.sender.name][key] = e.config[key]
    }

    fs.writeFile(path.join(__dirname, './config.json'), JSON.stringify(config, null, 2), function (err) {
      if (err) return ctx.log.error(err);
      ctx.log.info('config for ' + e.meta.sender.name + ' saved!');
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
};
