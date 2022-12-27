var gplay = require("google-play-scraper");
const jsdom = require("jsdom");
var url = "https://www.innersloth.com/privacy-policy/ ";

gplay
  .list({
    category: gplay.category.GAME_ACTION,
    collection: gplay.collection.TOP_FREE,
    num: 1,
  })
  .then((lists) =>
    lists.forEach((list) =>
      gplay.datasafety({ appId: list.appId }).then((datasafety) => {
        console.log(datasafety.privacyPolicyUrl);
        if (url.slice(-3) !== "txt") {
          console.log(url);
          jsdom.JSDOM.fromURL(url).then((dom) => {
            console.log(dom.window.document.querySelector("body").textContent);
          });
        } else {
          handelTxt(url);
        }
      })
    )
  );

function handelTxt(url) {
  fetch(url).then(function (response) {
    response.text().then(function (text) {
      console.log(text);
    });
  });
}

/* 
console.log(dom.serialize());
            console.log(
              dom.window.document
                .querySelector("body")
                .textContent.search("Privacy Policy") == -1
            );

 */
