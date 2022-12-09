var gplay = require("google-play-scraper");

gplay
  .list({
    category: gplay.category.GAME_CARD,
    collection: gplay.collection.TOP_FREE,
    num: 20,
  })
  .then((lists) =>
    lists.forEach((list) =>
      gplay.datasafety({ appId: list.appId }).then((datasafety) => {
        console.log(list.appId, datasafety.privacyPolicyUrl);
      })
    )
  );

/* 
https://abigames.com.vn/policy/ → ideal
https://www.innersloth.com/privacy-policy/ → ตาราง
https://www.scopely.com/en/legal?id=privacyQ42022 → dropdown

 */
