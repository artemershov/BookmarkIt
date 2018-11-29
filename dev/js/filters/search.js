/* global app */

app.filter('bookmarksSearch', () => (input, query) => {
  if (query) {
    query = query.toLowerCase();

    let out = [];
    let i = input.length;

    while (i--) {
      let b = input[i];
      if (b.title && b.title.toLowerCase().indexOf(query) !== -1) {
        out.push(b);
      } else if (b.text && b.text.toLowerCase().indexOf(query) !== -1) {
        out.push(b);
      } else if (b.link && b.link.toLowerCase().indexOf(query) !== -1) {
        out.push(b);
      }
    }

    return out;
  } else {
    return input;
  }
});
