const fs = require('fs');
const puppeteer = require('puppeteer');
const Attachment = require('./attachment');

const dir = 'screenshot';

class YahooData {
  constructor(percentageChange, screenshot) {
    this.percentageChange = percentageChange;
    this.percentageChangeStr = `${percentageChange}%`;
    this.screenshot = screenshot;
  }
}


async function getRealTimeStockData(stock) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const filePath = `./${dir}/${stock.code}.png`;
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  const page = await browser.newPage();
  await page.goto(`https://tw.stock.yahoo.com/q/bc?s=${stock.code}`);
  await page.waitForSelector('.highcharts-container');
  const svgElement = await page.$('#StxChart');
  await svgElement.screenshot({
    path: filePath,
  });
  const percentageChange = await page.$$eval('.highcharts-container > svg > g', (groups) => {
    const percentageChangeNode = groups.find((e) => {
      for (let x = 500; x <= 510; x += 1) {
        if (e.getAttribute('transform') === `translate(${x},20)`) {
          return true;
        }
      }
      return false;
    });
    return Number(percentageChangeNode.textContent.slice(0, -1));
  });
  await browser.close();
  const screenshot = new Attachment(filePath);
  const yahooData = new YahooData(percentageChange, screenshot);
  return yahooData;
}

async function getRealTimeTseT00Data() {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const filePath = `./${dir}/t00.png`;
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  const page = await browser.newPage();
  await page.goto('https://tw.stock.yahoo.com/s/tse.php');
  await page.waitForSelector('.highcharts-container');
  const svgElement = await page.$('#TseChart');
  await svgElement.screenshot({
    path: filePath,
  });
  await page.$$eval('.highcharts-container > svg > g', (groups) => groups.map((e) => ({ tran: e.getAttribute('transform'), text: e.textContent })));
  const percentageChange = await page.$$eval('.highcharts-container > svg > g', (groups) => {
    const percentageChangeNode = groups.find((e) => {
      for (let x = 486; x <= 506; x += 1) {
        if (e.getAttribute('transform') === `translate(${x},36)`) {
          return true;
        }
      }
      return false;
    });
    return Number(percentageChangeNode.textContent);
  });
  await browser.close();
  const screenshot = new Attachment(filePath);
  const yahooData = new YahooData(percentageChange, screenshot);
  return yahooData;
}
module.exports = {
  getRealTimeStockData,
  getRealTimeTseT00Data,
};
