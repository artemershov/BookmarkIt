/* global app, popupReset */

app.directive('navigation', [
  'AppName',
  AppName => ({
    restrict: 'EA',
    replace: true,
    link: ($scope, element) => {
      // Panels
      const header = {
        state: {
          groups: false,
          settings: false,
          addform: false,
        },
        toggle: panel => {
          for (let p in header.state) {
            header.state[p] = p == panel ? !header.state[p] : false;
          }
        },
      };

      // Events
      element[0].querySelector('.search').addEventListener('keydown', e => {
        if ((e.key && e.key.indexOf('Esc') != -1) || e.keyCode == 27) {
          $scope.$apply(() => ($scope.search = ''));
        } else {
          if (document.documentElement.clientWidth > 767) header.toggle();
          popupReset();
        }
      });
      document.querySelector('main').addEventListener('click', () => {
        $scope.$apply(() => header.toggle());
      });

      // Assign
      $scope.header = header;
      $scope.appname = AppName;
    },
    templateUrl: 'directives/header/main.html',
  }),
]);
