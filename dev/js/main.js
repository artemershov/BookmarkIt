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

angular.module('app').run(['$rootScope', $rootScope => {
  $rootScope.$on('$routeChangeStart', () => {
    window.scrollTo(0, 0);
    popupReset();
  });
}]);
