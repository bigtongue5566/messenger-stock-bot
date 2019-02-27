const puppeteer = require('puppeteer')
const Attachment = require('./attachment')
const {DIRECTORIES} = require('../constants')
async function getScreenShot() {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	await page.goto(`http://www.twse.com.tw/fund/BFI82U?response=html&dayDate=&weekDate=&monthDate=&type=day`)
	let svgElement = await page.$('table')
	let filePath = `./${DIRECTORIES.screenshot}/investors.png`
	await svgElement.screenshot({
		path: filePath
	})
	await browser.close()
	let screenshot = new Attachment(filePath)
	return screenshot
}

module.exports = {
	getScreenShot
}