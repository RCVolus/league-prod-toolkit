import fetch from 'node-fetch';

export default async function getGameVersion () {
  const gvRequest = await fetch("https://ddragon.leagueoflegends.com/api/versions.json")
  const gvJson = await gvRequest.json()
  return gvJson[0]
}