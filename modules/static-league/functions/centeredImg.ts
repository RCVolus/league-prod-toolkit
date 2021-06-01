import https from 'https';
import fs from 'fs';
import path from 'path';

const base = path.join(__dirname, '..', '..', 'data', 'img', 'champion', 'centered')

export default async function (ctx : any, gameVersion : string, cb : () => void) {
  if (!fs.existsSync(base)) {
    fs.mkdirSync(base, { recursive: true })
  }

  const champions : Array<any> = Object.values(require(`../../data/${gameVersion}/data/de_DE/champion.json`).data)
  ctx.log.info("start downloading centered images")

  for (const champ of champions) {
    const champId = champ.key
    await downloadImg(ctx, champId)
  }

  ctx.log.info("finish downloading centered images")
  cb()
}

async function downloadImg (ctx : any, id : number) {
  const dest = path.join(base, id.toString()) + '.jpg'
  const url = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-splashes/${id}/${id}000.jpg`

  var file = fs.createWriteStream(dest);
  await new Promise( (resolve, rejects) => {
    https.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close();
        ctx.log.debug(`downloaded img for ${id}`)
        resolve(true)
      });
    }).on('error', function(err) {
      fs.unlink(dest, () => {
        ctx.log.error(`downloaded failed img for ${id} with: ${err.message}`)
        rejects(err)
      });
    })
  })
};