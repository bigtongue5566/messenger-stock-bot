const log = require('npmlog');
const fs = require('fs');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const {
  fromJS, Map, is, Set,
} = require('immutable');
const schedule = require('node-schedule');
const FacebookBot = require('./libs/facebookbot');
const { StockUtils } = require('./libs/stockUtils');
const investors = require('./libs/investors');
const meme = require('./libs/meme');
const {
  BOT_MODE,
  REGEX,
  FILE_PATH,
  RESPONSE,
  DIRECTORIES,
} = require('./constants');
const yahooStock = require('./libs/yahoo-stock');
const twse = require('./libs/twse-webcrawler');
const { getDividend } = require('./libs/goodInfo');
const { getDividendPolicy } = require('./libs/wantgoo');

class StockBot extends FacebookBot {
  async init(credentials) {
    let api;
    try {
      api = await this.login({
        appState: await loadJsonFile(this.filePath.appState),
      });
    } catch (error) {
      api = await this.login(credentials);
    }
    await writeJsonFile(this.filePath.appState, api.getAppState());
    await this.sendUnsendMessages();
    this.stockUtils = new StockUtils();
    await this.stockUtils.initAsync('data');
    this.threadMap = await this.loadThreadMap();
    return api;
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
    const screenshot = await investors.getScreenShot();
    await this.sendAttachment(threadID, screenshot);
    await this.sendMessage(threadID, meme.lol);
  }

  async sendDividendPolicy(threadID, stock) {
    const dividendPolicy = await getDividendPolicy(stock);
    await this.sendAttachment(threadID, dividendPolicy);
  }

  async sendThisYearDividendYield(threadID, stock) {
    const twseStockData = await twse.getRealTimeStockData(stock);
    const dividendData = await getDividend(stock);
    if (dividendData) {
      const hasCashDevidend = new Date(dividendData.cashDevidendDate) <= new Date();
      const hasStockDevidend = new Date(dividendData.stockDevidendDate) <= new Date();
      let msg = `發放年度: ${dividendData.year}\n`;
      msg += `除息日: ${dividendData.cashDevidendDate}(${hasCashDevidend
        && '已除息'})\n`;
      msg += `除權日: ${dividendData.stockDevidendDate}(${hasStockDevidend
        && '已除權'})\n`;
      msg += `現金股利: ${dividendData.cashDevidend}\n`;
      msg += `股票股利: ${dividendData.stockDevidend}\n`;
      msg += `股利合計: ${dividendData.totalDevidend}\n`;
      if (hasCashDevidend && hasStockDevidend) {
        msg += `現價殖利率: ${this.stockUtils.calcDividendYield(
          twseStockData.tradePrice,
          dividendData.totalDevidend,
        )}\n`;
      }
      await this.sendMessage(threadID, msg);
    } else {
      await this.sendMessage(threadID, RESPONSE.noThisYearDividendData);
    }
  }

  async sendRealTimeTseT00Data(threadID, threadMode) {
    const stock = {
      exType: 'tse',
      code: 't00',
      name: '大盤',
    };
    let memeText;
    let twseTseT00Data;
    let yahooTseT00Data;

    switch (threadMode) {
      case BOT_MODE.text:
        twseTseT00Data = await twse.getRealTimeTseT00Data();
        await this.sendMessage(threadID, twseTseT00Data.dataStr);
        memeText = await meme.getByPercentageChange(
          twseTseT00Data.percentageChange,
          stock,
        );
        await this.sendMessage(threadID, memeText);
        break;
      case BOT_MODE.img:
        yahooTseT00Data = await yahooStock.getRealTimeTseT00Data();
        memeText = await meme.getByPercentageChange(
          yahooTseT00Data.percentageChange,
          stock,
        );
        await this.sendAttachment(
          threadID,
          yahooTseT00Data.screenshot,
          memeText,
        );
        break;
      default:
    }
  }

  async sendRealTimeStockData(threadID, threadMode, stock) {
    let memeText;
    let twseStockData;
    let yahooStockData;
    switch (threadMode) {
      case BOT_MODE.text:
        twseStockData = await twse.getRealTimeStockData(stock);
        await this.sendMessage(threadID, twseStockData.dataStr);
        memeText = await meme.getByPercentageChange(
          twseStockData.percentageChange,
          stock,
        );
        await this.sendMessage(threadID, memeText);
        break;
      case BOT_MODE.img:
        yahooStockData = await yahooStock.getRealTimeStockData(stock);
        memeText = await meme.getByPercentageChange(
          yahooStockData.percentageChange,
          stock,
        );
        await this.sendAttachment(
          threadID,
          yahooStockData.screenshot,
          memeText,
        );
        break;
      default:
    }
  }

  async setAlias(thread, threadID, inputText) {
    const query = inputText.split(' ')[0];
    const alias = inputText.split(' ')[2];
    const stock = this.stockUtils.getStock(query);
    let tempThread = thread;
    if (stock) {
      tempThread = thread.getIn(['alias', stock.code])
        ? thread
        : thread.setIn(['alias', stock.code], Set());
      if (this.stockUtils.getStock(alias)) {
        await this.sendMessage(threadID, `別名${alias}為保留字`);
      } else {
        const aliasMap = tempThread.get('alias').toJSON();
        let aliases = [];
        Object.keys(aliasMap).forEach((key) => {
          aliases = aliases.concat(aliasMap[key]);
        });
        if (aliases.includes(alias)) {
          await this.sendMessage(threadID, `已有別名${alias}`);
        } else {
          const aliasSet = Set(tempThread.getIn(['alias', stock.code])).add(alias);
          tempThread = tempThread.setIn(['alias', stock.code], aliasSet);
          await this.sendMessage(threadID, `${query}\n設定別名\n${alias}`);
        }
      }
    } else {
      this.sendMessage(threadID, `查無 ${query}`);
    }
    return tempThread;
  }

  async deleteAlias(thread, threadID, inputText) {
    const query = inputText.split(' ')[0];
    const alias = inputText.split(' ')[2];
    const stock = this.stockUtils.getStock(query);
    let tempThread = thread;
    if (stock) {
      tempThread = tempThread.getIn(['alias', stock.code])
        ? tempThread
        : tempThread.setIn(['alias', stock.code], Set());
      const aliasSet = Set(tempThread.getIn(['alias', stock.code])).delete(alias);
      tempThread = tempThread.setIn(['alias', stock.code], aliasSet);
      await this.sendMessage(threadID, `${query}\n取消別名\n${alias}`);
    } else {
      await this.sendMessage(threadID, `查無 ${query}`);
    }
    return tempThread;
  }

  async sendAllAlias(thread, threadID) {
    const aliases = thread.get('alias').toJSON();
    let aliasMessage = '';
    Object.keys(aliases).forEach((key) => {
      const stock = this.stockUtils.getStockByCode(key);
      if (aliases[key].length) {
        aliasMessage += `${stock.code} ${stock.name}:\n`;
        aliasMessage += aliases[key].reduce((pre, cur, ind) => (ind === aliases[key].length - 1
          ? `${pre}${cur}`
          : `${pre}${cur},`), '');
        aliasMessage += '\n';
      }
    });
    await this.sendMessage(threadID, aliasMessage);
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

  async handleInputText(inputText, thread, threadID) {
    let tempThread = thread;
    switch (true) {
      case REGEX.textMode.test(inputText):
        tempThread = await this.switchMode(thread, threadID, BOT_MODE.text);
        break;
      case REGEX.imgMode.test(inputText):
        tempThread = await this.switchMode(thread, threadID, BOT_MODE.img);
        break;
      case REGEX.offMode.test(inputText):
        tempThread = await this.switchMode(thread, threadID, BOT_MODE.off);
        break;
      case REGEX.t00.test(inputText):
        await this.sendRealTimeTseT00Data(threadID, thread.get('mode'));
        break;
      case REGEX.help.test(inputText):
        await this.sendMessage(threadID, RESPONSE.help);
        break;
      case REGEX.investors.test(inputText):
        await this.sendInvestorsData(threadID);
        break;
      case REGEX.dividendYield.test(inputText):
        if (tempThread.get('mode') !== BOT_MODE.off) {
          const stock = this.stockUtils.getStock(inputText.split(' ')[0]);
          if (stock) {
            await this.sendThisYearDividendYield(threadID, stock);
          }
        }
        break;
      case REGEX.dividendPolicy.test(inputText):
        if (tempThread.get('mode') !== BOT_MODE.off) {
          const stock = this.stockUtils.getStock(inputText.split(' ')[0]);
          if (stock) {
            await this.sendDividendPolicy(threadID, stock);
          }
        }
        break;
      case REGEX.showAlias.test(inputText):
        await this.sendAllAlias(tempThread, threadID);
        break;
      case REGEX.alias.test(inputText):
        tempThread = await this.setAlias(tempThread, threadID, inputText);
        break;
      case REGEX.unalias.test(inputText): {
        tempThread = await this.deleteAlias(tempThread, threadID, inputText);
        break;
      }
      default:
        if (tempThread.get('mode') !== BOT_MODE.off) {
          const alias = tempThread.get('alias');
          const keyValue = alias === undefined
            ? undefined
            : alias.findEntry((value) => value.find((deepValue) => deepValue === inputText));
          const query = keyValue === undefined ? inputText : keyValue[0];
          const stock = this.stockUtils.getStock(query);
          if (stock) {
            await this.sendRealTimeStockData(
              threadID,
              tempThread.get('mode'),
              stock,
            );
          }
        }
        break;
    }
    return tempThread;
  }

  async createThreadConfig() {
    let thread = Map();
    thread = thread.set('mode', BOT_MODE.text);
    thread = thread.set('userStockMap', Map());
    thread = thread.set('alias', Map());
    return thread;
  }

  async setEventhandler(api) {
    this.api = api;
    const listen = this.setListener(api);
    listen(async (err, event) => {
      try {
        if (err) this.exit();
        const { threadID } = event;
        let thread = this.threadMap.get(event.threadID);
        if (!thread) {
          thread = await this.createThreadConfig();
        }
        if (event.type === 'message') {
          const inputText = event.body.toLowerCase();
          thread = await this.handleInputText(
            inputText,
            thread,
            threadID,
          );
        }
        if (!is(this.threadMap.get(event.threadID), thread)) {
          this.threadMap = this.threadMap.set(event.threadID, thread);
          await writeJsonFile(this.filePath.threadMap, this.threadMap);
        }
      } catch (error) {
        console.log(error);
        this.exit();
      }
    });
  }
}

(async () => {
  Object.keys(DIRECTORIES).forEach((key) => {
    if (!fs.existsSync(DIRECTORIES[key])) {
      fs.mkdirSync(DIRECTORIES[key]);
    }
  });
  try {
    const stockBot = new StockBot(FILE_PATH);
    const api = await stockBot.init({
      email: process.env.USERNAME,
      password: process.env.PASSWORD,
    });
    await stockBot.setEventhandler(api);
  } catch (error) {
    console.error(error);
    process.exit();
  }
  schedule.scheduleJob('* 8 * * *', () => {
    console.log('Daily restart');
    process.exit();
  });
})();
