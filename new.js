const fail_urls = [
  { appId: "appId", policyUrl: "url" },
  { appId: "appId", policyUrl: "url" },
];
let params = {
  RequestItems: {
    "fail-urls": [],
  },
};
for (let i = 0; i < fail_urls.length; i++) {
  let curr = fail_urls[i];
  params.RequestItems["fail-urls"].push({
    PutRequest: {
      Item: {
        appId: { S: curr.appId },
        policyUrl: { S: curr.policyUrl },
      },
    },
  });
}
console.log(params);
