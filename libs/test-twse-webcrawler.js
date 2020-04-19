const twse = require('./twse-webcrawler');
const { StockUtils } = require('./stockUtils');

(async () => {
  const stockUtils = new StockUtils();
  await stockUtils.initAsync();
  const stock = stockUtils.getStock('帆宣');
  const stockRealtimeData = twse.getRealTimeStockData(stock);
  console.log(stockRealtimeData);
})();
