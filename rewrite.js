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
var count = 0;
const fail_url = [];
const fail_text = [];
const params = {
  // Set the projection expression, which are the attributes that you want.
  ProjectionExpression: "appId, policyUrl",
  TableName: "application-info",
  Limit: 1,
};
(async () => {
  ddb.scan(params, async function (err, data) {
    await Promise.all(
      data.Items.map(async function (element, index, array) {
        let url = element.policyUrl.S;
        url = "https://www.gamovation.com/legal/privacy-policy.pdf";
        var uploadParams = { Bucket: bucketName, Key: "", Body: "" };
        uploadParams.Key = element.appId.S + ".txt";
        await scrapeText(url, uploadParams);
      })
    );
  });
})();

async function scrapeText(url, uploadParams) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  //await page.setDefaultNavigationTimeout(100000);
  let extractedText = "";
  //console.log(url);
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
  );
  /* await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.resourceType() === "document") {
      request.continue();
    } else {
      request.abort();
    }
  }); */
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });
    extractedText = await page.$eval("*", (el) => el.innerText);
  } catch (e) {
    fail_url.push(url);
    console.log(e);
  }
  uploadParams.Body = extractedText;
  console.log(extractedText);
  await browser.close();
  return extractedText;
}

function putToS3(params) {
  if (params.Body) {
    s3.upload(params, function (s3Err, data) {
      if (s3Err) throw s3Err;
    });
  }
}
