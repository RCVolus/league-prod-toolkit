import type { Config } from './types/Config'
import { MongoClient } from 'mongodb';

const namespace = 'database';

module.exports = async (ctx: any) => {
  const response = await ctx.LPTE.request({
    meta: {
      type: 'request',
      namespace: 'config',
      version: 1
    }
  });
  const config = response.config as Config;

  const uri =
  `mongodb://${config.user}:${config.password}@${config.clusterUrl}:${config.port}?retryWrites=true&writeConcern=majority`;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  async function connect() {
    try {
      await client.connect();
    } catch (e) {
      ctx.log.error(e);
    }
  }

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request', async (e: any) => {
    if (!e.collection) {
      return ctx.LPTE.emit({
        meta: {
          type: e.meta.reply,
          namespace: 'reply',
          version: 1
        },
      });
    }

    await connect()

    const db = client.db('league-prod-toolkit');
    db.collection(e.collection).find({}).toArray(function(err, data) {
      if (err) {
        return ctx.log.error(err.message);
      };

      ctx.LPTE.emit({
        meta: {
          type: e.meta.reply,
          namespace: 'reply',
          version: 1
        },
        data 
      });
      client.close();
    });
  });

  ctx.LPTE.on(namespace, 'insertOne', async (e: any) => {
    if (!e.collection) {
      return ctx.log.warn('no collection passed for insertOne')
    }

    await connect()

    const db = client.db('league-prod-toolkit');
    db.collection(e.collection).insertOne(e.data, function(err, res) {
      if (err) {
        return ctx.log.error(err.message);
      };

      ctx.LPTE.emit({
        meta: {
          type: e.meta.reply,
          namespace: 'reply',
          version: 1
        },
        id: res.insertedId
      });

      client.close();
    });
  });

  ctx.LPTE.on(namespace, 'updateOne', async (e: any) => {
    if (!e.collection || !e.id) {
      return ctx.log.warn('no collection or id passed for updateOne')
    }

    await connect()

    const db = client.db('league-prod-toolkit');
    var query = { _id: e.id };
    var values = { $set: e.data };
    db.collection(e.collection).updateOne(query, values, function(err, res) {
      if (err) {
        return ctx.log.error(err.message);
      }
      client.close();
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
