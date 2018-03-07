/* global Notify */

angular.module('app').directive('groups', ['ajaxAPI', '$filter', 'route', 'messages', (ajaxAPI, $filter, route, messages) => ({
  restrict: 'EA',
  replace: true,
  link: ($scope) => {

    const notify = new Notify();
    const addForm = {
      title: '',
      loading: false,
      action: () => {
        addForm.loading = true;
        ajaxAPI.groups.add({title: addForm.title}).then(r => {
          addForm.loading = false;
          if (r.id) {
            $scope.groups.push({
              id: r.id,
              pos: r.pos,
              title: addForm.title,
            });
            notify.update({text: messages.groups.success.add, icon: 'fa-plus-circle'}).show();
            addForm.title = '';
          } else {
            notify.update({text: messages.groups.error, icon: 'fa-warning'}).show();
          }
        });
      },
    };
    const editForm = {
      loading: false,
      open: g => {
        g.copy = g.title;
        g.edit = true;
      },
      close: g => {
        g.edit = false;
        delete g.copy;
      },
      action: g => {
        editForm.loading = true;
        ajaxAPI.groups.edit(g.id, {title: g.copy}).then(r => {
          editForm.loading = false;
          if (r == 1) {
            g.title = g.copy;
            editForm.close(g);
            notify.update({text: messages.groups.success.edit, icon: 'fa-check'}).show();
          } else {
            notify.update({text: messages.groups.error, icon: 'fa-warning'}).show();
          }
        });
      },
    };
    const actions = {
      reorder: (item, f, t) => {
        if (f == t) return false;

        let min = Math.min(f, t);
        let max = Math.max(f, t);

        let d1 = (f < t) ? -1 : 1;
        let d2 = (f < t) ? -1 : 0;

        let mod = [];
        let tmp = [];

        mod.push({
          id: item.id,
          pos: $scope.groups[t + d2].pos,
        });

        for (let i = min; i < max; i++) {
          if (i == f) continue;
          let c = $scope.groups[i];
          tmp.push(c);
          mod.push({
            id: c.id,
            pos: c.pos + d1,
          });
        }

        ajaxAPI.groups.reorder(mod).then(r => {
          if (r) {

            // Update pos
            item.pos = $scope.groups[t + d2].pos;
            tmp.forEach(i => i.pos += d1);

            // Rearange groups array
            $scope.groups.splice(f, 1);
            $scope.groups.splice(t + d2, 0, item);

            notify.update({text: messages.groups.success.reorder, icon: 'fa-check'}).show();
          } else {
            notify.update({text: messages.groups.error, icon: 'fa-warning'}).show();
          }
        });


      },
      delete: id => $scope.confirm.open({
        title: messages.groups.confirm.delete,
        icon: 'fa-trash-o',
        btn: {
          agree: messages.groups.confirm.yes,
          cancel: messages.groups.confirm.no,
        },
        agree: () => ajaxAPI.groups.delete(id).then(r => {
          if (r == 1) {
            // Remove group
            let g = $filter('getById')($scope.groups, id);
            let gi = $filter('indexOfObject')($scope.groups, g);
            if (gi !== -1) $scope.groups.splice(gi, 1);
            // Remove bookmarks
            let ba = $filter('filter')($scope.bookmarks, {gid: id});
            let i = ba.length;
            while (i--) {
              let bi = $filter('indexOfObject')($scope.bookmarks, ba[i]);
              if (bi !== -1) $scope.bookmarks.splice(bi, 1);
            }
            if (route.get().gid == id) route.set('/');
            notify.update({text: messages.groups.success.delete, icon: 'fa-trash-o'}).show();
          } else {
            notify.update({text: messages.groups.error, icon: 'fa-warning'}).show();
          }
        }),
      }),
    };

    $scope.groupform = {
      add:     addForm,
      edit:    editForm,
      actions: actions,
    };

  },
  templateUrl: 'directives/popup/groups.html',
})]);
