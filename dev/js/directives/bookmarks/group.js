/* global app */

app.directive('bookmarkGroup', [
  '$timeout',
  'route',
  ($timeout, route) => ({
    restrict: 'EA',
    replace: true,
    link: $scope => {
      const limit = {
        val: route.get().page ? 24 : 12,
        increment: 12,
        more: () => (limit.val += limit.increment),
      };
      const dndHelper = {
        size: null,
        dragstart: el => {
          while (!el.classList.contains('dndDragging')) {
            el = el.parentNode;
          }
          dndHelper.size = el.getBoundingClientRect();
          dndHelper.matchHeight();
        },
        dragend: () => (dndHelper.size = null),
        matchHeight: () => {
          let p = document.querySelector('.dndPlaceholder');
          if (p) {
            p.style.height = dndHelper.size.height + 'px';
            p.style.width = dndHelper.size.width + 'px';
          } else {
            $timeout(dndHelper.matchHeight);
          }
        },
      };

      $scope.dndHelper = dndHelper;
      $scope.limit = limit;
    },
    templateUrl: 'directives/bookmark/components/group.html',
  }),
]);
