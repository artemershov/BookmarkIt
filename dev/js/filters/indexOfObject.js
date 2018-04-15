/* global app */

app.filter('indexOfObject', () => (arr, obj) => {
  let i = arr.length;
  while (i--) if (angular.equals(arr[i], obj)) return i;
  return -1;
});
