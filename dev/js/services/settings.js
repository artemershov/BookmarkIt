angular.module('app').constant('defaultSettings', {
  global: {
    newtab: true,
    search: false,
  },
  main: {
    layout:  (document.documentElement.clientWidth > 767) ? 'card' : 'table',
    size:    'm',
    group:   true,
    sort:    'pos',
    reverse: true,
  },
  fav: {
    layout:  'tile',
    size:    'm',
    group:   false,
    sort:    'pos',
    reverse: true,
  },
  group: {},
});

angular.module('app').factory('settings', ['defaultSettings', (defaultSettings) => {

  let ls = new Storage('settings');
  let storage = ls.get() || defaultSettings;

  const factory = {
    get: (page = null, gid = null) => {
      switch (page) {
        case 'all':    return storage;
        case 'global': return storage.global;
        case 'fav':    return storage.fav;
        case 'group':
          if (!storage.group[gid]) {
            storage.group[gid] = {};
            Object.assign(storage.group[gid], storage.main);
            factory.set();
          }
          return storage.group[gid];
        default: return storage.main;
      }
    },
    set: () => ls.set(storage),
  };

  return factory;

}]);
