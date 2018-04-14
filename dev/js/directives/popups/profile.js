angular.module('app').directive('profile', ['ajaxAPI', (ajaxAPI) => ({
  restrict: 'EA',
  replace: true,
  link: ($scope, element) => {

    const passForm = {
      data: {
        old: null,
        new: null,
        re:  null,
      },
      alert: 0,
      loading: false,
      submit: () => {
        passForm.alert = 0;
        passForm.loading = true;
        if (passForm.data.new !== passForm.data.re) {
          passForm.loading = false;
          passForm.alert = 3;
        }
        if (passForm.alert == 0) ajaxAPI.user.passChange(passForm.data).then(r => {
          passForm.loading = false;
          passForm.alert = r;
          if (r == 1) {
            passForm.data = {
              old: null,
              new: null,
              re:  null,
            };
          }
        });
      },
    };
    const deleteForm = {
      pass: null,
      alert: 0,
      loading: false,
      submit: () => {
        deleteForm.alert = 0;
        deleteForm.loading = true;
        ajaxAPI.user.delete(deleteForm.pass).then(r => {
          deleteForm.loading = false;
          deleteForm.alert = r;
        });
      },
    };
    const sessionForm = {
      loading: false,
      alert: 0,
      action: () => {
        sessionForm.loading = true;
        ajaxAPI.user.logoutAll().then(() => {
          sessionForm.loading = false;
          sessionForm.alert = 1;
        });
      },
    };

    element.on('hidden.bs.modal', () => $scope.$apply(() => {
      sessionForm.alert = 0;
      passForm.alert = 0;
      passForm.data = {
        old: null,
        new: null,
        re:  null,
      };
      deleteForm.alert = 0;
      deleteForm.pass = null;
    }));

    $scope.user = {
      pass:    passForm,
      delete:  deleteForm,
      session: sessionForm,
    };

  },
  templateUrl: 'directives/popup/profile.html',
})]);
