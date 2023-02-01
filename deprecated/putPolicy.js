// scraper
const jsdom = require("jsdom");
const functions = require("../functions/handleWebScraping");
let { handleTxt, removeHtml } = functions;
//aws
var AWS = require("aws-sdk");
const bucketName = "yayapunsenior";
// Set the AWS Region.
AWS.config.update({
  region: "ap-northeast-1",
  maxRetries: 15,
  retryDelayOptions: { base: 500 },
});
s3 = new AWS.S3();

// Create DynamoDB service object.
var ddb = new AWS.DynamoDB();

const params = {
  // Set the projection expression, which are the attributes that you want.
  ProjectionExpression: "appId, policyUrl",
  TableName: "application-info",
  Limit: 10,
};

ddb.scan(params, function (err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);
    data.Items.forEach(function (element, index, array) {
      var url = element.policyUrl.S;
      var uploadParams = { Bucket: bucketName, Key: "", Body: "" };
      uploadParams.Key = element.appId.S + ".txt";
      if (url.slice(-3) !== "txt") {
        jsdom.JSDOM.fromURL(url).then((dom) => {
          var text = dom.window.document.querySelector("body").textContent;
          text = removeHtml(text);
          uploadParams.Body = text;
          putToS3(uploadParams);
        });
      } else {
        uploadParams.Body = handleTxt(url);
        putToS3(uploadParams);
      }
    });
  }
});

function putToS3(params) {
  console.log(params.Key);
  if (params.Body) {
    s3.upload(params, function (s3Err, data) {
      if (s3Err) throw s3Err;
    });
  }
}
