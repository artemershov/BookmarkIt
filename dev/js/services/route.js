/* global app */

app.factory('route', ['$routeParams', '$location', ($routeParams, $location) => {

  const route = {
    get: () => ({
      path: $location.path(),
      page: $location.path().split('/')[1],
      gid:  $routeParams.gid,
    }),
    set: path => $location.path(path),
  };

  return route;

}]);
