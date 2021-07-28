import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export default async function (ctx : PluginContext, gameVersion : string) {
  const base = path.join(__dirname, '..', '..', 'data', gameVersion, 'data', 'de_DE')
  const versionSplit = gameVersion.split('.')
  const mainVersion = `${versionSplit[0]}.${versionSplit[1]}`

  // Item Bin
  const itemBinUri = `https://raw.communitydragon.org/${mainVersion}/game/global/items/items.bin.json`
  const itemBinRes = await fetch(itemBinUri)
  const itemBin = await itemBinRes.json()
  const itemBinPath = path.join(base, 'item.bin.json')
  fs.writeFile(itemBinPath, JSON.stringify(itemBin), function(err) {
    if (err) ctx.log.error(err.message);
  });

  ctx.log.info("finish downloading additional files")
}