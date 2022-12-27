//axios and cheerio
const axios = require("axios");
// scraper
const jsdom = require("jsdom");
const functions = require("./functions/handleWebScraping");
let { removeHtml } = functions;

var AWS = require("aws-sdk");
const bucketName = "yayapuntestextract";
// Set the AWS Region.
AWS.config.update({
  region: "ap-northeast-1",
  maxRetries: 15,
  retryDelayOptions: { base: 500 },
});
s3 = new AWS.S3();

// Create DynamoDB service object.
var ddb = new AWS.DynamoDB();

function http_request(url, params) {
  return new Promise(async (resolve) => {
    await axios
      .get(url, {
        headers: {
          "Accept-Encoding": "gzip,deflate,compress",
          "Content-Type": "application/json",
        },
      })
      .then((r) => {
        //r.headers["content-type"];
        const data = removeHtml(r.data);
        params.Body = data;
        console.log(data);
        //putToS3(params);
      });
    // -- DO STUFF
    resolve();
  });
}
function putToS3(params) {
  if (params.Body) {
    s3.upload(params, function (s3Err, data) {
      if (s3Err) throw s3Err;
    });
  }
}
async function many_requests(num_requests) {
  let params = {
    // Set the projection expression, which are the attributes that you want.
    ProjectionExpression: "appId, policyUrl",
    TableName: "application-info",
    Limit: num_requests,
  };
  ddb.scan(params, function (err, data) {
    data.Items.forEach(function (element, index, array) {
      let url = element.policyUrl.S;
      url =
        "https://toolsyep.com/en/webpage-to-plain-text/?u=" +
        encodeURIComponent(url);
      var uploadParams = { Bucket: bucketName, Key: "", Body: "" };
      uploadParams.Key = "test." + element.appId.S + ".txt";
      http_request(url, uploadParams);
    });
  });
}

async function run() {
  await many_requests(1);
}

run();
