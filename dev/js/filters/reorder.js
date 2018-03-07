angular.module('app').filter('bookmarksReorderFilter', () => (input, from, to) => {
  let out = [];
  if (input) {
    let i = input.length;
    while (i--) {
      let b = input[i];
      if (b.pos > Math.min(from, to) && b.pos < Math.max(from, to)) out.push(b);
    }
  }
  return out;
});
