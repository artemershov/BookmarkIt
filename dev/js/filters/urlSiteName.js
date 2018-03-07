angular.module('app').filter('urlSiteName', () => (input) => input.split('/')[2].replace('www.', ''));
