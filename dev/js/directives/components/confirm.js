/* global app */

app.directive('confirm', () => ({
  restrict: 'E',
  link: ($scope, element) => {
    const confirmObj = {
      el: element.children('.modal'),
      param: {},
      open: p => {
        confirmObj.param = p;
        confirmObj.el.modal('show').one('hidden.bs.modal', () => confirmObj.param = {});
      },
      action: c => {
        confirmObj.el.modal('hide');
        let cp = confirmObj.param;
        if ( c && cp.agree)  cp.agree();
        if (!c && cp.cancel) cp.cancel();
      }
    };
    $scope.confirm = confirmObj;
  },
  templateUrl: 'directives/components/confirm.html'
}));
