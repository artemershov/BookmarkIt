angular.module('app').directive('collapse', () => ({
  restrict: 'A',
  link: ($scope, element, attrs) => {
    $scope.$watchCollection(attrs.collapse, (state) => {
      element.collapse((state) ? 'show' : 'hide');
    });
  },
}));
