const puppeteer = require('puppeteer');
const Attachment = require('./attachment')
const dir = 'screenshot';
const fs = require('fs');
const {
    dump
} = require('dumper.js')
class YahooData {
    constructor(percentageChange, screenshot) {
        this.percentageChange = percentageChange;
        this.percentageChangeStr = percentageChange + "%";
        this.screenshot = screenshot;
    }
}


async function getRealTimeStockData(stock) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    let filePath = `./${dir}/${stock.code}.png`;
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();
    await page.goto(`https://tw.stock.yahoo.com/q/bc?s=${stock.code}`);
    await page.waitForSelector('.highcharts-container');
    let svgElement = await page.$('#StxChart');
    await svgElement.screenshot({
        path: filePath
    });
    let percentageChange = await page.$$eval('.highcharts-container > svg > g', groups => {
        let percentageChangeNode = groups.find(e =>{
            for(let x=500 ;x<=510;x++){
                if(e.getAttribute('transform')===`translate(${x},20)`){
                    return true
                }
            }
            return false
        });
        return Number(percentageChangeNode.textContent.slice(0, -1));
    });
    await browser.close();
    let screenshot = new Attachment(filePath);
    let yahooData = new YahooData(percentageChange, screenshot);
    return yahooData;
}

async function getRealTimeTseT00Data() {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    let filePath = `./${dir}/t00.png`;
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();
    await page.goto(`https://tw.stock.yahoo.com/s/tse.php`);
    await page.waitForSelector('.highcharts-container')
    let svgElement = await page.$('#TseChart');
    await svgElement.screenshot({
        path: filePath
    });
    let transform = await page.$$eval('.highcharts-container > svg > g', groups => {        
        return groups.map(e=>{return {tran:e.getAttribute('transform'),text:e.textContent}});
    });
    let percentageChange = await page.$$eval('.highcharts-container > svg > g', groups => {        
        let percentageChangeNode = groups.find(e => {
            for(let x=486 ;x<=506;x++){
                if(e.getAttribute('transform')===`translate(${x},36)`){
                    return true
                }
            }
            return false
        });
        return Number(percentageChangeNode.textContent);
    })
    await browser.close();
    let screenshot = new Attachment(filePath);
    let yahooData = new YahooData(percentageChange, screenshot);
    return yahooData;
}
module.exports = {
    getRealTimeStockData,
    getRealTimeTseT00Data
};