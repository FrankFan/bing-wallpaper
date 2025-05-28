const puppeteer = require('puppeteer')
const { writeUrlToFile } = require('./fileHepler')
const axios = require('axios')

;(async () => {
  try {
    // 使用 Bing 壁纸 API
    const response = await axios.get('https://www.bing.com/HPImageArchive.aspx', {
      params: {
        format: 'js',
        idx: 1,  // 0 表示今天
        n: 2,    // 获取1张图片
        mkt: 'zh-CN'
      }
    });

    const imageData = response.data.images[0];
    console.log('获取到的图片数据:', imageData);

    const bingWallpaperObj = {
      bgUrl: `https://www.bing.com${imageData.url}`,
      title: imageData.title,
      credit: imageData.copyright,
      desc: imageData.copyright
    };

    console.log('壁纸信息:', bingWallpaperObj);
    // writeUrlToFile(bingWallpaperObj);
  } catch (error) {
    console.error('获取壁纸信息失败:', error);
  }
})()

