const fs = require('fs');
const path = require('path');
const tar = require('tar');
const https = require('https');

module.exports = function getDDragon(version, ctx, cb) {
  const fileName = `dragontail-${version}.tgz`
  const filePath = path.join(__dirname, '..', 'data', fileName)
  const zipURI = `https://ddragon.leagueoflegends.com/cdn/${fileName}`
  const dataPath = path.join(__dirname, '..', 'data')

  const file = fs.createWriteStream(filePath);
  const request = https.get(zipURI, function(response) {
    response.pipe(file);
    file.on("finish", function () {
      ctx.log.debug('finish')
      file.close(unzip);
    })
    ctx.log.debug('download')
  }).on('error', function(err) { // Handle errors
    fs.unlink(filePath);
    ctx.log.debug(err.message)
  });

  function unzip () {
    ctx.log.debug('unzip')
    fs.createReadStream(filePath)
    .on('error', ctx.log.debug)
    .pipe(tar.x({ cwd: dataPath, file: filePath, newer: true }, undefined , function(err) {
      ctx.log.debug('test')
      cb()
    }))
  }
}