angular.module('app').filter('bookmarksSearch', () => (input, query) => {

  // TODO: toLowercase
  if (query) {

    let out = [];
    let i = input.length;
    while (i--) {
      let b = input[i];
      if (b.title && b.title.indexOf(query) !== -1) {
        out.push(b);
      } else if (b.text && b.text.indexOf(query) !== -1) {
        out.push(b);
      } else if (b.link && b.link.indexOf(query) !== -1) {
        out.push(b);
      }
    }

    return out;

  } else {

    return input;

  }

});
