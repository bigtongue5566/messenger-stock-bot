const fs = require('fs');
const puppeteer = require('puppeteer');
const Attachment = require('./attachment');

const dir = 'screenshot';


async function getDividendPolicy(stock) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const filePath = `./${dir}/${stock.code}-dp.png`;
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  const page = await browser.newPage();
  await page.goto(`https://www.wantgoo.com/stock/report/basic_dp?stockno=${stock.code}`);
  await page.waitForSelector('.br-trl');
  const table = await page.$('.br-trl');
  await table.screenshot({
    path: filePath,
  });
  await browser.close();
  const screenshot = new Attachment(filePath);
  return screenshot;
}

module.exports = {
  getDividendPolicy,
};
