angular.module('app').filter('getById', () => (input, id) => {
  let i = input.length;
  while(i--) if (input[i].id == id) return input[i];
});
