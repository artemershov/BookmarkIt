<?php

  class Parse {
    public static function get($url) {

      $useragent = $_SERVER['HTTP_USER_AGENT'];
      $lang = $_SERVER['HTTP_ACCEPT_LANGUAGE'];

      $headers = [];

      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_ENCODING, 'gzip');
      curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept-language: ' . $lang]);
      curl_setopt($ch, CURLOPT_USERAGENT, $useragent);
      curl_setopt($ch, CURLOPT_NOBODY, 1);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      curl_setopt($ch, CURLOPT_TIMEOUT, 15);
      curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
      curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($curl, $header) use(&$headers) {
        $len = strlen($header);
        $header = explode(':', $header, 2);
        if (count($header) < 2) return $len;
        $headers[strtolower(trim($header[0]))] = trim($header[1]);
        return $len;
      });

      $content = curl_exec($ch);
      $info = curl_getinfo($ch);

      if (preg_match('/text\/html/', $info['content_type'])) {
        curl_setopt($ch, CURLOPT_URL, $info['url']);
        curl_setopt($ch, CURLOPT_NOBODY, 0);
        $content = curl_exec($ch);
        $info = curl_getinfo($ch);
      }

      $data = [
        'info'      => $info,
        'headers'   => $headers,
        'content'   => $content,
        'errors'    => [
          'code'    => curl_errno($ch),
          'message' => curl_error($ch),
        ],
      ];

      curl_close($ch);
      return $data;

    }
    public static function meta($url) {

      require_once ROOT . '/vendor/simple_html_dom.php';

      $curl = self::get($url);

      $url  = $curl['info']['url'];
      $mime = $curl['info']['content_type'];

      $filename = parse_url($url, PHP_URL_PATH);
      $filename = substr($url, strrpos($url, '/')+1);
      $filesize = $curl['info']['size_download'];
      $filesize = ($filesize) ? self::formatBytes($filesize) : '';

      $data = [
        'link'    => $url,
        'title'   => $filename,
        'text'    => $filesize,
        'image'   => null,
        'favicon' => null,
      ];

      if (preg_match('/image/', $mime)) {
        $imagesize = @getimagesize($url);
        $imagesize = (!empty($imagesize)) ? ' ' . $imagesize[0] . 'x' . $imagesize[1] . 'px': '';
        $data['text']  = $filesize . $imagesize;
        $data['image'] = $url;
        return $data;
      }

      if (preg_match('/video/', $mime)) {
        $image = ['', '#FFFFFF', '#BB0000'];
        $data['image'] = json_encode($image, JSON_UNESCAPED_UNICODE);
        return $data;
      }

      if (preg_match('/audio/', $mime)) {
        $filesize = self::formatBytes($curl['info']['size_download']);
        $image = ['', '#FFFFFF', '#EE7700'];
        $data['image'] = json_encode($image, JSON_UNESCAPED_UNICODE);
        return $data;
      }

      if (preg_match('/application/', $mime)) {
        $image = ['', '#FFFFFF', '#0088EE'];
        $data['image'] = json_encode($image, JSON_UNESCAPED_UNICODE);
        return $data;
      }

      if (preg_match('/text\/html/', $mime)) {

        $html = $curl['content'];

        if (empty($html)) {
          $data['title'] = parse_url($url, PHP_URL_HOST);
          $data['text']  = null;
          return $data;
        }

        // Charset
        if (preg_match('/charset/', $mime)) {
          $charset = substr($mime, strpos($mime, 'charset=') + 8);
          if ($charset !== 'utf-8') $html = mb_convert_encoding($html, 'utf-8', $charset);
        }

        // Simple DOM init
        $html = str_get_html($html);

        // Title
        $title = $html->find('title', 0, true);
        $title = (!empty($title)) ? trim($title->plaintext) :  '';
        if (empty($title)) {
          $title = $html->find('meta[property=og:title], meta[name=twitter:title], meta[itemprop=name]', 0, true);
          $title = (!empty($title)) ? trim($title->content) : parse_url($url, PHP_URL_HOST);
        }
        $title = html_entity_decode($title);
        if (mb_strlen($title) > 100) {
          $title  = mb_substr($title, 0, 99);
          $title .= '…';
        }

        // Description
        $text = $html->find('meta[name=description], meta[property=og:description], meta[name=twitter:description], meta[itemprop=description]', 0, true);
        $text = (!empty($text)) ? trim($text->content) : '';
        if (empty($text)) {
          $text = $html->find('body', 0, true);
          $text = (!empty($text)) ? trim($text->plaintext) : '';
          if (!empty($text)) {
            $text = html_entity_decode($text);
            $text = preg_replace('/\s+/', ' ', $text);
            $text = trim($text);
          }
        } else {
          $text = html_entity_decode($text);
        }
        if (mb_strlen($text) > 200) {
          $text  = mb_substr($text, 0, 199);
          $text .= '…';
        }

        // Icon
        $icon = $html->find('link[rel=apple-touch-icon], link[rel=icon], link[rel="shortcut icon"]', 0, true);
        $icon = (!empty($icon)) ? self::checkImagePath($url, $icon->href) : '';

        // Image
        $imageArr = self::image($url, $html);
        $image = null;
        foreach ($imageArr as $i) {
          $a = @getimagesize($i);
          if (!empty($a) && ($a[0] >= 64 && $a[1] >= 64)) {
            $image = $i;
            break;
          }
        }

        // Data
        $data['title']   = $title;
        $data['text']    = $text;
        $data['image']   = $image;
        $data['favicon'] = $icon;

        return $data;
      }

      if (preg_match('/text/', $mime)) {
        $image = ['', '#FFFFFF', '#00AAEE'];
        $data['image'] = json_encode($image, JSON_UNESCAPED_UNICODE);
        return $data;
      }

      if (empty($mime)) {
        $data['title'] = parse_url($url, PHP_URL_HOST);
        $data['text']  = null;
        return $data;
      }

    }
    public static function image($url, $html = null) {

      require_once ROOT . '/vendor/simple_html_dom.php';

      if (empty($html)) {
        $html = self::get($url);
        $html = str_get_html($html['content']);
      }

      if (!empty($html)) {

        $promo = $html->find('meta[property=og:image], meta[name=twitter:image], meta[itemprop=image]');
        $image = $html->find('img');

        $src = [];

        foreach ($promo as $i) {
          $s = self::checkImagePath($url, $i->content);
          array_push($src, $s);
        }

        foreach ($image as $i) {
          $s = self::checkImagePath($url, $i->src);
          array_push($src, $s);
        }

        $src = array_unique($src);
        $src = array_filter($src);
        $src = array_values($src);

        return $src;

      } else {

        return false;

      }

    }
    public static function checkImagePath($url, $src) {

      if (!(preg_match('/^http.*/', $src) || preg_match('/^\/\/.*/', $src))) {

        $u = parse_url($url);
        $http = (isset($u['scheme']) && !empty($u['scheme'])) ? $u['scheme'] : '';
        $host = (isset($u['host'])   && !empty($u['host']))   ? $u['host']   : '';
        $path = (isset($u['path'])   && !empty($u['path']))   ? $u['path']   : '';

        $http = (!empty($http)) ? $http . '://' : '//';
        if (!empty($path)) $path = (preg_match('/.*\/.*\.[a-zA-Z]{2,5}$/', $path)) ? substr($path, 0, strrpos($path, '/')) : $path;

        if (empty($host)) {
          $host = substr($path, 0, strpos($path, '/'));
          $path = substr($path, strpos($path, '/'));
        }

        if (empty($host)) {
          $host = $path;
          $path = '';
        }

        $host = strtolower($host);

        $p  = $http . $host;
        $p .= (preg_match('/^\/.*/', $src)) ? $src : $path . '/' . $src;
        $src = $p;
      }

      return $src;

    }
    public static function formatBytes($size) {
      $units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      $power = ($size > 0) ? floor(log($size, 1024)) : 0;
      return number_format($size / pow(1024, $power), 2, '.', ',') .  $units[$power];
    }
  }

?>
