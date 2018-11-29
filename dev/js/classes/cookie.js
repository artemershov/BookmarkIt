/* exported Cookie */

class Cookie {
  constructor(name) {
    this.name = name;
  }

  get() {
    let matches = document.cookie.match(
      new RegExp(
        '(?:^|; )' +
          this.name.replace(/([.$?*|{}()[]\\\/\+^])/g, '\\$1') +
          '=([^;]*)'
      )
    );
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

  set(v, o = {}) {
    if (o.expires) {
      let d = new Date();
      d.setTime(d.getTime() + o.expires * 1000);
      o.expires = d.toUTCString();
    }

    let cookie = this.name + '=' + encodeURIComponent(v);

    for (let k in o) {
      cookie += '; ' + k;
      if (o[k] !== true) cookie += '=' + o[k];
    }

    document.cookie = cookie;
  }

  delete() {
    this.set('', {
      expires: -1,
    });
  }

  get value() {
    return this.get();
  }

  set value(v) {
    this.set(v);
  }
}
