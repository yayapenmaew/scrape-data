const puppeteer = require("puppeteer");
var AWS = require("aws-sdk");
const bucketName = "yayapunseniorproject";
AWS.config.update({
  region: "ap-northeast-1",
  maxRetries: 15,
  retryDelayOptions: { base: 500 },
});
s3 = new AWS.S3();
var ddb = new AWS.DynamoDB();
var countOk = 0;
var countRun = 0;
const fail_run = [];
const params = {
  // Set the projection expression, which are the attributes that you want.
  ProjectionExpression: "appId, policyUrl",
  TableName: "application-info",
  Limit: 1500,
  ExclusiveStartKey: { appId: { S: "com.conexsys.myleadsmobile" } },
};
ddb.scan(params, async function (err, data) {
  const arr = data.Items;
  for (let i = 0; i < arr.length; i++) {
    countRun++;
    let curr = arr[i];
    let url = curr.policyUrl.S;
    let appId = curr.appId.S;
    //url = "https://www.gamovation.com/legal/privacy-policy.pdf";
    var uploadParams = { Bucket: bucketName, Key: "", Body: "" };
    uploadParams.Key = curr.appId.S + ".txt";
    await scrapeText(appId, url, uploadParams);
    putToS3(uploadParams);
    if (uploadParams.Body && uploadParams.Body != "") {
      countOk++;
      putToS3(uploadParams);
    }
    //console.log(uploadParams.Body);
  }
  console.log("Ran: ", countRun);
  console.log("Ok: ", countOk);
  //console.log(fail_run);
  console.log(data.LastEvaluatedKey);
  putFailToDb(fail_run);
});

async function scrapeText(appId, url, uploadParams) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  //await page.setDefaultNavigationTimeout(100000);
  let extractedText = "";
  //console.log(url);
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
  );
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });
    extractedText = await page.$eval("*", (el) => el.innerText);
  } catch (e) {
    fail_run.push({ appId: appId, policyUrl: url });
    console.log(e);
  }
  uploadParams.Body = extractedText;
  //console.log(extractedText);
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

function putFailToDb(fail_urls) {
  let params = {
    RequestItems: {
      "fail-urls": [],
    },
  };
  for (let i = 0; i < fail_urls.length; i++) {
    let curr = fail_urls[i];
    params.RequestItems["fail-urls"].push({
      PutRequest: {
        Item: {
          appId: { S: curr.appId },
          policyUrl: { S: curr.policyUrl },
        },
      },
    });
  }
  ddb.batchWriteItem(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
}
