var gplay = require("google-play-scraper");
const jsdom = require("jsdom");

gplay
  .list({
    category: gplay.category.GAME_CARD,
    collection: gplay.collection.TOP_FREE,
    num: 20,
  })
  .then((lists) =>
    lists.forEach((list) =>
      gplay.datasafety({ appId: list.appId }).then((datasafety) => {
        var url = datasafety.privacyPolicyUrl;
        if (url.slice(-3) !== "txt") {
          //console.log("just: " + url);
          jsdom.JSDOM.fromURL(url).then((dom) => {
            if (
              dom.window.document
                .querySelector("body")
                .textContent.search("Privacy Policy") == -1
            ) {
              console.log("this: " + url);
            }
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
      if (text.search("Privacy Policy") == -1) console.log("this: " + url);
    });
  });
}

/* 
https://abigames.com.vn/policy/ → ideal
https://www.innersloth.com/privacy-policy/ → ตาราง
https://www.scopely.com/en/legal?id=privacyQ42022 → dropdown

 */
