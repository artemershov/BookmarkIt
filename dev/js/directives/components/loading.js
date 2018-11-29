/* global app */

app.directive('loading', [
  '$rootScope',
  $rootScope => ({
    restrict: 'E',
    link: ($scope, element) => {
      const loading = {
        el: $(element).children('.loading'),
        show: () => loading.el.stop().fadeIn('fast'),
        hide: () => loading.el.stop().fadeOut('fast'),
      };

      $rootScope.$on('$routeChangeStart', loading.show);
      $rootScope.$on('$routeChangeSuccess', loading.hide);
    },
    templateUrl: 'directives/components/loading.html',
  }),
]);
