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
  `mongodb://${config.user}:${config.password}@${config.clusterUrl}:${config.port}/league-prod-toolkit?authSource=admin`;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,

  });

  async function init () {
    try {
      await client.connect();
      await client.db().createCollection('match')
    } catch (e) {
      ctx.log.error(e);
    }
  }
  init()

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request', async (e: any) => {
    if (!e.collection) {
      return ctx.log.warn('no collection passed for request')
    }

    try {
      const filter = e.filter ?? {};
      const sort = e.sort ?? {};
      const limit = e.limit ?? 10;

      const data = await client.db()
        .collection(e.collection)
        .find(filter)
        .sort(sort)
        .limit(limit)
        .toArray()

      ctx.LPTE.emit({
        meta: {
          type: e.meta.reply,
          namespace: 'reply',
          version: 1
        },
        data
      });
    } catch (err: any) {
      ctx.log.error(err.message);
    }
  });

  ctx.LPTE.on(namespace, 'insertOne', async (e: any) => {
    if (!e.collection) {
      return ctx.log.warn('no collection passed for insertOne')
    }

    try {
      const insert = await client.db()
        .collection(e.collection)
        .insertOne(e.data)

      ctx.LPTE.emit({
        meta: {
          type: e.meta.reply,
          namespace: 'reply',
          version: 1
        },
        id: insert.insertedId
      });
    } catch (err: any) {
      ctx.log.error(err.message);
    }
  });

  ctx.LPTE.on(namespace, 'updateOne', async (e: any) => {
    if (!e.collection || !e.id) {
      return ctx.log.warn('no collection or id passed for updateOne')
    }

    try {
      const query = { '_id': e.id };
      const values = { $set: e.data };

      await client.db()
        .collection(e.collection)
        .updateOne(query, values)

      ctx.LPTE.emit({
        meta: {
          type: e.meta.reply,
          namespace: 'reply',
          version: 1
        }
      });
    } catch (err: any) {
      ctx.log.error(err.message);
    }
  });

  ctx.LPTE.on(namespace, 'delete', async (e: any) => {
    if (!e.collection) {
      return ctx.log.warn('no collection or id passed for delete')
    }

    try {
      const filter = e.filter ?? {};

      await client.db()
        .collection(e.collection)
        .deleteMany(filter)
        
      ctx.LPTE.emit({
        meta: {
          type: e.meta.reply,
          namespace: 'reply',
          version: 1
        }
      });
    } catch (err: any) {
      ctx.log.error(err.message);
    }
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
