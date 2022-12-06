var gplay = require("google-play-scraper");
var tableName = "application-info";
var AWS = require("aws-sdk");
AWS.config.update({
  region: "ap-northeast-1",
  maxRetries: 15,
  retryDelayOptions: { base: 500 },
});
var ddb = new AWS.DynamoDB();
var cat = gplay.category.PHOTOGRAPHY;

gplay
  .list({
    category: cat,
    collection: gplay.collection.TOP_FREE,
    num: 300,
  })
  .then((lists) =>
    lists.forEach((list) => {
      gplay.datasafety({ appId: list.appId }).then((datasafety) => {
        var params = {
          TableName: tableName,
          Item: {
            appId: { S: list.appId },
            appName: { S: list.title },
            appCategory: { S: cat },
            policyUrl: { S: datasafety.privacyPolicyUrl },
          },
        };
        if (datasafety.privacyPolicyUrl) {
          ddb.putItem(params, function (err, data) {
            if (err) {
              console.log("Error", err);
            }
          });
        }
      });
    })
  );
