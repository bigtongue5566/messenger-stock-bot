const twse = require('./twse-webcrawler');
const {StockUtils} = require('./stockUtils');
const {dump} = require('dumper.js');

(async()=>{
	const stockUtils = new StockUtils();
	await stockUtils.initAsync();
	let stock = stockUtils.getStock('帆宣');
	dump(stock);
	let stockRealtimeData = twse.getRealTimeStockData(stock);
	dump(stockRealtimeData);
	//twse.getRealTimeStockData()
})()