const { exec } = require("child_process");

module.exports = function getDDragon(version, path, cb) {
  const fileName = `dragontail-${version}.tgz`
  const zipURI = `https://ddragon.leagueoflegends.com/cdn/${fileName}`

  const cmd = `wget -qO- ${zipURI} | tar xvz -C '${path}'`

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      ctx.log.debug(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      ctx.log.debug(`stderr: ${stderr}`);
      return;
    }
    
    return cb()
  });
}