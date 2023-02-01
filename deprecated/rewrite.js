const puppeteer = require("puppeteer");
const jsdom = require("jsdom");

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
        url = "https://www.gazeus.com/privacy-policy/?game=dominoesbattle";
        var uploadParams = { Bucket: bucketName, Key: "", Body: "" };
        uploadParams.Key = element.appId.S + ".txt";
        if (url.endsWith(".pdf")) scrapeTextFromPdf(url, uploadParams);
        else await scrapeText(url, uploadParams);
        console.log(uploadParams.Body);
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
    var err = e + "";
    console.log(err.trim().split("\n")[0]);
  }
  uploadParams.Body = extractedText;
  console.log(extractedText);
  await browser.close();
  return extractedText;
}

function scrapeTextFromPdf(url, uploadParams) {
  url =
    "https://toolsyep.com/en/webpage-to-plain-text/?u=" +
    encodeURIComponent(url);
  jsdom.JSDOM.fromURL(url).then((dom) => {
    var text = dom.window.document.querySelector("body").textContent;
    //text = removeHtml(text);
    console.log(text);
    uploadParams.Body = text;
    //putToS3(uploadParams);
  });
}

function putToS3(params) {
  if (params.Body) {
    s3.upload(params, function (s3Err, data) {
      if (s3Err) throw s3Err;
    });
  }
}
