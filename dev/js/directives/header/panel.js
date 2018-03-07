angular.module('app').directive('headerPanel', () => ({
  restrict: 'EA',
  replace: true,
  templateUrl: (element, attrs) => 'directives/header/panel-' + attrs.type + '.html',
}));
