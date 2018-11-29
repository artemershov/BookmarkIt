/* global Cookie, popupReset */

const app = angular.module('app', ['ngRoute', 'dndLists']);
app.config([
  '$routeProvider',
  '$locationProvider',
  ($routeProvider, $locationProvider) => {
    $locationProvider.html5Mode(true);

    let appData = {
      data: ['ajaxAPI', ajaxAPI => ajaxAPI.init()],
    };

    $routeProvider
      .when('/', {
        templateUrl: 'view/main.html',
        controller: 'MainController',
        resolve: appData,
      })
      .when('/fav', {
        templateUrl: 'view/main.html',
        controller: 'MainController',
        resolve: appData,
      })
      .when('/group/:gid', {
        templateUrl: 'view/main.html',
        controller: 'MainController',
        resolve: appData,
      })
      .when('/auth', {
        templateUrl: 'view/auth.html',
        controller: 'AuthController',
      })
      .when('/logout', {
        resolve: {
          data: ['ajaxAPI', ajaxAPI => ajaxAPI.user.logout()],
        },
      })
      .otherwise({
        redirectTo: '/',
      });
  },
]);

app.constant('AppName', 'BookmarkIt');

app.run([
  '$rootScope',
  'route',
  'AppName',
  ($rootScope, route, AppName) => {
    let cookie = new Cookie(AppName);
    $rootScope.$on('$routeChangeStart', (event, next) => {
      if (!cookie.get() && next.originalPath !== '/auth') {
        event.preventDefault();
        route.set('/auth');
      } else if (cookie.get() && next.originalPath == '/auth') {
        event.preventDefault();
        route.set('/');
      }
      window.scrollTo(0, 0);
      popupReset();
    });
  },
]);
