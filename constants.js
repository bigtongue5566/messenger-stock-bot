const BOT_MODE = {
    text: 'text',
    img: 'img',
    off: 'off'
}

const DIRECTORIES = {
    screenshot: 'screenshot',
    data: 'data'
}

const FILE_PATH = {
    threadMap: 'data/threadMap.json',
    appState: 'data/appstate.json',
    unsendMessages: 'data/unsendMessages.json'
}

const COMMANDS = {
    textMode: 'mode:text',
    imgMode: 'mode:img',
    offMode: 'mode:off',
    investors: '法人',
    stocks: '自選',
    t00: '大盤'
}

const REGEX = {
    help: /^\!help$/,
    textMode: /^mode:text$/,
    imgMode: /^mode:img$/,
    offMode: /^mode:off$/,
    investors: /^法人$/,
    stocks: /^自選$/,
    t00: /^大盤$/,
    dividendYield: / dy$/,
    dividendPolicy: / dp$/,
    showAlias: /^alias$/,
    alias: /^\S+ alias \S+$/,
    unalias: /^\S+ unalias \S+$/
}

const RESPONSE = {
    help:`股票名稱或代碼\n[查看即時資料]\n股票名稱或代碼 dy\n[查看殖利率]\n股票名稱或代碼 dp\n[查看股利政策]\nmode:text\n[文字模式]\nmode:img\n[圖片模式]\nmode:off\n[停止]\n法人\n[查看法人買賣超]\n大盤\n[查看大盤資料]\n股票名稱或代碼 alias 別名\n[設定別名]\n股票名稱或代碼 unalias 別名\n[取消別名]\nalias\n[顯示所有別名]`,
    switchTextMode: '切換文字模式',
    switchImgMode: '切換圖片模式',
    switchOffMode: '停止',
    addStock: '增加到自選',
    deleteStock: '從自選中移除',
    noUserStocks: '空',
    noThisYearDividendData: '查無今年除權息資料'
}

module.exports = {
    FILE_PATH,
    BOT_MODE,
    COMMANDS,
    RESPONSE,
    REGEX,
    DIRECTORIES
}