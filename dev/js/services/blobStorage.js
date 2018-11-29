/* global app */

app.factory('blobStorage', () => {
  let ls = new Storage('blobStorage');
  let storage = ls.get() || {};

  const factory = {
    get: (id, width) => (storage[id] && storage[id][width]) || null,
    set: (id, width, blob) => {
      if (!storage[id]) storage[id] = {};
      storage[id][width] = blob;
      ls.set(storage);
    },
  };

  return factory;
});
