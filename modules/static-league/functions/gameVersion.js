const fetch = require('node-fetch');

module.exports = async function getGameVersion (ctx) {
  const gvRequest = await fetch("https://ddragon.leagueoflegends.com/api/versions.json")
  const gvJson = await gvRequest.json()
  return gvJson[0]
}