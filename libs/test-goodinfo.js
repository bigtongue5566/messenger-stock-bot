const {dump} = require('dumper.js');
const {StockUtils} = require('./stockUtils');
const {getDividend} = require('./goodInfo');
(async()=>{
    let dividendData = await getDividend({code:8069});
    console.log(dividendData);
})()