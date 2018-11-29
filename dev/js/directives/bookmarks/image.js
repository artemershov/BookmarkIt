/* global app */

app.directive('bookmarkImage', [
  '$filter',
  'blobStorage',
  ($filter, blobStorage) => ({
    restrict: 'EA',
    replace: true,
    scope: {
      width: '@',
      height: '@',
      image: '=',
      link: '=',
    },
    link: ($scope, element) => {
      const siteUrl = $scope.link && $filter('urlSiteName')($scope.link);

      const drawImg = (el, width, height, img) => {
        const c = el.getContext('2d');

        const iw = img.width;
        const ih = img.height;
        const ia = iw / ih;

        const cw = c.canvas.width;
        const ch = c.canvas.height;
        const ca = cw / ch;

        const nw = ca < ia ? Math.round(ch * ia) : cw;
        const nh = ca > ia ? Math.round(cw / ia) : ch;

        const x = Math.round((cw - nw) / 2);
        const y = Math.round((ch - nh) / 2);

        c.fillStyle = '#FFF';
        c.fillRect(0, 0, width, height);
        c.drawImage(img, 0, 0, iw, ih, x, y, nw, nh);

        return el;
      };

      const drawPicture = (el, width, height, url) => {
        // Draw placeholder
        handleParam();
        // Draw image
        let i = new Image();
        i.src = url;
        return new Promise((res, rej) => {
          i.onload = () => res(i);
          i.onerror = () => rej(i);
        })
          .then(img => {
            return drawImg(el, width, height, img);
          })
          .catch(() => (i = undefined));
      };

      const drawText = (el, width, height, text, font, color) => {
        const c = el.getContext('2d');
        return document.fonts
          .load(font.style + ' ' + font.size + 'px ' + font.name)
          .then(() => {
            // Background
            c.fillStyle = color.bg;
            c.fillRect(0, 0, width, height);

            // Text size
            c.font = font.style + ' ' + font.size + 'px ' + font.name;
            let tw = c.measureText(text).width;
            if (tw > width - 100) {
              let nfs = font.size / (tw / (width - 100));
              c.font = font.style + ' ' + nfs + 'px ' + font.name;
            }

            // Text style
            c.fillStyle = color.fg;
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText(text, width / 2, height / 2);

            return el;
          });
      };

      const drawUrl = (el, width, height, text) => {
        const font = {
          name: 'PT Sans',
          size: 250,
          style: 'bold',
        };
        const color = {
          fg: '#D4D8D9',
          bg: '#F9F9F9',
        };
        return drawText(el, width, height, text, font, color);
      };

      const drawIcon = (el, width, height, icon, fg, bg) => {
        const font = {
          name: 'FontAwesome',
          size: 250,
          style: '',
        };
        const color = { fg, bg };
        return drawText(el, width, height, icon, font, color);
      };

      const drawBlob = (el, width, height, blob) => {
        const c = el.getContext('2d');
        const i = new Image();
        i.onload = () => c.drawImage(i, 0, 0);
        i.src = blob;
      };

      const draw = type => {
        const el = element[0].querySelector('canvas');
        const w = $scope.width;
        const h = $scope.height;

        switch (type) {
          case 'picture':
            return url => drawPicture(el, w, h, url);
          case 'icon':
            return param => drawIcon(el, w, h, ...param);
          case 'text':
            return text => drawUrl(el, w, h, text);
          case 'blob':
            return blob => drawBlob(el, w, h, blob);
        }
      };

      const checkType = data => {
        if (!data) {
          return 'text';
        } else if (data.indexOf('http') == 0) {
          return 'picture';
        } else if (data instanceof Array || data.indexOf('[') == 0) {
          return 'icon';
        }
      };

      const handleParam = i => {
        const w = $scope.width;
        const type = checkType(i);

        if (!i) i = siteUrl;
        if (type == 'icon' && !(i instanceof Array)) i = JSON.parse(i);

        if (blobStorage.get(i, w)) {
          draw('blob')(blobStorage.get(i, w));
        } else {
          draw(type)(i).then(el => {
            try {
              blobStorage.set(i, w, el.toDataURL('image/jpeg', 0.5));
            } catch (e) {
              // Can't read crossOrigin images
            }
          });
        }
      };

      $scope.$watchCollection('image', () => handleParam($scope.image));
    },
    templateUrl: 'directives/bookmark/components/image.html',
  }),
]);
