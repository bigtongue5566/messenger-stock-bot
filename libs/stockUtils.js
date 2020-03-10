const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const iconv = require('iconv-lite');
const log = require('npmlog')
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const { Map } = require('immutable');
const EX_TYPE = {
    tse: "tse",
    otc: "otc"
}
class Stock {
    constructor(exType, stockCode, stockName) {
        this.exType = exType;
        this.code = stockCode;
        this.name = stockName;
    }
}

class StockUtils {
    constructor() {
    }
    async initAsync(dirPath) {
        log.info("StockUtils", "Load stock list");
        this.tseMap = Map();
        this.otcMap = Map();
        try {
            const res = await axios.get('http://isin.twse.com.tw/isin/C_public.jsp?strMode=2', {
                responseType: 'arraybuffer'
            });
            let html = iconv.decode(res.data, 'big5');
            const { document } = (new JSDOM(html)).window;
            document.querySelectorAll('body > table.h4 > tbody > tr > td:nth-child(1):not([colspan="7"]):not([bgcolor="#D5FFD5"])').forEach(e=>{
                let stockArr = e.textContent.trim().split("　");
                this.tseMap = this.tseMap.set(stockArr[0].trim(), stockArr[1].trim().toLowerCase());
            });
            console.log(`${dirPath}/tseMap.json`);
            await writeJsonFile(`${dirPath}/tseMap.json`,this.tseMap.toJSON());
        } catch (error) {
            log.error("StockUtils", error.message);
            this.tseMap = Map((await loadJsonFile(`${dirPath}/tseMap.json`)));
        }

        try {
            const res = await axios.get('http://isin.twse.com.tw/isin/C_public.jsp?strMode=4', {
                responseType: 'arraybuffer'
            });
            let html = iconv.decode(res.data, 'big5')
            const { document } = (new JSDOM(html)).window;
            document.querySelectorAll('body > table.h4 > tbody > tr > td:nth-child(1):not([colspan="7"]):not([bgcolor="#D5FFD5"])').forEach(e=>{
                let stockArr = e.textContent.trim().split("　");
                this.otcMap = this.otcMap.set(stockArr[0].trim(), stockArr[1].trim().toLowerCase());
            })
            await writeJsonFile(`${dirPath}/otcMap.json`,this.otcMap.toJSON());
        } catch (error) {
            log.error("StockUtils", error.message);
            this.otcMap = Map((await loadJsonFile(`${dirPath}/otcMap.json`)));
        }
    }
    calcDividendYield(tradePrice,totalDevidend){
        return `${Math.round(totalDevidend/tradePrice*10000)/100}%`;
    }
    isTseCode(stockCode) {
        stockCode = stockCode.toUpperCase();
        return this.tseMap.has(stockCode);
    }
    isOtcCode(stockCode) {
        stockCode = stockCode.toUpperCase();
        return this.otcMap.has(stockCode);
    }
    isTseName(stockName) {
        return this.tseMap.find((value,key)=> value === stockName);
    }
    isOtcName(stockName) {
        return this.otcMap.find((value,key)=> value === stockName);
     }
    isStockCode(stockCode) {
        stockCode = stockCode.toUpperCase();
        return this.isTseCode(stockCode) || this.isOtcCode(stockCode);
    }
    isStockName(stockName) {
        return this.isTseName(stockName) || this.isOtcName(stockName);
    }
    getStockName(stockCode) {
        stockCode = stockCode.toUpperCase();
        if (this.isTseCode(stockCode)) {
            return this.tseMap.get(stockCode);
        } else if (this.isOtcCode(stockCode)) {
            return this.otcMap.get(stockCode);
        } else {
            return null;
        }
    }
    getStockCode(stockName) {
        if (this.isTseName(stockName)) {
            return this.tseMap.findKey((value,key)=> value === stockName);
        } else if (this.isOtcName(stockName)) {
            return this.otcMap.findKey((value,key)=> value === stockName);
        } else {
            return null;
        }
    }
    getStockByCode(stockCode) {
        stockCode = stockCode.toUpperCase();
        let stockName, exType;
        stockName = this.getStockName(stockCode);
        if (this.isTseCode(stockCode)) {
            exType = EX_TYPE.tse
        } else if (this.isOtcCode(stockCode)) {
            exType = EX_TYPE.otc
        }
        return new Stock(exType,stockCode,stockName)
    }
    getStockByName(stockName) {
        let stockCode, exType;
        stockCode = this.getStockCode(stockName);
        if (this.isTseName(stockName)) {
            exType = EX_TYPE.tse
        } else if (this.isOtcName(stockName)) {
            exType = EX_TYPE.otc
        }
        return new Stock(exType,stockCode,stockName)
    }
    getStock(text) {
        let stock = null;
        if (this.isStockCode(text)) {
            stock = this.getStockByCode(text);
        } else if (this.isStockName(text)) {
            stock = this.getStockByName(text);
        }
        return stock;
    }
}

module.exports = {
    Stock,
    StockUtils
}

