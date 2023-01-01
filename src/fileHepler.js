const fs = require('fs')

function writeUrlToFile(obj) {
  const { title, bgUrl, credit, desc = '' } = obj
  const lineFormat = `${title},${bgUrl},${credit},${desc.replace(',', '，')}\n`

  fs.appendFile('./bing-wallpaper.csv', lineFormat, (err) => {
    if (err) throw err
    console.log('写入成功!')
  })
}

module.exports = {
  writeUrlToFile,
}
