$(document).on('mouseenter', '[data-toggle="tooltip"]', function() {
  let el = $(this);
  el.tooltip({
    container: 'body',
    trigger: 'manual',
  });

  let t = setTimeout(() => el.tooltip('show'), 500);
  if (el)
    el.one('mouseleave', () => {
      clearTimeout(t);
      el.tooltip('destroy');
    });
});

$(document).on('mouseenter', '[data-toggle="popover"]', function() {
  let el = $(this);
  el.popover({
    container: 'body',
    trigger: 'manual',
  });
  let t = setTimeout(() => el.popover('show'), 1000);
  if (el)
    el.one('mouseleave', () => {
      clearTimeout(t);
      el.popover('destroy');
    });
});

/* exported popupReset */

const popupReset = () => {
  let t = document.querySelectorAll('.tooltip, .popover');
  let i = t.length;
  while (i--) {
    let el = t[i];
    if (el) el.parentNode.removeChild(el);
  }
};
