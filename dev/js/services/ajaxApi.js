/* global Notify */

angular.module('app').factory('ajaxAPI', ['$http', '$q', '$filter', 'route', 'cookie', 'messages', ($http, $q, $filter, route, cookie, messages) => {

  let storage = null;
  const logout  = () => {
    storage = null;
    route.set('/auth');
  };
  const ajax = (a, d = {}) => {
    d.action = a;
    d.token  = cookie.get();
    return $http.post('server/', d).then(r => r.data, r => {
      if ([403, 404].includes(r.status)) {
        logout();
      } else {
        new Notify({
          text: messages.error,
          icon: 'fa-warning',
          color: 'alert-danger',
          time: 0,
        }).show();
      }
      return false;
    });
  };
  const factory = {

    bookmarks: {
      get:        ()         => ajax('bookmarksGet'),
      add:        data       => ajax('bookmarksAdd',     {data: data}),
      edit:       (id, data) => ajax('bookmarksEdit',    {id: id, data: data}),
      reorder:    data       => ajax('bookmarksReorder', {data: data}),
      delete:     id         => ajax('bookmarksDelete',  {id: id}),
      batch:      data       => ajax('bookmarksBatch',   {data: data}),
    },

    groups: {
      get:        ()         => ajax('groupsGet'),
      add:        data       => ajax('groupsAdd',        {data: data}),
      edit:       (id, data) => ajax('groupsEdit',       {id: id, data: data}),
      reorder:    data       => ajax('groupsReorder',    {data: data}),
      delete:     id         => ajax('groupsDelete',     {id: id}),
    },

    meta: {
      data:       link       => ajax('parseMetadata',    {link: link}),
      images:     link       => ajax('parseImages',      {link: link}),
    },

    user: {
      login:      data       => ajax('userLogin',        {data: data}),
      register:   data       => ajax('userRegister',     {data: data}),
      passChange: data       => ajax('userPassChange',   {data: data}),
      delete:     pass       => ajax('userDelete',       {pass: pass}).then(r => (r == 1) ? logout() : r),
      logout:     ()         => ajax('userLogout').then(logout),
      logoutAll:  ()         => ajax('userLogoutAll'),
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
