# BokmarkIt
Service for store and organize your bookmarks.

![BokmarkIt](https://i.imgur.com/T8H857H.png)

## Buid
1. Open console
2. `cd` to project folder
3. Install dependencies: `yarn install`
2. Run `gulp`

## Path

**dev/index.pug** (base path for angular framework)
```
base(href='/dist/')
```

**dist/.htaccess** (base path for apache server)
```
<IfModule mod_rewrite.c>
  ...
  RewriteBase /dist
  ...
</IfModule>
```

**gulpfile.js** (base path for BrowserSync)
```
const bsConfig = {
  proxy: 'http://localhost/dist',
  ...
};
```
