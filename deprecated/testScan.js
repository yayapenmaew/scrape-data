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
let LastEvaluatedKey = "";
const params = {
  // Set the projection expression, which are the attributes that you want.
  ProjectionExpression: "appId, policyUrl",
  TableName: "application-info",
  Limit: 20,
};
if (LastEvaluatedKey != "") {
  params.ExclusiveStartKey = { appId: { S: LastEvaluatedKey } };
}
(async () => {
  ddb.scan(params, function (err, data) {
    data.Items.forEach(async function (element, index, array) {
      let url = element.policyUrl.S;
      console.log(url);
    });
    console.log(data.LastEvaluatedKey);
  });
})();
