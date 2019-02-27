const jsonfile = require('jsonfile');

function mapToJson(map) {
    return JSON.stringify([...map]);
}

function jsonToMap(jsonStr) {
    return new Map(JSON.parse(jsonStr));
}

async function loadMap(file) {
    return new Promise((resolve, reject) => {
        jsonfile.readFile(file, function (err, obj) {
            if (err) {
                resolve(new Map());
            } else {
                resolve(jsonToMap(obj));
            }
        })
    })
}

async function saveMap(file, map) {
    return new Promise((resolve, reject) => {
        let obj = mapToJson(map);
        jsonfile.writeFile(file, obj, function (err) {
            if (err) return console.error(err);
            resolve();
        })
    })
}





module.exports = {
    mapToJson,
    jsonToMap,
    loadMap,
    saveMap
}