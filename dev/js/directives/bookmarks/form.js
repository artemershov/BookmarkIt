/* global Notify, popupReset, fontAwesome */

angular.module('app').directive('bookmarkForm', ['ajaxAPI', 'route', '$filter', 'messages', (ajaxAPI, route, $filter, messages) => ({
  restrict: 'EA',
  replace: true,
  link: ($scope, element, attrs) => {

    const notify = new Notify();

    if (!$scope.bookmarkForm) $scope.bookmarkForm = {};

    switch (attrs.type) {
      case 'add': {
        const add = {
          data: {
            link: '',
            gid: route.get().gid || null,
          },
          loading: false,
          submit: () => {
            if (add.data.link && add.data.gid) {
              add.loading = true;
              ajaxAPI.bookmarks.add(add.data).then(data => {
                if (!(data == 0 || data == undefined)) {
                  $scope.bookmarks.push(data);
                  add.data.link = '';
                  notify.update({text: messages.bookmarks.success.add, icon: 'fa-plus-circle'}).show();
                } else {
                  notify.update({text: messages.bookmarks.error, icon: 'fa-warning'}).show();
                }
                add.loading = false;
              });
            } else {
              let m = '';
              if (!add.data.link && !add.data.gid) m = messages.bookmarks.validator.both;
              if (!add.data.link) m = messages.bookmarks.validator.link;
              if (!add.data.gid) m = messages.bookmarks.validator.group;
              notify.update({text: m, icon: 'fa-warning'}).show();
            }
          },
        };
        $scope.bookmarkForm.add = add;
        break;
      }
      case 'edit': {
        const edit = {
          item: null,
          copy: null,
          popup: angular.element('#bookmark-edit-modal'),
          panel: {
            state: {
              main: true,
              url: false,
              image: false,
              create: false,
              icons: false,
            },
            toggle: panel => {
              popupReset();
              for (let p in edit.panel.state) {
                edit.panel.state[p] = (p == panel) ? true : false;
              }
            }
          },
          open: b => {
            edit.item = b;
            edit.copy = angular.copy(b);
            edit.popup.modal('show');
          },
          close: () => {
            edit.item = null;
            edit.copy = null;
            edit.parse.data = null;
            edit.image.data = null;
            edit.create.data = null;
            edit.create.search = '';
            edit.panel.toggle('main');
            edit.popup.modal('hide');
          },
          main: {
            loading: false,
            submit: () => {
              edit.main.loading = true;
              ajaxAPI.bookmarks.edit(edit.item.id, edit.copy).then(r => {
                edit.main.loading = false;
                if (r == 1) {
                  angular.copy(edit.copy, edit.item);
                  notify.update({text: messages.bookmarks.success.edit, icon: 'fa-check'}).show();
                  edit.close();
                } else {
                  notify.update({text: messages.bookmarks.error, icon: 'fa-warning'}).show();
                }
              });
            }
          },
          parse: {
            data: null,
            loading: false,
            action: () => {
              edit.parse.loading = true;
              if (edit.parse.data) {
                edit.parse.loading = false;
                let d = edit.parse.data;
                for (let k in d) {
                  if (k == 'image') continue;
                  edit.copy[k] = d[k];
                }
              } else {
                ajaxAPI.meta.data(edit.copy.link).then(r => {
                  edit.parse.loading = false;
                  if (typeof r == 'object') {
                    edit.parse.data = r;
                    for (let k in r) {
                      if (k == 'image') continue;
                      edit.copy[k] = r[k];
                    }
                  } else {
                    notify.update({text: messages.bookmarks.error, icon: 'fa-warning'}).show();
                  }
                });
              }
            }
          },
          image: {
            data: null,
            loading: false,
            open: () => {
              edit.image.loading = true;
              if (edit.image.data) {
                edit.image.loading = false;
                edit.panel.toggle('image');
              } else {
                ajaxAPI.meta.images(edit.copy.link).then(r => {
                  edit.image.loading = false;
                  if (typeof r == 'object') {
                    edit.image.data = r;
                    edit.panel.toggle('image');
                  } else {
                    notify.update({text: messages.bookmarks.error, icon: 'fa-warning'}).show();
                  }
                });
              }
            },
            select: (i) => {
              edit.copy.image = i;
              edit.panel.toggle('main');
            }
          },
          create: {
            data: null,
            default: ['', '#FFFFFF', '#3366CC'],
            icons: fontAwesome,
            search: '',
            open: () => {
              try {
                edit.create.data = JSON.parse(edit.copy.image);
                if (!edit.create.data) throw false;
              } catch (e) {
                edit.create.data = edit.create.default;
              }
              edit.panel.toggle('create');
            },
            save: () => {
              edit.copy.image = JSON.stringify(edit.create.data);
              edit.panel.toggle('main');
            }
          },
        };
        edit.popup.on('hidden.bs.modal', edit.close);
        $scope.bookmarkForm.edit = edit;
        break;
      }
      case 'batch': {
        const batch = {
          data: {
            selected: () => $filter('filter')($scope.filteredBookmarks(), {batch: true}),
            agree: false,
            action: null,
            gid: null,
          },
          loading: false,
          reset: () => {
            batch.data.agree = false;
            batch.data.action = null;
            batch.data.gid = null;
          },
          submit: () => {
            if (batch.data.action == 'delete' && !batch.data.agree) {
              notify.update({text: messages.bookmarks.validator.delete, icon: 'fa-warning'}).show();
            } else {
              batch.loading = true;
              let d = {
                id: [],
                action: batch.data.action,
                gid: batch.data.gid,
              };
              let s = batch.data.selected();
              let i = s.length;
              while (i--) d.id.push(s[i].id);
              ajaxAPI.bookmarks.batch(d).then(r => {
                if (r) {
                  switch (batch.data.action) {
                    case 'move': {
                      let i = s.length;
                      while (i--) {
                        s[i].gid = batch.data.gid;
                        s[i].batch = false;
                      }
                      notify.update({text: messages.bookmarks.batch.move, icon: 'fa-folder'}).show();
                      break;
                    }
                    case 'delete': {
                      let k = s.length;
                      while (k--) {
                        let bi = $filter('indexOfObject')($scope.bookmarks, s[k]);
                        if (bi !== -1) $scope.bookmarks.splice(bi, 1);
                      }
                      notify.update({text: messages.bookmarks.batch.delete, icon: 'fa-trash-o'}).show();
                      break;
                    }
                  }
                  batch.loading = false;
                  batch.reset();
                } else {
                  notify.update({text: messages.bookmarks.error, icon: 'fa-warning'}).show();
                }
              });
            }
          },
          cancel: () => {
            let s = batch.data.selected();
            let i = s.length;
            while (i--) s[i].batch = false;
            batch.reset();
          },
        };
        $scope.bookmarkForm.batch = batch;
        break;
      }
    }


  },
  templateUrl: (element, attrs) => 'directives/bookmark/form/' + attrs.type + '.html',
})]);
