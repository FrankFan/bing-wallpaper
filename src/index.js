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
    // 一次性获取100张Bing壁纸（API每次最多8张，需要多次请求）
    const total = 100;
    const maxPerRequest = 8;
    let allImages = [];
    
    // 计算需要多少次请求
    const requestCount = Math.ceil(total / maxPerRequest);
    
    for (let i = 0; i < requestCount; i++) {
      const idx = i * maxPerRequest;  // 从今天往前数第几天
      const n = Math.min(maxPerRequest, total - (i * maxPerRequest));  // 本次请求获取的数量
      
      console.log(`正在获取第 ${i + 1}/${requestCount} 批图片，idx=${idx}, n=${n}`);
      
      const response = await axios.get('https://www.bing.com/HPImageArchive.aspx', {
        params: {
          format: 'js',
          idx: idx, // 从今天往前数第几天
          n: n,
          mkt: 'zh-CN'
        }
      });
      allImages = allImages.concat(response.data.images);
    }

    console.log(`获取到 ${allImages.length} 张壁纸信息`);
    console.log(allImages);
    

    // 去重处理
    const uniqueImages = [];
    const seen = new Set();
    for (const imageData of allImages) {
      const fullDate = `${imageData.startdate.slice(0, 4)}-${imageData.startdate.slice(4, 6)}-${imageData.startdate.slice(6, 8)}`;
      if (!seen.has(fullDate)) {
        seen.add(fullDate);
        uniqueImages.push(imageData);
      }
    }

    console.log(`去重后剩余 ${uniqueImages.length} 张壁纸信息`);

    // 处理每张壁纸的信息
    const wallpapers = uniqueImages.map(imageData => {
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

    console.log('----- wallpapers--- ', wallpapers);

    // 保存所有壁纸信息
    // for (let i = 0; i < wallpapers.length; i++) {
    //   const wallpaper = wallpapers[i];
    //   await saveImagesToCSV(wallpaper);
    // }

  } catch (error) {
    console.error('获取壁纸信息失败:', error);
  }
})()

