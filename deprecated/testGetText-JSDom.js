// scraper
const jsdom = require("jsdom");
const functions = require("../functions/handleWebScraping");
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

const params = {
  // Set the projection expression, which are the attributes that you want.
  ProjectionExpression: "appId, policyUrl",
  TableName: "application-info",
  Limit: 1,
};

ddb.scan(params, function (err, data) {
  data.Items.forEach(function (element, index, array) {
    let url = element.policyUrl.S;
    url =
      "https://toolsyep.com/en/webpage-to-plain-text/?u=" +
      encodeURIComponent(url);
    var uploadParams = { Bucket: bucketName, Key: "", Body: "" };
    uploadParams.Key = element.appId.S + ".txt";
    jsdom.JSDOM.fromURL(url).then((dom) => {
      var text = dom.window.document.querySelector("body").textContent;
      console.log(text);
      text = removeHtml(text);
      uploadParams.Body = text;
      //putToS3(uploadParams);
    });
  });
});

function putToS3(params) {
  if (params.Body) {
    s3.upload(params, function (s3Err, data) {
      if (s3Err) throw s3Err;
    });
  }
}
