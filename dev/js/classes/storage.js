/* exported Storage */

class Storage {
  constructor(name, session = false) {
    this.name = name;
    this.session = session;
  }

  get() {
    try {
      return JSON.parse(
        (this.session ? sessionStorage : localStorage).getItem(this.name)
      );
    } catch (e) {
      return false;
    }
  }

  set(v) {
    (this.session ? sessionStorage : localStorage).setItem(
      this.name,
      JSON.stringify(v)
    );
    return true;
  }

  delete() {
    (this.session ? sessionStorage : localStorage).removeItem(this.name);
  }

  get value() {
    return this.get();
  }

  set value(v) {
    this.set(v);
  }
}
