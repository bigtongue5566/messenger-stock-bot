const { getDividend } = require('./goodInfo');

(async () => {
  const dividendData = await getDividend({ code: 8069 });
  console.log(dividendData);
})();
