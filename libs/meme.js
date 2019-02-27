const {
    regionName,
    getRegionWeather
} = require('./weather')

function KindReminder() {
    let rainRegion = [];
    let coldRegion = [];
    let chillyRegion = [];
    let burningRegion = [];
    let hotRegion = [];
    let comfortableRegion = [];
    this.add = function (regionWeather) {
        if (regionWeather.internals.tonightToMorning.status.includes('雨')) {
            rainRegion.push(regionWeather);
            return
        }
        if (regionWeather.internals.tonightToMorning.feeling === '舒適') {
            comfortableRegion.push(regionWeather);
            return
        }
        if (regionWeather.internals.tonightToMorning.feeling.includes('寒冷')) {
            coldRegion.push(regionWeather);
            return
        }
        if (regionWeather.internals.tonightToMorning.feeling.includes('寒意')) {
            chillyRegion.push(regionWeather);
            return
        }
        if (regionWeather.internals.tonightToMorning.feeling.includes('中暑')) {
            burningRegion.push(regionWeather);
            return
        }
        if (regionWeather.internals.tonightToMorning.feeling.includes('悶熱')) {
            hotRegion.push(regionWeather);
            return
        }
    }
    this.toString = function () {
        let minder = '貼心小叮嚀:\n';
        minder += '今晚\n';
        if (rainRegion.length) {
            minder += rainRegion.reduce((accumulator, currentValue) => {
                return `${accumulator}${currentValue.name} ${currentValue.internals.tonightToMorning.status}\n`
            }, '')
            minder += '住公園的慘戶\n記得攜帶雨具\n\n';
        }
        if (coldRegion.length) {
            minder += coldRegion.reduce((accumulator, currentValue) => {
                return `${accumulator}${currentValue.name} ${currentValue.internals.tonightToMorning.feeling}\n`
            }, '')
            minder += `住公園的慘戶\n注意保暖\n\n`;
        }
        if (chillyRegion.length) {
            minder += chillyRegion.reduce((accumulator, currentValue) => {
                return `${accumulator}${currentValue.name} ${currentValue.internals.tonightToMorning.feeling}\n`
            }, '')
            minder += `住公園的慘戶\n記得多加件外套\n\n`;
        }
        if (burningRegion.length) {
            minder += burningRegion.reduce((accumulator, currentValue) => {
                return `${accumulator}${currentValue.name} ${currentValue.internals.tonightToMorning.feeling}\n`
            }, '')
            minder += `住公園的慘戶\n小心中暑\n\n`;
        }
        if (hotRegion.length) {
            minder += hotRegion.reduce((accumulator, currentValue) => {
                return `${accumulator}${currentValue.name} ${currentValue.internals.tonightToMorning.feeling}\n`
            }, '')
            minder += `住公園的慘戶\n記得多補充水分\n\n`;
        }
        if (comfortableRegion.length) {
            minder += comfortableRegion.reduce((accumulator, currentValue) => {
                return `${accumulator}${currentValue.name} ${currentValue.internals.tonightToMorning.feeling}\n`
            }, '')
            minder += `住公園的慘戶\n不用擔心\n\n`;
        }
        return minder;
    }
}

async function parkTonight() {
    let pickedRegions = [regionName.Taipei_City, regionName.Taichung_City, regionName.Changhua_County]
    let kindReminder = new KindReminder();
    //let meme = '';
    for (let region of pickedRegions) {
        let regionWeather = await getRegionWeather(region);
        kindReminder.add(regionWeather);
        // meme += `${regionWeather.name} 今晚\n`
        // meme += `${regionWeather.internals.tonightToMorning.status}\n`
        // meme += `${regionWeather.internals.tonightToMorning.feeling}\n`
        // meme += `\n`
    }
    return `${kindReminder.toString()}`
}

const MEME = {
    lol: ['笑鼠人'],
    earnMuch: [],
    earn: ['睏霸鼠錢', '賺', '起飛', '無腦多', '糕點到了?', '空軍不死 多頭不止', '古拉克利多', '等康普漲回130 再裝回APP'],
    lossMuch: [parkTonight],
    loss: ['崩崩', '今天住公園', '電梯向下', '慘', '一張不賣 奇蹟自來', '一張不賣 悲從中來', '攤平再攤平 攤到躺平', '別人恐懼 我貪婪', '別人恐懼，我更恐懼', '難道今天只有我賠錢', '佛系投資', '等康普漲回130 再裝回APP','99 #stockCode','99 #stockName'],
    unchanged: ['美四 美四']
}

async function getByPercentageChange(percentageChange, stock) {
    let meme;
    switch (true) {
        case percentageChange > 0:
            meme = await getRandElement(MEME.earn);
            break;
        case percentageChange < -7:
            meme = await getRandElement(MEME.lossMuch)();
            break;
        case percentageChange < 0:
            meme = await getRandElement(MEME.loss);
            break;
        default:
            meme = await getRandElement(MEME.unchanged);
            break;
    }
    meme = meme.replace(/#stockCode/g, stock.code);
    meme = meme.replace(/#stockName/g, stock.name);
    return meme;
}

function earn() {
    return getRandElement(MEME.earn);
}

function loss() {
    return getRandElement(MEME.loss);
}

function lol() {
    return getRandElement(MEME.lol);
}

function getRandElement(strArr) {
    return strArr[Math.floor(Math.random() * strArr.length)]
}

module.exports = {
    getByPercentageChange,
    earn: earn(),
    loss: loss(),
    lol: lol()
}