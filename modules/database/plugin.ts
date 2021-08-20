import { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import type { Config } from './types/Config'
import { MongoClient, Collection, ObjectID, ObjectId } from 'mongodb';

const namespace = 'database';

module.exports = async (ctx: PluginContext) => {
  const configRes = await ctx.LPTE.request({
    meta: {
      type: 'request',
      namespace: 'config',
      version: 1
    }
  });
  if (configRes === undefined) {
    return ctx.log.warn(`${namespace} config could not be loaded`)
  }
  const config = configRes.config as unknown as Config;

  let collections : Collection<any>[] = []

  const dbName = 'league-prod-toolkit'

  let uri: string;
  if (config.password === '') {
    uri =
      `mongodb://${config.clusterUrl}:${config.port}/league-prod-toolkit`;
  } else {
    uri =
      `mongodb://${config.user}:${config.password}@${config.clusterUrl}:${config.port}/${dbName}?authSource=admin`;
  }

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  async function init () {
    try {
      await client.connect();
      collections = await client.db().collections()
    } catch (e) {
      ctx.log.error(JSON.stringify(e));
    }
  }
  init()

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'createCollection', async (e: any) => {
    if (!e.collection) {
      return ctx.log.warn('no collection passed for createCollection')
    }

    if (collections.length > 0) {
      const finding = collections.find(c => 
        c.collectionName == e.collection
      )

      if (finding !== undefined) {
        return ctx.log.debug(`collection ${e.collection} already exists`)
      }
    }

    try {
      await client.db().createCollection(e.collection)
      collections = await client.db().collections()
    } catch (err: any) {
      ctx.log.error(err.message);
    }
  });

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request', async (e: any) => {
    if (!e.collection) {
      return ctx.log.warn('no collection passed for request')
    }

    try {
      const filter = e.filter || {};
      const sort = e.sort || {};
      const limit = e.limit || 10;

      if (e.id !== undefined) {
        if (Array.isArray(e.id)) {
          filter['_id'] = {
            $in: e.id.map((id : any) => new ObjectId(id))
          }
        } else {
          filter['_id'] = new ObjectId(e.id)
        }
      }

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
      const filter = e.filter || {};
      await client.db()
        .collection(e.collection)
        .deleteMany(filter)
    } catch (err: any) {
      ctx.log.error(err.message);
    }
  });

  ctx.LPTE.on(namespace, 'deleteOne', async (e: any) => {
    if (!e.collection || !e.id) {
      return ctx.log.warn('no collection or id passed for updateOne')
    }

    try {
      const query = { '_id': new ObjectID(e.id) };

      await client.db()
        .collection(e.collection)
        .deleteOne(query)

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
