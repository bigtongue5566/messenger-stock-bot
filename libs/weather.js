const axios = require('axios')
const jsdom = require('jsdom')
const iconv = require('iconv-lite')
const {
    dump
} = require('dumper.js')
const {
    JSDOM
} = jsdom;

const regionName = {
    'Taipei_City': 'Taipei_City',
    'New_Taipei_City': 'New_Taipei_City',
    'Taoyuan_City': 'Taoyuan_City',
    'Taichung_City': 'Taichung_City',
    'Tainan_City': 'Tainan_City',
    'Kaohsiung_City': 'Kaohsiung_City',
    'Keelung_City': 'Keelung_City',
    'Hsinchu_City': 'Hsinchu_City',
    'Hsinchu_County': 'Hsinchu_County',
    'Miaoli_County': 'Miaoli_County',
    'Changhua_County': 'Changhua_County',
    'Nantou_County': 'Nantou_County',
    'Yunlin_County': 'Yunlin_County',
    'Chiayi_City': 'Chiayi_City',
    'Chiayi_County': 'Chiayi_County',
    'Pingtung_County': 'Pingtung_County',
    'Yilan_County': 'Yilan_County',
    'Hualien_County': 'Hualien_County',
    'Taitung_County': 'Taitung_County',
    'Penghu_County': 'Penghu_County',
    'Kinmen_County': 'Kinmen_County',
    'Lienchiang_County': 'Lienchiang_County'
};

async function getTonightWeather(){
    let time = new Date().getTime;
    let res = await axios.get(`https://www.cwb.gov.tw/V7/forecast/f_index.htm?_=${time}`);
    const { document } = (new JSDOM(res.data)).window;
    const city = ['Keelung','TaipeiCity','Taipei','Taoyuan','HsinchuCity','Hsinchu','Miaoli','Taichung','Changhua','Nantou','Yunlin','ChiayiCity','Chiayi','Yilan','Hualien','Taitung','Tainan','KaohsiungCity','Pingtung','Matsu','Kinmen','Penghu']
    let weather={};
    city.forEach(e=>{
        weather[e]={
            name:document.querySelector(`#${e}List > td:nth-child(1)`).textContent,
            temp:document.querySelector(`#${e}List > td:nth-child(2)`).textContent,
            pop:document.querySelector(`#${e}List > td:nth-child(3)`).textContent,
            status:document.querySelector(`#${e}List > td:nth-child(4)`).getAttribute('alt')
        }
    });
}

async function getRegionWeather(regionName){
    let res = await axios.get(`https://www.cwb.gov.tw/V7/forecast/taiwan/${regionName}.htm`);
    const { document } = (new JSDOM(res.data)).window;
    let intervalNodes = document.querySelectorAll('#box8 > table > tbody > tr')
    let tonightNode = [...intervalNodes].find(e=>e.querySelector('th').textContent.includes('今晚至明晨'));
    return {
        name:document.querySelector('a.currentPage').textContent,
        internals:{
            tonightToMorning:{
                name:tonightNode.querySelector('th').textContent.split(' ')[0],
                temp:`${tonightNode.querySelector('td:nth-of-type(1)').textContent}℃`,
                status:tonightNode.querySelector('td:nth-of-type(2) > img').getAttribute('alt'),
                feeling:tonightNode.querySelector('td:nth-of-type(3)').textContent,
                pop:tonightNode.querySelector('td:nth-of-type(4)').textContent
            }
        }
    }
}

module.exports = {
    regionName,
    getTonightWeather,
    getRegionWeather
}