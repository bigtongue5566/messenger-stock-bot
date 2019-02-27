const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const iconv = require('iconv-lite');
const log = require('npmlog')
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
    async initAsync() {
        log.info("StockUtils", "Load stock list");
        this.tseMap = new Map();
        await axios.get('http://isin.twse.com.tw/isin/C_public.jsp?strMode=2', {
            responseType: 'arraybuffer'
        }).then(res => {
            let html = iconv.decode(res.data, 'big5');
            const { document } = (new JSDOM(html)).window;
            document.querySelectorAll('body > table.h4 > tbody > tr > td:nth-child(1):not([colspan="7"]):not([bgcolor="#D5FFD5"])').forEach(e=>{
                let stockArr = e.textContent.trim().split("　");
                this.tseMap.set(stockArr[0].trim(), stockArr[1].trim().toLowerCase());
            })
        });             
        this.otcMap = new Map();
        await axios.get('http://isin.twse.com.tw/isin/C_public.jsp?strMode=4', {
            responseType: 'arraybuffer'
        }).then(res => {
            let html = iconv.decode(res.data, 'big5')
            const { document } = (new JSDOM(html)).window;
            document.querySelectorAll('body > table.h4 > tbody > tr > td:nth-child(1):not([colspan="7"]):not([bgcolor="#D5FFD5"])').forEach(e=>{
                let stockArr = e.textContent.trim().split("　");
                this.otcMap.set(stockArr[0], stockArr[1].toLowerCase());
            })
        })
    }
    isTseCode(stockCode) {
        return this.tseMap.has(stockCode);
    }
    isOtcCode(stockCode) {
        return this.otcMap.has(stockCode);
    }
    isTseName(stockName) {
        return Array.from(this.tseMap.values()).includes(stockName);
    }
    isOtcName(stockName) {
        return Array.from(this.otcMap.values()).includes(stockName);
    }
    isStockCode(stockCode) {
        return this.isTseCode(stockCode) || this.isOtcCode(stockCode);
    }
    isStockName(stockName) {
        return this.isTseName(stockName) || this.isOtcName(stockName);
    }
    getStockName(stockCode) {
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
            return ([...this.tseMap].find(map => map[1] === stockName) || [])[0]
        } else if (this.isOtcName(stockName)) {
            return ([...this.otcMap].find(map => map[1] === stockName) || [])[0]
        } else {
            return null;
        }
    }
    getStockByCode(stockCode) {
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

