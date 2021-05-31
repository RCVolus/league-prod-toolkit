const fetch = require('node-fetch');

export default async function getGameVersion (ctx: any) {
  const gvRequest = await fetch("https://ddragon.leagueoflegends.com/api/versions.json")
  const gvJson = await gvRequest.json()
  return gvJson[0]
}