const axios = require('axios');
const jsdom = require('jsdom');

const { JSDOM } = jsdom;

async function getDividend(stock) {
  const dividendUrl = `https://goodinfo.tw/StockInfo/StockDividendSchedule.asp?STOCK_ID=${stock.code}`;
  const res = await axios.get(dividendUrl);
  const { document } = new JSDOM(res.data).window;
  const table = document.querySelector('#divDetail table tbody');
  const firstRow = table.firstElementChild;
  if (parseInt(firstRow.children[0].textContent, 10) === new Date().getFullYear()) {
    const firstRowData = {
      year: firstRow.children[0].textContent,
      cashDevidendDate: firstRow.children[4].textContent,
      stockDevidendDate: firstRow.children[6].textContent,
      cashDevidend: parseFloat(firstRow.children[11].textContent),
      stockDevidend: parseFloat(firstRow.children[14].textContent),
      totalDevidend: parseFloat(firstRow.children[15].textContent),
    };
    return firstRowData;
  }
  return null;
}
async function getDividendPolicy(stock, years) {
  const dividendUrl = `https://goodinfo.tw/StockInfo/StockDividendSchedule.asp?STOCK_ID=${stock.code}`;
  const res = await axios.get(dividendUrl);
  const { document } = new JSDOM(res.data).window;
  const table = document.querySelector('#divDetail table tbody');
  return [...table.children].map((e) => ({
    year: e.children[0].textContent,
    cashDevidend: parseFloat(e.children[11].textContent),
    stockDevidend: parseFloat(e.children[14].textContent),
    totalDevidend: parseFloat(e.children[15].textContent),
  })).slice(0, years);
}
module.exports = {
  getDividend,
  getDividendPolicy,
};
