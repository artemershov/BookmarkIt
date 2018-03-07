/* exported Notify */

class Notify {

  constructor(options) {
    let _options = {
      color: 'bg-primary',
      icon:  'fa-check',
      text:  'This is notification',
      time:  2000,
      click: null,
    };

    for (let k in options) {
      _options[k] = options[k];
    }

    this.options = _options;
    this.elements = {
      block: document.createElement('div'),
      icon:  document.createElement('i'),
      text:  document.createElement('span')
    };

    this.elements.block.setAttribute('class', 'notification alert center-block col-xs-10 col-sm-8 col-md-4 col-lg-3 text-center');
    this.elements.icon.setAttribute('class', 'fa fa-fw');

    this.timer = null;
  }

  show() {
    let o = this.options;
    let e = this.elements;

    o.color.split(' ').forEach((c) => e.block.classList.add(c));
    o.icon.split(' ').forEach((c) => e.icon.classList.add(c));

    e.text.innerHTML = o.text;
    e.block.addEventListener('click', () => {
      if (o.click) o.click();
      this.hide();
    });

    e.block.appendChild(e.icon);
    e.block.appendChild(e.text);
    document.body.appendChild(e.block);

    if (o.time !== 0) this.timer = setTimeout(() => this.hide(), o.time);

    return this;
  }

  hide() {
    let block = this.elements.block;
    if (document.body.contains(block)) document.body.removeChild(block);
    return this;
  }

  update(options) {
    let o = options;
    let c = this.options;
    let e = this.elements;

    if (o.text) e.text.innerHTML = o.text;

    if (o.color) {
      c.color.split(' ').forEach((c) => e.block.classList.remove(c));
      o.color.split(' ').forEach((c) => e.block.classList.add(c));
    }

    if (o.icon) {
      c.icon.split(' ').forEach((c) => e.icon.classList.remove(c));
      o.icon.split(' ').forEach((c) => e.icon.classList.add(c));
    }

    if (o.time) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.hide(), o.time);
    }

    for (let k in o) c[k] = o[k];

    return this;
  }

}
