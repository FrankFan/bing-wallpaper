const puppeteer = require('puppeteer')
const { writeUrlToFile } = require('./fileHepler')

;(async () => {
  const browser = await puppeteer.launch({
    headless: true, // 是否无头
    devtools: true,
  })
  // 坑1：这样可以解决2个tab的问题
  const page = (await browser.pages())[0]

  // 坑2: 获取dom元素无效的问题
  // https://www.urlbox.io/puppeteer-wait-for-page-load
  // 国内IP访问 bing.com 会自动跳转到 cn.bing.com，太坑了
  // 导致本地和服务器上的行为不一致
  await page.goto('https://www.bing.com/?mkt=zh-CN', {
    waitUntil: 'networkidle2',
  })

  // 坑3: 必须等到具体元素出来以后再操作
  // await page.waitForSelector('#iotd_title', { visible: true })

  const bingWallpaperObj = await page.evaluate(async () => {
    function getBingBackgroundImage() {
      const theDiv = document.querySelector('.img_cont')
      // 获取 div 的 background-image 属性
      // url("https://cn.bing.com/th?id=OHR.StorrRocks_ZH-CN4956679462_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&qlt=50")
      const bgImage = window.getComputedStyle(theDiv)['backgroundImage']

      // 通过正则提取url
      const regObj = bgImage.match(/url\("(\S*)"\)/)
      return regObj && regObj.length > 1 && regObj[1]
    }

    function getTitle() {
      const selector = '#headline'
      return document.querySelector(selector).innerText
    }

    function getCredit() {
      const selector = '#copyright'
      return document.querySelector(selector).innerText
    }

    function getDesc() {
      const selector = '.musCardCont h3 a'
      return document.querySelector(selector).innerText
    }

    return Promise.resolve({
      bgUrl: getBingBackgroundImage(),
      title: getTitle(),
      credit: getCredit(),
      desc: getDesc(),
    })
  })

  // await page.screenshot({ path: 'bing.png' })

  console.log(bingWallpaperObj)
  writeUrlToFile(bingWallpaperObj)
  await browser.close()
})()
