var gplay = require("google-play-scraper");
const jsdom = require("jsdom");
var url = "https://www.innersloth.com/privacy-policy/ ";
const functions = require("./functions/handleWebScraping");
var AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
var uploadParams = { Bucket: "yayapunsenior", Key: "", Body: "" };

s3 = new AWS.S3();
let { handleTxt, removeHtml } = functions;
gplay
  .list({
    category: gplay.category.GAME_ACTION,
    collection: gplay.collection.TOP_FREE,
    num: 1,
  })
  .then((lists) =>
    lists.forEach((list) =>
      gplay.datasafety({ appId: list.appId }).then((datasafety) => {
        uploadParams.Key = list.appId + ".txt";
        console.log(datasafety.privacyPolicyUrl);
        if (url.slice(-3) !== "txt") {
          console.log(url);
          jsdom.JSDOM.fromURL(url).then((dom) => {
            var text = dom.window.document.querySelector("body").textContent;
            text = removeHtml(text);
            //console.log(text);
            uploadParams.Body = text;
            s3.upload(uploadParams, function (s3Err, data) {
              if (s3Err) throw s3Err;
              console.log(`File uploaded successfully at ${data.Location}`);
            });
          });
        } else {
          handleTxt(url);
        }
      })
    )
  );
