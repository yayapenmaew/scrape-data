const puppeteer = require("puppeteer");
var AWS = require("aws-sdk");
const bucketName = "yayatestpupnew";
AWS.config.update({
  region: "ap-northeast-1",
  maxRetries: 15,
  retryDelayOptions: { base: 500 },
});
s3 = new AWS.S3();
var ddb = new AWS.DynamoDB();
const params = {
  // Set the projection expression, which are the attributes that you want.
  ProjectionExpression: "appId, policyUrl",
  TableName: "application-info",
  Limit: 1,
};

(async () => {
  ddb.scan(params, function (err, data) {
    data.Items.forEach(async function (element, index, array) {
      let url = element.policyUrl.S;
      url = "https://www.spotangels.com/privacy";
      var uploadParams = { Bucket: bucketName, Key: "", Body: "" };
      uploadParams.Key = element.appId.S + ".txt";
      await scrapeText(url, uploadParams);
      //putToS3(uploadParams);
    });
  });
})();

async function scrapeText(url, uploadParams) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const extractedText = await page.$eval("*", (el) => el.innerText);
  uploadParams.Body = extractedText;
  console.log(extractedText);
  await browser.close();
  return extractedText;
}
/* 
async function scrapeText2(url) {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = (await browser.pages())[0];
  await page.goto(url, { waitUntil: "networkidle0" });
  // await page.screenshot();
  const extractedText = await page.$eval("*", (el) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNode(el);
    selection.removeAllRanges();
    selection.addRange(range);
    return window.getSelection().toString();
  });
  //console.log(extractedText);

  await browser.close();
  return extractedText;
} */

function putToS3(params) {
  if (params.Body) {
    s3.upload(params, function (s3Err, data) {
      if (s3Err) throw s3Err;
    });
  }
}
/* (async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.joom.com/privacy");
  const extractedText = await page.$eval("*", (el) => el.innerText);
  console.log(extractedText);
  await browser.close();
})(); */
