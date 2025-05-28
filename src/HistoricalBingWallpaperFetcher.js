const https = require('https');
const fs = require('fs');
const path = require('path');

class HistoricalBingWallpaperFetcher {
    constructor() {
        // 使用第三方存档服务
        this.archives = {
            npanuhin: {
                name: 'npanuhin Archive',
                baseUrl: 'https://bing.npanuhin.me',
                // 支持的国家和语言
                countries: ['US', 'CN', 'UK', 'AU', 'CA', 'DE', 'FR', 'JP', 'ROW'], // ROW = Rest of World
                languages: ['en', 'zh', 'de', 'fr', 'ja'],
                dateRange: { start: '2009-06-03', end: new Date().toISOString().split('T')[0] }
            },
            anerg: {
                name: 'Anerg Archive',
                baseUrl: 'https://bingwallpaper.anerg.com',
                dateRange: { start: '2009-05-01', end: new Date().toISOString().split('T')[0] }
            }
        };
    }

    /**
     * 从 npanuhin 存档获取历史壁纸数据
     * @param {string} country - 国家代码 (US, CN, UK, AU, CA, DE, FR, JP, ROW)
     * @param {string} language - 语言代码 (en, zh, de, fr, ja)
     * @param {number} year - 年份 (可选，不指定则获取所有数据)
     * @returns {Promise<Array>} 壁纸信息数组
     */
    async fetchFromNpanuhin(country = 'US', language = 'en', year = null) {
        try {
            let url;
            if (year) {
                url = `${this.archives.npanuhin.baseUrl}/${country}/${language}.${year}.json`;
            } else {
                url = `${this.archives.npanuhin.baseUrl}/${country}/${language}.json`;
            }
            
            console.log(`正在从 npanuhin 存档获取数据: ${url}`);
            
            const data = await this.makeHttpRequest(url);
            const wallpapers = JSON.parse(data);
            
            console.log(`✓ 成功获取 ${wallpapers.length} 张壁纸信息`);
            return wallpapers;
            
        } catch (error) {
            console.error(`从 npanuhin 存档获取数据失败: ${error.message}`);
            return [];
        }
    }

    /**
     * 获取指定日期范围的壁纸
     * @param {string} startDate - 开始日期 (YYYY-MM-DD)
     * @param {string} endDate - 结束日期 (YYYY-MM-DD)
     * @param {string} country - 国家代码
     * @param {string} language - 语言代码
     * @returns {Promise<Array>} 指定日期范围的壁纸
     */
    async getWallpapersByDateRange(startDate, endDate, country = 'US', language = 'en') {
        console.log(`获取 ${startDate} 到 ${endDate} 的壁纸数据...`);
        
        const allWallpapers = await this.fetchFromNpanuhin(country, language);
        
        const filteredWallpapers = allWallpapers.filter(wallpaper => {
            return wallpaper.date >= startDate && wallpaper.date <= endDate;
        });
        
        console.log(`✓ 找到 ${filteredWallpapers.length} 张符合日期范围的壁纸`);
        return filteredWallpapers;
    }

    /**
     * 获取半年前的壁纸
     * @param {string} country - 国家代码
     * @param {string} language - 语言代码
     * @returns {Promise<Array>} 半年前的壁纸数组
     */
    async getSixMonthsAgoWallpapers(country = 'US', language = 'en') {
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        
        // 获取半年前那个月的壁纸
        const startDate = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth(), 1);
        const endDate = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + 1, 0);
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        console.log(`获取半年前 (${sixMonthsAgo.getFullYear()}年${sixMonthsAgo.getMonth() + 1}月) 的壁纸...`);
        console.log(`日期范围: ${startDateStr} 到 ${endDateStr}`);
        
        return await this.getWallpapersByDateRange(startDateStr, endDateStr, country, language);
    }

    /**
     * 获取指定年份的所有壁纸
     * @param {number} year - 年份
     * @param {string} country - 国家代码
     * @param {string} language - 语言代码
     * @returns {Promise<Array>} 该年份的所有壁纸
     */
    async getWallpapersByYear(year, country = 'US', language = 'en') {
        console.log(`获取 ${year} 年的所有壁纸...`);
        
        try {
            const wallpapers = await this.fetchFromNpanuhin(country, language, year);
            console.log(`✓ ${year} 年共有 ${wallpapers.length} 张壁纸`);
            return wallpapers;
        } catch (error) {
            console.error(`获取 ${year} 年壁纸失败: ${error.message}`);
            return [];
        }
    }

    /**
     * 获取指定月份的壁纸
     * @param {number} year - 年份
     * @param {number} month - 月份 (1-12)
     * @param {string} country - 国家代码
     * @param {string} language - 语言代码
     * @returns {Promise<Array>} 该月份的壁纸
     */
    async getWallpapersByMonth(year, month, country = 'US', language = 'en') {
        const paddedMonth = month.toString().padStart(2, '0');
        const startDate = `${year}-${paddedMonth}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // 该月最后一天
        
        console.log(`获取 ${year} 年 ${month} 月的壁纸...`);
        
        return await this.getWallpapersByDateRange(startDate, endDate, country, language);
    }

    /**
     * 搜索包含关键词的壁纸
     * @param {string} keyword - 搜索关键词
     * @param {string} country - 国家代码
     * @param {string} language - 语言代码
     * @param {number} limit - 结果数量限制
     * @returns {Promise<Array>} 匹配的壁纸
     */
    async searchWallpapers(keyword, country = 'US', language = 'en', limit = 50) {
        console.log(`搜索包含 "${keyword}" 的壁纸...`);
        
        const allWallpapers = await this.fetchFromNpanuhin(country, language);
        
        const matchedWallpapers = allWallpapers.filter(wallpaper => {
            const searchText = [
                wallpaper.title,
                wallpaper.caption,
                wallpaper.subtitle,
                wallpaper.copyright,
                wallpaper.description
            ].join(' ').toLowerCase();
            
            return searchText.includes(keyword.toLowerCase());
        }).slice(0, limit);
        
        console.log(`✓ 找到 ${matchedWallpapers.length} 张匹配的壁纸`);
        return matchedWallpapers;
    }

    /**
     * 批量下载壁纸图片
     * @param {Array} wallpapers - 壁纸信息数组
     * @param {string} downloadDir - 下载目录
     * @param {number} maxDownloads - 最大下载数量
     * @returns {Promise}
     */
    async downloadWallpapers(wallpapers, downloadDir = './wallpapers', maxDownloads = 10) {
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }
        
        console.log(`开始下载壁纸到目录: ${downloadDir}`);
        console.log(`计划下载数量: ${Math.min(wallpapers.length, maxDownloads)}`);
        
        const downloadPromises = wallpapers.slice(0, maxDownloads).map(async (wallpaper, index) => {
            try {
                const filename = `bing_${wallpaper.date}_${index + 1}.jpg`;
                const filepath = path.join(downloadDir, filename);
                
                // 检查文件是否已存在
                if (fs.existsSync(filepath)) {
                    console.log(`跳过已存在的文件: ${filename}`);
                    return;
                }
                
                console.log(`下载中 (${index + 1}/${Math.min(wallpapers.length, maxDownloads)}): ${filename}`);
                
                await this.downloadImage(wallpaper.url, filepath);
                console.log(`✓ 下载完成: ${filename}`);
                
                // 保存壁纸信息到同名的json文件
                const infoPath = filepath.replace('.jpg', '.json');
                fs.writeFileSync(infoPath, JSON.stringify(wallpaper, null, 2), 'utf8');
                
                // 添加延迟避免请求过于频繁
                await this.sleep(1000);
                
            } catch (error) {
                console.error(`下载失败: ${wallpaper.date} - ${error.message}`);
            }
        });
        
        await Promise.all(downloadPromises);
        console.log('✓ 批量下载完成');
    }

    /**
     * 生成壁纸统计信息
     * @param {Array} wallpapers - 壁纸数组
     * @returns {Object} 统计信息
     */
    generateStatistics(wallpapers) {
        const stats = {
            total: wallpapers.length,
            dateRange: {
                earliest: wallpapers[0]?.date || 'N/A',
                latest: wallpapers[wallpapers.length - 1]?.date || 'N/A'
            },
            byYear: {},
            byMonth: {},
            topKeywords: {}
        };
        
        wallpapers.forEach(wallpaper => {
            const year = wallpaper.date.split('-')[0];
            const month = wallpaper.date.substring(0, 7);
            
            stats.byYear[year] = (stats.byYear[year] || 0) + 1;
            stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
            
            // 提取关键词
            if (wallpaper.title) {
                const words = wallpaper.title.toLowerCase().split(/\\W+/);
                words.forEach(word => {
                    if (word.length > 3) {
                        stats.topKeywords[word] = (stats.topKeywords[word] || 0) + 1;
                    }
                });
            }
        });
        
        // 排序关键词
        const sortedKeywords = Object.entries(stats.topKeywords)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .reduce((obj, [key, val]) => {obj[key] = val; return obj;}, {});
        
        stats.topKeywords = sortedKeywords;
        
        return stats;
    }

    /**
     * HTTP 请求封装
     * @param {string} url - 请求URL
     * @returns {Promise<string>} 响应数据
     */
    makeHttpRequest(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    }
                });
            }).on('error', (error) => {
                reject(new Error(`请求失败: ${error.message}`));
            });
        });
    }

    /**
     * 下载图片
     * @param {string} url - 图片URL
     * @param {string} filepath - 保存路径
     * @returns {Promise}
     */
    downloadImage(url, filepath) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filepath);
            
            https.get(url, (response) => {
                if (response.statusCode === 200) {
                    response.pipe(file);
                    
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                } else {
                    fs.unlink(filepath, () => {});
                    reject(new Error(`HTTP ${response.statusCode}`));
                }
            }).on('error', (error) => {
                fs.unlink(filepath, () => {});
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

    /**
     * 保存数据到文件
     * @param {Array|Object} data - 要保存的数据
     * @param {string} filename - 文件名
     */
    saveToFile(data, filename) {
        try {
            const jsonData = JSON.stringify(data, null, 2);
            fs.writeFileSync(filename, jsonData, 'utf8');
            console.log(`✓ 数据已保存到: ${filename}`);
        } catch (error) {
            console.error('保存文件失败:', error.message);
        }
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        console.log(`
=== 历史 Bing 壁纸获取工具 ===

支持的国家代码: US, CN, UK, AU, CA, DE, FR, JP, ROW
支持的语言代码: en, zh, de, fr, ja
数据范围: 2009年6月至今

主要功能:
1. 获取半年前的壁纸
2. 获取指定年份/月份的壁纸
3. 按日期范围获取壁纸
4. 搜索包含关键词的壁纸
5. 批量下载壁纸图片
6. 生成统计信息

使用示例:
const fetcher = new HistoricalBingWallpaperFetcher();

// 获取半年前的壁纸
const sixMonthsAgo = await fetcher.getSixMonthsAgoWallpapers('US', 'en');

// 获取2023年的所有壁纸
const year2023 = await fetcher.getWallpapersByYear(2023, 'US', 'en');

// 搜索包含"mountain"的壁纸
const mountains = await fetcher.searchWallpapers('mountain', 'US', 'en');
        `);
    }
}

// 使用示例和演示
async function main() {
    const fetcher = new HistoricalBingWallpaperFetcher();
    
    try {
        console.log('=== 历史 Bing 壁纸获取工具 ===\\n');
        
        // 显示帮助信息
        // fetcher.showHelp();
        
        // 1. 获取半年前的壁纸
        console.log('\\n1. 获取半年前的壁纸:');
        console.log('================================');
        const sixMonthsAgoWallpapers = await fetcher.getSixMonthsAgoWallpapers('CN', 'zh');
        
        if (sixMonthsAgoWallpapers.length > 0) {
            console.log(`\\n找到 ${sixMonthsAgoWallpapers.length} 张半年前的壁纸:`);
            sixMonthsAgoWallpapers.slice(0, 5).forEach((wallpaper, index) => {
                console.log(`${index + 1}. ${wallpaper.date}: ${wallpaper.title || wallpaper.copyright}`);
            });
            
            // 保存半年前的壁纸信息
            fetcher.saveToFile(sixMonthsAgoWallpapers, 'six_months_ago_wallpapers.json');
        }
        
        // 2. 获取2023年的壁纸（示例）
        // console.log('\\n\\n2. 获取2023年的壁纸:');
        // console.log('================================');
        // const year2023Wallpapers = await fetcher.getWallpapersByYear(2023, 'US', 'en');
        
        // if (year2023Wallpapers.length > 0) {
        //     console.log(`\\n2023年共有 ${year2023Wallpapers.length} 张壁纸`);
        //     console.log('前5张:');
        //     year2023Wallpapers.slice(0, 5).forEach((wallpaper, index) => {
        //         console.log(`${index + 1}. ${wallpaper.date}: ${wallpaper.title || wallpaper.copyright}`);
        //     });
            
        //     // 生成统计信息
        //     const stats = fetcher.generateStatistics(year2023Wallpapers);
        //     console.log('\\n2023年壁纸统计:');
        //     console.log(`- 总数: ${stats.total}`);
        //     console.log(`- 日期范围: ${stats.dateRange.earliest} 到 ${stats.dateRange.latest}`);
        //     console.log('- 热门关键词:', Object.keys(stats.topKeywords).slice(0, 5).join(', '));
        // }
        
        // // 3. 搜索特定主题的壁纸（可选）
        // console.log('\\n\\n3. 搜索包含"mountain"的壁纸:');
        // console.log('================================');
        // const mountainWallpapers = await fetcher.searchWallpapers('mountain', 'US', 'en', 10);
        
        // if (mountainWallpapers.length > 0) {
        //     console.log(`\\n找到 ${mountainWallpapers.length} 张山景壁纸:`);
        //     mountainWallpapers.slice(0, 3).forEach((wallpaper, index) => {
        //         console.log(`${index + 1}. ${wallpaper.date}: ${wallpaper.title || wallpaper.copyright}`);
        //     });
        // }
        
        // // 4. 下载示例（下载半年前的前3张壁纸）
        // if (sixMonthsAgoWallpapers.length > 0) {
        //     console.log('\\n\\n4. 下载示例壁纸:');
        //     console.log('================================');
        //     console.log('正在下载半年前的前3张壁纸作为示例...');
        //     await fetcher.downloadWallpapers(sixMonthsAgoWallpapers, './historical_wallpapers', 3);
        // }
        
        console.log('\\n✓ 所有任务完成！');
        
    } catch (error) {
        console.error('程序执行出错:', error.message);
    }
}

main();