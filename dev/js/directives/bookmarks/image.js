angular.module('app').directive('bookmarkImage', ['$filter', ($filter) => ({
  restrict: 'EA',
  replace: true,
  scope: {
    width: '@',
    height: '@',
    image: '=',
    link: '=',
  },
  link: ($scope, element) => {

    const canvas = {
      el: element[0].querySelector('canvas'),
      font: {},
      color: {},
      image: null,
      text: null,
    };

    const draw = (type) => {
      let c = canvas.el.getContext('2d');
      let w = $scope.width;
      let h = $scope.height;
      let f = canvas.font;

      // Clear

      if (type == 'picture') {

        // Placeholder
        param();

        // Image
        let i = new Image();
        i.src = canvas.image;
        i.onload = () => {
          let iw = i.width;
          let ih = i.height;
          let ia = iw / ih;
          let cw = c.canvas.width;
          let ch = c.canvas.height;
          let ca = cw / ch;
          let nw = (ca < ia) ? Math.round(ch * ia) : cw;
          let nh = (ca > ia) ? Math.round(cw / ia) : ch;
          let x = Math.round((cw - nw) / 2);
          let y = Math.round((ch - nh) / 2);
          c.fillStyle = canvas.color.bg;
          c.fillRect(0, 0, w, h);
          c.drawImage(i, 0, 0, iw, ih, x, y, nw, nh);
        };

      } else {

        // Background
        c.fillStyle = canvas.color.bg;
        c.fillRect(0, 0, w, h);

        // Text size
        c.font = f.style + ' ' + f.size + 'px ' + f.name;
        let tw = c.measureText(canvas.text).width;
        if (tw > w - 100) {
          let nfs = f.size / (tw / (w - 100));
          c.font = f.style + ' ' + nfs + 'px ' + f.name;
        }

        // Text style
        c.fillStyle = canvas.color.fg;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(canvas.text, w / 2, h / 2);

      }
    };

    // TODO: replace document.font
    const param = i => {
      if (!i) {
        canvas.font = {
          name: 'PT Sans',
          size: 250,
          style: 'bold',
        };
        canvas.color = {
          fg: '#D4D8D9',
          bg: '#F9F9F9',
        };
        canvas.text = $filter('urlSiteName')($scope.link);
        document.fonts.load(canvas.font.style + ' ' + canvas.font.size + 'px ' + canvas.font.name).then(draw);
      } else if (i.indexOf('http') == 0) {
        canvas.image = i;
        draw('picture');
      } else if (i instanceof Array || i.indexOf('[') == 0) {
        if (!(i instanceof Array)) i = JSON.parse(i);
        canvas.font = {
          name: 'FontAwesome',
          size: 250,
          style: ''
        };
        canvas.color = {
          fg: i[1],
          bg: i[2],
        };
        canvas.text = i[0];
        document.fonts.load(canvas.font.size + 'px ' + canvas.font.name).then(draw);
      }
    };

    $scope.$watchCollection('image', () => param($scope.image));

  },
  templateUrl: 'directives/bookmark/components/image.html',
})]);
