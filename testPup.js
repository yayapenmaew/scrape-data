const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.joom.com/privacy");
  const extractedText = await page.$eval("*", (el) => el.innerText);
  console.log(extractedText);
  await browser.close();
})();
