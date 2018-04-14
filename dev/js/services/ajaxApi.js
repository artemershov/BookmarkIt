/* global Notify */

angular.module('app').factory('ajaxAPI', ['$http', '$q', '$filter', 'route', 'messages', ($http, $q, $filter, route, messages) => {

  let storage = null;
  const ajax = (a, d = {}) => {
    return $http.post('server/' + a, d).then(r => r.data, () => {
      new Notify({
        text: messages.error,
        icon: 'fa-warning',
        color: 'alert-danger',
        time: 0,
      }).show();
    });
  };
  const factory = {

    bookmarks: {
      get:        ()         => ajax('bookmarks/get'),
      add:        data       => ajax('bookmarks/add',     data),
      edit:       (id, data) => ajax('bookmarks/edit',    {id: id, data: data}),
      reorder:    data       => ajax('bookmarks/reorder', data),
      delete:     id         => ajax('bookmarks/delete',  id),
      batch:      data       => ajax('bookmarks/batch',   data),
    },

    groups: {
      get:        ()         => ajax('groups/get'),
      add:        data       => ajax('groups/add',        data),
      edit:       (id, data) => ajax('groups/edit',       {id: id, data: data}),
      reorder:    data       => ajax('groups/reorder',    data),
      delete:     id         => ajax('groups/delete',     id),
    },

    meta: {
      data:       link       => ajax('parse/meta',        {link}),
      images:     link       => ajax('parse/image',       {link}),
    },

    user: {
      login:      data       => ajax('user/signin',       data),
      register:   data       => ajax('user/signup',       data),
      passChange: data       => ajax('user/setpass',      data),
      delete:     pass       => ajax('user/delete',       pass),
      logoutAll:  ()         => ajax('user/revoke'),
      logout:     ()         => ajax('user/signout').then(r => {
        if (r) route.set('/auth');
      }),
    },

    init: () => {
      if (storage) return storage;
      return $q.all({
        groups:    factory.groups.get(),
        bookmarks: factory.bookmarks.get(),
      }).then(data => {
        if (data.groups && data.bookmarks) {
          storage = {};
          storage.groups    = $filter('orderBy')(data.groups, 'pos');
          storage.bookmarks = data.bookmarks;
        } else {
          storage = null;
        }
        return storage;
      });
    },

  };

  return factory;

}]);
