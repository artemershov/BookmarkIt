/* global app, Notify, popupReset */

app.directive('bookmark', ['ajaxAPI', '$filter', 'messages', (ajaxAPI, $filter, messages) => ({
  restrict: 'EA',
  link: ($scope, element, attrs) => {

    attrs.$observe('size', s => $scope.size = s);

    const notify = new Notify();
    const actions = {
      edit: b => $scope.bookmarkForm.edit.open(b),
      star: b => {
        ajaxAPI.bookmarks.edit(b.id, {star: +!b.star}).then(r => {
          if (r == 1) {
            b.star = +!b.star;
            if (b.star) {
              notify.update({text: messages.bookmarks.success.fav, icon: 'fa-star'}).show();
            } else {
              notify.update({text: messages.bookmarks.success.unfav, icon: 'fa-star-o'}).show();
            }
            popupReset();
          } else {
            notify.update({text: messages.bookmarks.error, icon: 'fa-warning'}).show();
          }
        });
      },

      reorder: (a, f, t) => {

        // Fix
        let m = ($scope.settings.current.reverse) ? -1 : 1;
        if (f < t) t -= 1;

        // If changes
        if (f !== t) {

          let gap = $filter('bookmarksReorderFilter')($scope.bookmarks, a[f].pos, a[t].pos);
          let modify = [];

          // Reorder 'from' and 'to' elements
          a[f].pos  = (a[t]) ? a[t].pos : 0;
          a[t].pos += ((f < t) ? -1 : 1) * m;
          modify.push({
            id:  a[f].id,
            pos: a[f].pos,
          }, {
            id:  a[t].id,
            pos: a[t].pos,
          });

          // Reorder 'gap' elements
          if (gap.length) {
            let i = gap.length;
            while (i--) {
              let c = gap[i];
              c.pos += ((f < t) ? -1 : 1) * m;
              modify.push({
                id:  c.id,
                pos: c.pos,
              });
            }
          }

          // Write changes
          ajaxAPI.bookmarks.reorder(modify).then((r) => {
            if (r) {
              notify.update({text: messages.bookmarks.success.reorder, icon: 'fa-check'}).show();
            } else {
              notify.update({text: messages.bookmarks.error, icon: 'fa-warning'}).show();
            }
          });

        }
      },
      delete: id => $scope.confirm.open({
        title: messages.bookmarks.confirm.delete,
        icon: 'fa-trash-o',
        btn: {
          agree: messages.bookmarks.confirm.yes,
          cancel: messages.bookmarks.confirm.no,
        },
        agree: () => ajaxAPI.bookmarks.delete(id).then(r => {
          if (r == 1) {
            let b = $filter('getById')($scope.bookmarks, id);
            let i = $filter('indexOfObject')($scope.bookmarks, b);
            if (i !== -1) $scope.bookmarks.splice(i, 1);
            notify.update({text: messages.bookmarks.success.delete, icon: 'fa-trash-o'}).show();
          } else {
            notify.update({text: messages.bookmarks.error, icon: 'fa-warning'}).show();
          }
        }),
      }),
    };

    $scope.bookmarkActions = actions;

  },
  templateUrl: (element, attrs) => 'directives/bookmark/view/' + attrs.type + '.html',
})]);
