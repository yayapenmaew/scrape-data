var AWS = require("aws-sdk");
// Set the region
AWS.config.update({ region: "ap-northeast-1" });

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB();

var params = {
  TableName: "application-info",
  Key: {
    appId: { S: "com.innersloth.spacemafia" },
  },
};

// Call DynamoDB to delete the item from the table
ddb.deleteItem(params, function (err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);
  }
});
