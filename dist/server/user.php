<?php

  class User {
    public static function register($data) {

      $login = trim($data['login']);
      $pass  = trim($data['pass']);

      if (mb_strlen($login) < 3 && mb_strlen($login) > 100) return 4;
      if (mb_strlen($pass)  < 3 && mb_strlen($pass)  > 100) return 4;

      $q1 = UserDB::getByLogin($login);
      if ($q1) return 3;

      $q2 = UserDB::add($login, $pass);
      if ($q2) {
        $token = hash('md5', time());
        SessionDB::set($token, $q2);
        Session::setCookie($token);
        return 1;
      } else {
        return 2;
      }

    }
    public static function login($data) {

      $login = trim($data['login']);
      $pass  = trim($data['pass']);

      if (mb_strlen($login) < 3 && mb_strlen($login) > 100) return 4;
      if (mb_strlen($pass)  < 3 && mb_strlen($pass)  > 100) return 4;

      $user = UserDB::getByLogin($login);
      if (!$user) return 3;

      if ($user['pass'] === hash('md5', $pass)) {
        $token = hash('md5', time());
        SessionDB::set($token, $user['id']);
        Session::setCookie($token);
        return 1;
      } else {
        return 2;
      }

    }
    public static function passChange($data, $u) {

      $pass = [
        'old' => trim($data['old']),
        'new' => trim($data['new']),
        're'  => trim($data['re']),
      ];

      foreach ($pass as $p) {
        if (mb_strlen($p) < 3 && mb_strlen($p) > 100) return 4;
      }

      if ($pass['new'] !== $pass['re']) return 3;

      $user = UserDB::getById($u);
      if ($user['pass'] !== hash('md5', $pass['old'])) return 2;

      return UserDB::edit($u, $pass['new']);

    }
    public static function delete($pass, $u) {

      $user = UserDB::getById($u);
      if ($user['pass'] !== hash('md5', $pass)) return 2;

      $del = UserDB::delete($u);
      if ($del) Session::unsetCookie();
      return $del;

    }
  }

  class Session {
    public static $sessionName = 'BookmarkItToken';
    public static $sessionLifetime = 604800; // 7 * 24 * 60 * 60;
    public static function setCookie($token) {
      setcookie(self::$sessionName, $token, time() + self::$sessionLifetime, '/');
    }
    public static function unsetCookie() {
      setcookie(self::$sessionName, '', time() - 3600, '/');
    }
  }

?>
