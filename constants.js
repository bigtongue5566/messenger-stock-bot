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
    textMode: /^mode:text$/,
    imgMode: /^mode:img$/,
    offMode: /^mode:off$/,
    investors: /^法人$/,
    stocks: /^自選$/,
    t00: /^大盤$/
}

const RESPONSE = {
    switchTextMode: '切換文字模式',
    switchImgMode: '切換圖片模式',
    switchOffMode: '停止',
    addStock: '增加到自選',
    deleteStock: '從自選中移除',
    noUserStocks: '空'
}

module.exports = {
    FILE_PATH,
    BOT_MODE,
    COMMANDS,
    RESPONSE,
    REGEX,
    DIRECTORIES
}