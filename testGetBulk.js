var gplay = require("google-play-scraper");
var tableName = "application-info";
var AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
var ddb = new AWS.DynamoDB();
var cat = gplay.category.GAME_ACTION;

gplay
  .list({
    category: cat,
    collection: gplay.collection.TOP_FREE,
    num: 200,
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
      });
    })
  );
