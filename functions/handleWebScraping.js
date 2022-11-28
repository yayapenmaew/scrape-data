module.exports.handleTxt = (url) => {
  fetch(url).then(function (response) {
    response.text().then(function (text) {
      return text;
    });
  });
};

module.exports.removeHtml = (text) => {
  text
    .replace(/<style[^>]*>.*<\/style>/gm, "")
    // Remove script tags and content
    .replace(/<script[^>]*>.*<\/script>/gm, "")
    // Remove all opening, closing and orphan HTML tags
    .replace(/<[^>]+>/gm, "")
    // Remove leading spaces and repeated CR/LF
    .replace(/([\r\n]+ +)+/gm, "");
  return text;
};
