var AWS = require("aws-sdk");
// Set the region
AWS.config.update({ region: "ap-northeast-1" });

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB();

var params = {
  TableName: "application-info",
  Key: {
    appId: { S: "001" },
  },
};

// Call DynamoDB to get the item from the table
ddb.getItem(params, function (err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.Item);
  }
});
