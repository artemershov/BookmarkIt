/* global popupReset */

angular.module('app', ['ngRoute', 'dndLists']).config(['$routeProvider', '$locationProvider', ($routeProvider, $locationProvider) => {

  $locationProvider.html5Mode(true);

  let appData = {
    data: ['ajaxAPI', (ajaxAPI) => ajaxAPI.init()]
  };

  $routeProvider
    .when('/', {
      templateUrl: 'view/main.html',
      controller:  'MainController',
      resolve: appData,
    })
    .when('/fav', {
      templateUrl: 'view/main.html',
      controller:  'MainController',
      resolve: appData,
    })
    .when('/group/:gid', {
      templateUrl: 'view/main.html',
      controller:  'MainController',
      resolve: appData,
    })
    .when('/auth', {
      templateUrl: 'view/auth.html',
      controller:  'AuthController',
    })
    .when('/logout', {
      resolve: {
        data: ['ajaxAPI', (ajaxAPI) => ajaxAPI.user.logout()]
      }
    })
    .otherwise({
      redirectTo: '/',
    });

}]);

angular.module('app').run(['$rootScope', 'cookie', 'route', ($rootScope, cookie, route) => {
  $rootScope.$on('$routeChangeStart', (event, next) => {
    if (!cookie.get() && next.originalPath !== '/auth') {
      event.preventDefault();
      route.set('/auth');
      $rootScope.error = 'Not authorized';
    } else if (cookie.get() && next.originalPath == '/auth') {
      event.preventDefault();
      route.set('/');
    }
    window.scrollTo(0, 0);
    popupReset();
  });
}]);
