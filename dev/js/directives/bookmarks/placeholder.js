angular.module('app').directive('bookmarkPlaceholder', ['route', (route) => ({
  restrict: 'EA',
  replace: true,
  link: ($scope) => {

    $scope.placeholder = () => {
      if ($scope.groups && !$scope.groups.length) return 1;
      if ($scope.bookmarks && !$scope.bookmarks.length) return 2;
      if ($scope.bookmarks && !$scope.filteredBookmarks().length) {
        if ($scope.search) return 4;
        if (route.get().page == 'fav') return 3;
        return 2;
      }
      return 0;
    };

  },
  templateUrl: 'directives/bookmark/components/placeholder.html',
})]);
