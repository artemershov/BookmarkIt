/* global app */

app.controller('MainController', [
  '$scope',
  'route',
  '$filter',
  'settings',
  'data',
  ($scope, route, $filter, settings, data) => {
    // Routing
    const loc = route.get();
    if (loc.gid && !$filter('getById')(data.groups, loc.gid)) {
      route.set('/');
      return false;
    }
    $scope.location = loc;

    // Data
    $scope.groups = data.groups;
    $scope.bookmarks = data.bookmarks;

    // Settings
    $scope.settings = {
      current: settings.get(loc.page, loc.gid),
      global: settings.get('global'),
    };
    $scope.settingsSet = (param, val, glob) => {
      let s = $scope.settings;
      (glob ? s.global : s.current)[param] = val;
      settings.set();
    };

    // Filters
    $scope.filteredBookmarks = g => {
      let f = $scope.bookmarks;
      let s = $scope.settings.current;
      let q = $scope.search;

      // Global search option
      if (!(q && $scope.settings.global.search)) {
        if (loc.page == 'fav') f = $filter('filter')(f, { star: 1 });

        // Group page
        if (loc.gid) f = $filter('filter')(f, { gid: loc.gid });
      }

      // Fitler by group
      if (g) f = $filter('filter')(f, { gid: g });

      // Order
      f = $filter('orderBy')(
        f,
        s.sort,
        s.sort == 'title' ? !s.reverse : s.reverse
      );

      // Search
      f = $filter('bookmarksSearch')(f, q);

      return f;
    };
  },
]);
