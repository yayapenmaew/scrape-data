var gplay = require("google-play-scraper");
var AWS = require("aws-sdk");
const jsdom = require("jsdom");
const functions = require("./functions/handleWebScraping");
AWS.config.update({ region: "ap-northeast-1" });
const bucketName = "yayapunsenior";
//let uploadParams = { Bucket: "yayapunsenior", Key: "", Body: "" };

s3 = new AWS.S3();
let { handleTxt, removeHtml } = functions;

gplay
  .list({
    category: gplay.category.FINANCE,
    collection: gplay.collection.TOP_FREE,
    num: 10,
  })
  .then((lists) =>
    lists.forEach((list) => {
      console.log(list.appId);
      gplay.datasafety({ appId: list.appId }).then((datasafety) => {
        var url = datasafety.privacyPolicyUrl;
        var uploadParams = { Bucket: bucketName, Key: "", Body: "" };
        uploadParams.Key = list.appId + ".txt";
        if (url.slice(-3) !== "txt") {
          jsdom.JSDOM.fromURL(url).then((dom) => {
            var text = dom.window.document.querySelector("body").textContent;
            text = removeHtml(text);
            uploadParams.Body = text;
            putToS3(uploadParams);
          });
        } else {
          uploadParams.Body = handleTxt(url);
          putToS3(uploadParams);
        }
      });
    })
  );

function putToS3(params) {
  console.log(params.Key);
  if (params.Body) {
    s3.upload(params, function (s3Err, data) {
      if (s3Err) throw s3Err;
    });
  }
}
