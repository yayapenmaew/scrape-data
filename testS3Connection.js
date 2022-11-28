var gplay = require("google-play-scraper");
var tableName = "application-info";
var AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });

s3 = new AWS.S3();

// Call S3 to list the buckets
s3.listBuckets(function (err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.Buckets);
  }
});
