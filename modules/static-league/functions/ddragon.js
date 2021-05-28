const { exec } = require("child_process");

module.exports = async function getDDragon(version, path) {
  const fileName = `dragontail-${version}.tgz`
  const zipURI = `https://ddragon.leagueoflegends.com/cdn/${fileName}`

  const cmd = `wget -qO- ${zipURI} | tar xvz -C '${path}'`

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      ctx.log.debug(`error: ${error.message}`);
      return Promise.reject();
    }
    if (stderr) {
      ctx.log.debug(`stderr: ${stderr}`);
      return Promise.reject();
    }
    
    return Promise.resolve()
  });
}