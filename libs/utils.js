// eslint-disable-next-line import/no-unresolved
const jsonfile = require('jsonfile');

function mapToJson(map) {
  return JSON.stringify([...map]);
}

function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr));
}

async function loadMap(file) {
  try {
    return jsonToMap(await jsonfile.readFile(file));
  } catch (error) {
    return new Map();
  }
}

async function saveMap(file, map) {
  return new Promise((resolve, reject) => {
    const obj = mapToJson(map);
    jsonfile.writeFile(file, obj, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}


module.exports = {
  mapToJson,
  jsonToMap,
  loadMap,
  saveMap,
};
