angular.module('app').controller('AuthController', ['$scope', 'route', 'cookie', 'ajaxAPI', ($scope, route, cookie, ajaxAPI) => {

  // If logined redirect
  if (cookie.get()) {
    route.set('/');
    return false;
  }

  const form = {
    login: {
      state: true,
      data: {
        login: '',
        pass: '',
      },
      error: null,
      action: () => {
        form.login.error = null;
        ajaxAPI.user.login(form.login.data).then(r => {
          form.login.error = r;
          if (r == 1) route.set('/');
        });
      }
    },
    register: {
      state: false,
      data: {
        login: '',
        pass: '',
      },
      error: null,
      action: () => {
        form.register.error = null;
        ajaxAPI.user.register(form.register.data).then(r => {
          form.register.error = r;
          if (r == 1) route.set('/');
        });
      }
    },
    toggle: f => {
      switch (f) {
        case 'login':
          form.login.state = true;
          form.register.state = false;
          break;
        case 'register':
          form.login.state = false;
          form.register.state = true;
          break;
        default:
          form.login.state    = !form.login.state;
          form.register.state = !form.register.state;
          break;
      }
    },
  };

  $scope.form = form;

}]);
