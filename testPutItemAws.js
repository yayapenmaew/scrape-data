var AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
var ddb = new AWS.DynamoDB();
var params = {
  TableName: "application-info",
  Item: {
    appId: { S: "001" },
    appName: { S: "Richard Roe" },
    appCategory: { S: "Richard Roe" },
    policyUrl: { S: "RichardRoe.com" },
  },
};

ddb.putItem(params, function (err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);
  }
});
