const { saveImagesToCSV } = require('./fileHepler')
const axios = require('axios')

// 提取括号内的版权信息
function extractCopyright(desc) {
  const match = desc.match(/\((.*?)\)/);
  return match ? match[1] : '';
}

// 提取描述文本（去掉版权信息）
function extractDescription(desc) {
  return desc.replace(/\s*\(.*?\)\s*$/, '').trim();
}

;(async () => {
  try {
    // 使用 Bing 壁纸 API 获取最近30天的壁纸
    const response = await axios.get('https://www.bing.com/HPImageArchive.aspx', {
      params: {
        format: 'js',
        idx: 0,     // 起始图片的索引（0表示今天，1表示昨天，依次类推）
        n: 8,      // API 限制最多一次返回8张图片
        mkt: 'zh-CN'
      }
    });

    const images = response.data.images;
    console.log(`获取到 ${images.length} 张壁纸信息`, images[0]);

    // 处理每张壁纸的信息
    const wallpapers = images.map(imageData => {
      const wallpaperObj = {
        imgUrl: `https://www.bing.com${imageData.url}`,
        title: imageData.title,
        credit: imageData.copyright,
        description: extractDescription(imageData.copyright), // 提取描述文本
        copyright: extractCopyright(imageData.copyright), // 提取版权信息
        date: imageData.startdate,
        fullDate: `${imageData.startdate.slice(0, 4)}-${imageData.startdate.slice(4, 6)}-${imageData.startdate.slice(6, 8)}`
      };
      return wallpaperObj;
    });

    // 按日期排序（从新到旧）
    wallpapers.sort((a, b) => a.fullDate < b.fullDate ? 1 : -1);

    // console.log('wallpapers--- ', wallpapers);

    // 保存所有壁纸信息
    for (let i = 0; i < wallpapers.length; i++) {
      const wallpaper = wallpapers[i];
      await saveImagesToCSV(wallpaper);
    }

  } catch (error) {
    console.error('获取壁纸信息失败:', error);
  }
})()

