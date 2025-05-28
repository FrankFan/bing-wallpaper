const https = require('https');
const fs = require('fs');

class BingWallpaperFetcher {
    constructor() {
        this.baseUrl = 'https://www.bing.com/HPImageArchive.aspx';
        this.imageBaseUrl = 'https://www.bing.com';
    }

    /**
     * 获取指定日期的壁纸信息
     * @param {number} idx - 天数索引，0表示今天，1表示昨天，依此类推
     * @param {number} n - 获取图片数量，最大8
     * @param {string} mkt - 市场区域，默认 'zh-CN'
     * @returns {Promise<Object>} 壁纸信息
     */
    async fetchWallpaperData(idx = 0, n = 1, mkt = 'zh-CN') {
        const url = `${this.baseUrl}?format=js&idx=${idx}&n=${n}&mkt=${mkt}`;
        
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } catch (error) {
                        reject(new Error(`解析JSON失败: ${error.message}`));
                    }
                });
            }).on('error', (error) => {
                reject(new Error(`请求失败: ${error.message}`));
            });
        });
    }

    /**
     * 格式化壁纸信息
     * @param {Object} imageData - 原始图片数据
     * @returns {Object} 格式化后的壁纸信息
     */
    formatWallpaperInfo(imageData) {
        const {
            startdate,
            fullstartdate,
            enddate,
            url,
            urlbase,
            copyright,
            copyrightlink,
            title,
            quiz,
            wp,
            hsh,
            drk,
            top,
            bot,
            hs
        } = imageData;

        return {
            date: startdate,
            fullDate: fullstartdate,
            endDate: enddate,
            title: title || copyright.split(' (')[0], // 从copyright中提取标题
            description: copyright,
            copyright: copyright,
            copyrightLink: copyrightlink,
            urls: {
                // 原始URL
                original: this.imageBaseUrl + url,
                // 不同分辨率的URL
                uhd: this.imageBaseUrl + urlbase + '_UHD.jpg', // 超高清
                '1920x1080': this.imageBaseUrl + urlbase + '_1920x1080.jpg',
                '1366x768': this.imageBaseUrl + urlbase + '_1366x768.jpg',
                '1280x720': this.imageBaseUrl + urlbase + '_1280x720.jpg',
                '1024x768': this.imageBaseUrl + urlbase + '_1024x768.jpg',
                // 手机竖屏
                '1080x1920': this.imageBaseUrl + urlbase + '_1080x1920.jpg',
                '768x1366': this.imageBaseUrl + urlbase + '_768x1366.jpg'
            },
            quiz: quiz,
            hash: hsh,
            hotspots: hs || []
        };
    }

    /**
     * 获取上个月的所有壁纸
     * @param {string} mkt - 市场区域
     * @returns {Promise<Array>} 上个月的壁纸信息数组
     */
    async getLastMonthWallpapers(mkt = 'zh-CN') {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const daysInLastMonth = lastMonthEnd.getDate();
        
        console.log(`正在获取 ${lastMonth.getFullYear()}年${lastMonth.getMonth() + 1}月 的壁纸信息...`);
        console.log(`该月共有 ${daysInLastMonth} 天`);

        const wallpapers = [];
        const today = new Date();
        
        // 计算从今天到上个月第一天的天数差
        const daysDiff = Math.floor((today - lastMonth) / (1000 * 60 * 60 * 24));
        
        for (let day = 1; day <= daysInLastMonth; day++) {
            // 计算这一天相对于今天的索引
            const targetDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), day);
            const idx = Math.floor((today - targetDate) / (1000 * 60 * 60 * 24));
            
            // Bing API 限制：最多只能获取过去7-8天的数据
            if (idx > 7) {
                console.log(`跳过 ${targetDate.toISOString().split('T')[0]}，超出API限制范围`);
                continue;
            }

            try {
                console.log(`获取第 ${day} 天的壁纸 (索引: ${idx})...`);
                
                const data = await this.fetchWallpaperData(idx, 1, mkt);
                
                if (data.images && data.images.length > 0) {
                    const wallpaperInfo = this.formatWallpaperInfo(data.images[0]);
                    wallpapers.push(wallpaperInfo);
                    console.log(`✓ 成功获取: ${wallpaperInfo.date} - ${wallpaperInfo.title}`);
                }
                
                // 添加延迟避免请求过于频繁
                await this.sleep(500);
                
            } catch (error) {
                console.error(`获取第 ${day} 天壁纸失败:`, error.message);
            }
        }

        return wallpapers.sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * 获取最近N天的壁纸（Bing API支持的范围）
     * @param {number} days - 天数，最大7-8天
     * @param {string} mkt - 市场区域
     * @returns {Promise<Array>} 壁纸信息数组
     */
    async getRecentWallpapers(days = 7, mkt = 'zh-CN') {
        console.log(`正在获取最近 ${days} 天的壁纸信息...`);
        
        const wallpapers = [];
        
        try {
            // 一次性获取多张图片（最多8张）
            const data = await this.fetchWallpaperData(0, Math.min(days, 8), mkt);
            
            if (data.images && data.images.length > 0) {
                for (const imageData of data.images) {
                    const wallpaperInfo = this.formatWallpaperInfo(imageData);
                    wallpapers.push(wallpaperInfo);
                    console.log(`✓ 获取: ${wallpaperInfo.date} - ${wallpaperInfo.title}`);
                }
            }
        } catch (error) {
            console.error('获取壁纸失败:', error.message);
        }

        return wallpapers.sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * 保存壁纸信息到文件
     * @param {Array} wallpapers - 壁纸信息数组
     * @param {string} filename - 文件名
     */
    async saveToFile(wallpapers, filename = 'bing_wallpapers.json') {
        try {
            const jsonData = JSON.stringify(wallpapers, null, 2);
            fs.writeFileSync(filename, jsonData, 'utf8');
            console.log(`\n✓ 壁纸信息已保存到: ${filename}`);
        } catch (error) {
            console.error('保存文件失败:', error.message);
        }
    }

    /**
     * 下载壁纸图片
     * @param {string} url - 图片URL
     * @param {string} filename - 保存的文件名
     * @returns {Promise}
     */
    async downloadImage(url, filename) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filename);
            
            https.get(url, (response) => {
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', (error) => {
                fs.unlink(filename, () => {}); // 删除不完整的文件
                reject(error);
            });
        });
    }

    /**
     * 延迟函数
     * @param {number} ms - 毫秒
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 使用示例
async function main() {
    const fetcher = new BingWallpaperFetcher();
    
    try {
        console.log('=== Bing 壁纸获取工具 ===\n');
        
        // 由于Bing API限制，无法获取真正的"上个月"数据
        // 这里获取最近7天的数据作为演示
        console.log('注意：由于Bing API限制，只能获取最近7-8天的壁纸数据\n');
        
        // 获取最近7天的壁纸
        const wallpapers = await fetcher.getRecentWallpapers(7, 'zh-CN');
        
        if (wallpapers.length > 0) {
            console.log(`\n获取到 ${wallpapers.length} 张壁纸信息:`);
            console.log('----------------------------------------');
            
            wallpapers.forEach((wallpaper, index) => {
                console.log(`${index + 1}. 日期: ${wallpaper.date}`);
                console.log(`   标题: ${wallpaper.title}`);
                console.log(`   描述: ${wallpaper.description}`);
                console.log(`   1920x1080: ${wallpaper.urls['1920x1080']}`);
                console.log(`   UHD: ${wallpaper.urls.uhd}`);
                console.log('');
            });
            
            // 保存到文件
            await fetcher.saveToFile(wallpapers);
            
            // 可选：下载第一张壁纸作为示例
            // if (wallpapers.length > 0) {
            //     console.log('正在下载第一张壁纸作为示例...');
            //     const firstWallpaper = wallpapers[0];
            //     const filename = `bing_${firstWallpaper.date}_1920x1080.jpg`;
                
            //     try {
            //         await fetcher.downloadImage(firstWallpaper.urls['1920x1080'], filename);
            //         console.log(`✓ 壁纸已下载: ${filename}`);
            //     } catch (error) {
            //         console.error('下载壁纸失败:', error.message);
            //     }
            // }
            
        } else {
            console.log('未获取到任何壁纸信息');
        }
        
    } catch (error) {
        console.error('程序执行出错:', error.message);
    }
}


main();