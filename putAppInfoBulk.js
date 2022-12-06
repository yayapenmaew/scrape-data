const functions = require("./lib/app-categories");
var gplay = require("google-play-scraper");
var AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
var ddb = new AWS.DynamoDB();

var tableName = "application-info"; //aws dynamoDb table name
let cat = functions;
for (const key in cat.category) {
  putAppsInfoByCat(cat.category[key]);
}

function putAppsInfoByCat(category) {
  gplay
    .list({
      category: category,
      collection: gplay.collection.TOP_FREE,
      num: 250,
      throttle: 10,
    })
    .then((lists) =>
      lists.forEach((list) => {
        gplay.datasafety({ appId: list.appId }).then((datasafety) => {
          var params = {
            TableName: tableName,
            Item: {
              appId: { S: list.appId },
              appName: { S: list.title },
              appCategory: { S: category },
              policyUrl: { S: datasafety.privacyPolicyUrl },
            },
          };
          datasafety.privacyPolicyUrl &&
            ddb.putItem(params, function (err, data) {
              if (err) {
                var error = err + "";
                console.log("Error", error.substring(0, 20));
              }
            });
        });
      })
    );
}
