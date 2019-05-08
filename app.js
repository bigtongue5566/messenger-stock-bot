const FacebookBot = require('./libs/facebookbot');
const {
    StockUtils
} = require('./libs/stockUtils');
const log = require('npmlog');
const fs = require('fs');
const investors = require('./libs/investors');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const meme = require('./libs/meme');
const {
    BOT_MODE,
    REGEX,
    FILE_PATH,
    RESPONSE,
    DIRECTORIES
} = require('./constants');
const {
    fromJS,
    Map,
    is
} = require('immutable');
const yahooStock = require('./libs/yahoo-stock');
const twse = require('./libs/twse-webcrawler');
class StockBot extends FacebookBot {
    constructor(filePath) {
        super(filePath);
    }
    async init(credentials) {
        let api
        try {
            try {
                api = await this.loginByCredentials({
                    appState: await loadJsonFile(this.filePath.appState)
                });
            } catch (error) {
                api = await this.loginByPassword(credentials);
            }
            await writeJsonFile(this.filePath.appState, api.getAppState());
            await this.sendUnsendMessages();
            this.stockUtils = new StockUtils();
            await this.stockUtils.initAsync();
            this.threadMap = await this.loadThreadMap();
        } catch (error) {
            console.log(error)
        }
        return api
    }
    async loadThreadMap() {
        log.info('init', 'Load thread config');
        let threadMap;
        try {
            threadMap = await loadJsonFile(this.filePath.threadMap);
            threadMap = fromJS(threadMap);
        } catch (error) {
            threadMap = Map();
        }
        return threadMap;
    }

    async sendInvestorsData(threadID) {
        let screenshot = await investors.getScreenShot();
        await this.sendAttachment(threadID, screenshot);
        await this.sendMessage(threadID, meme.lol);
    }

    async sendRealTimeTseT00Data(threadID, threadMode) {
        let stock = {
            exType: 'tse',
            code: 't00',
            name: '大盤'
        };
        let memeText;
        switch (threadMode) {
            case BOT_MODE.text:
                let twseTseT00Data = await twse.getRealTimeTseT00Data();
                await this.sendMessage(threadID, twseTseT00Data.dataStr);
                memeText = await meme.getByPercentageChange(twseTseT00Data.percentageChange, stock);
                await this.sendMessage(threadID, memeText);
                break;
            case BOT_MODE.img:
                let yahooTseT00Data = await yahooStock.getRealTimeTseT00Data();
                memeText = await meme.getByPercentageChange(yahooTseT00Data.percentageChange, stock);
                await this.sendAttachment(threadID, yahooTseT00Data.screenshot, memeText);
                break;
        }
    }

    async sendRealTimeStockData(threadID, threadMode, stock) {
        let memeText;
        switch (threadMode) {
            case BOT_MODE.text:
                let twseStockData = await twse.getRealTimeStockData(stock);
                await this.sendMessage(threadID, twseStockData.dataStr);
                memeText = await meme.getByPercentageChange(twseStockData.percentageChange, stock)
                await this.sendMessage(threadID, memeText);
                break;
            case BOT_MODE.img:
                let yahooStockData = await yahooStock.getRealTimeStockData(stock);
                memeText = await meme.getByPercentageChange(yahooStockData.percentageChange, stock);
                await this.sendAttachment(threadID, yahooStockData.screenshot, memeText);
                break;
        }
    }
    async switchMode(thread, threadID, botMode) {
        let text;
        switch (botMode) {
            case BOT_MODE.text:
                text = RESPONSE.switchTextMode;
                break;
            case BOT_MODE.img:
                text = RESPONSE.switchImgMode;
                break;
            case BOT_MODE.off:
                text = RESPONSE.switchOffMode;
                break;
            default:
                break;
        }
        await this.sendMessage(threadID, text);
        return thread.set('mode', botMode);
    }
    async handleInputText(inputText,thread,threadID,BOT_MODE) {
        switch (true) {
            case REGEX.textMode.test(inputText):
                thread = await this.switchMode(thread, threadID, BOT_MODE.text);
                break;
            case REGEX.imgMode.test(inputText):
                thread = await this.switchMode(thread, threadID, BOT_MODE.img);
                break;
            case REGEX.offMode.test(inputText):
                thread = await this.switchMode(thread, threadID, BOT_MODE.off);
                break;
            case REGEX.t00.test(inputText):
                await this.sendRealTimeTseT00Data(threadID, thread.get('mode'));
                break;
            case REGEX.investors.test(inputText):
                await this.sendInvestorsData(threadID);
                break;
            default:
                if (thread.get('mode') !== BOT_MODE.off) {
                    let stock = this.stockUtils.getStock(inputText);
                    if (stock) {
                        await this.sendRealTimeStockData(threadID, thread.get('mode'), stock);
                    }
                }
                break;
        }
        return thread;
    }
    async createThreadConfig(){
        let thread = Map();
        thread = thread.set('mode', BOT_MODE.text);
        thread = thread.set('userStockMap', Map());
        return thread;
    }
    async setEventhandler(api) {
        this.api = api
        let listen = this.setListener(api);
        listen(async (err, event) => {
            let threadID = event.threadID;
            let thread = this.threadMap.get(event.threadID);
            if (!thread) {
                thread = await createThreadConfig();
            }
            if (event.type === 'message') {
                let inputText = event.body.toLowerCase();
                thread = await handleInputText(inputText,thread,threadID,BOT_MODE);
            }
            if (!is(this.threadMap.get(event.threadID), thread)) {
                this.threadMap = this.threadMap.set(event.threadID, thread);
                await writeJsonFile(this.filePath.threadMap, this.threadMap);
            }
            //await this.markAsRead(threadID);
        });
    }

}

(async () => {
    for (let key in DIRECTORIES) {
        if (!fs.existsSync(DIRECTORIES[key])) {
            fs.mkdirSync(DIRECTORIES[key]);
        }
    }
    let stockBot = new StockBot(FILE_PATH);
    let api = await stockBot.init({
        email: process.env.USERNAME,
        password: process.env.PASSWORD
    });
    try {
        await stockBot.setEventhandler(api);
    } catch (error) {
        process.exit();
    }
})()