const fs = require('fs')

function writeUrlToFile(obj) {
  const { title, bgUrl, credit, desc = '' } = obj
  const lineFormat = `${title},${bgUrl},${credit},${desc.replace(',', '，')}\n`

  fs.appendFile('./bing-wallpaper.csv', lineFormat, (err) => {
    if (err) throw err
    console.log('写入成功!')
  })
}

function saveImagesToCSV(imgInfo) {
  const { title, imgUrl, description = '', copyright = '', fullDate } = imgInfo;
  const lineFormat = `${fullDate},${title},${description},${copyright},${imgUrl}\n`

  return new Promise((resolve, reject) => {
    fs.appendFile('./bing-wallpaper-v4.csv', lineFormat, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('写入成功!');
      resolve();
    });
  });
}

module.exports = {
  writeUrlToFile,
  saveImagesToCSV
}
