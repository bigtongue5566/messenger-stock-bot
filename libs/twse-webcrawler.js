const axios = require('axios');

async function getRealTimeStockData(stock) {
    let now = new Date().getTime();
    let url = `http://163.29.17.179/stock/api/getStockInfo.jsp?ex_ch=${stock.exType}_${stock.code}.tw&json=1&delay=0&_=${now}`
    let result = await axios.get(url).then(res => {
        let stockData = res.data.msgArray[0];
        let open = Math.round(stockData.o * 100) / 100;
        let yesterday = Math.round(stockData.y * 100) / 100;
        let high = Math.round(stockData.h * 100) / 100;
        let low = Math.round(stockData.l * 100) / 100;
        let tradePrice = Math.round(stockData.z * 100) / 100;
        let priceChange = Math.round((stockData.z - stockData.y) * 100) / 100;
        let percentageChange = Math.round((stockData.z - stockData.y) / stockData.y * 100 * 100) / 100;
        let dataStr = `${stockData.n}(${stockData.c})\n`;

        dataStr += `現價:${tradePrice}\n`
        dataStr += `漲跌:${priceChange}(${percentageChange}%)\n`
        dataStr += `開盤:${open} 昨收:${yesterday}\n`
        dataStr += `最高:${high} 最低:${low}\n`
        return {
            open,
            yesterday,
            high,
            low,
            tradePrice,
            priceChange,
            percentageChange,
            dataStr
        };
    });
    return result;
}
async function getRealTimeTseT00Data(){
    let stockData = await getRealTimeStockData({exType:'tse',code:'t00'})
    stockData.dataStr = `加權指數:${stockData.tradePrice}\n`
    stockData.dataStr += `漲跌:${stockData.priceChange}(${stockData.percentageChange}%)\n`
    return stockData;
}
module.exports = {
    getRealTimeStockData,
    getRealTimeTseT00Data
}