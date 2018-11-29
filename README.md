# BookmarkIt
A service for storing and organizing your bookmarks.

![BokmarkIt](https://i.imgur.com/T8H857H.png)

## Buid
```shell
$ yarn install
$ yarn start
```

## Path variables

**server/index.php** (path of server folder)
```php
defined("PATH") or define("PATH", "/server");
```

**gulpfile.js**
```js
const path = {
  ...
  server: {
    base: '/',
    url: 'http://localhost',
  },
  ...
};
```
