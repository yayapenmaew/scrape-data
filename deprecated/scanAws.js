// Load the AWS SDK for Node.js.
var AWS = require("aws-sdk");
// Set the AWS Region.
AWS.config.update({
  region: "ap-northeast-1",
  maxRetries: 15,
  retryDelayOptions: { base: 500 },
});

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
      console.log(
        "printing",
        element.policyUrl.S + " (" + element.appId.S + ")"
      );
    });
  }
});
