<?php

  class Data {
    public static function meta($param) {
      return Parse::meta($param["data"]["link"]);
    }
    public static function image($param) {
      return Parse::image($param["data"]["link"]);
    }
  }

  class Bookmarks {
    public static function get($param) {
      return BookmarksDB::get($param["uid"]);
    }
    public static function getId($param) {
      return BookmarksDB::getId($paran["data"]["id"], $param["uid"]);
    }
    public static function add($param) {
      $data = Parse::meta($param["data"]["link"]);
      $data["gid"]  = $param["data"]["gid"];
      $data["date"] = time();
      $data["star"] = 0;
      $id = BookmarksDB::add($data, $param["uid"]);
      return ($id) ? BookmarksDB::getId($id, $param["uid"]) : $id;
    }
    public static function edit($param) {
      return BookmarksDB::edit($param["data"]["id"], $param["data"]["data"], $param["uid"]);
    }
    public static function delete($param) {
      return BookmarksDB::delete($param, $param["uid"]);
    }
    public static function reorder($param) {
      return BookmarksDB::reorder($param["data"], $param["uid"]);
    }
    public static function batch($param) {
      return BookmarksDB::batch($param["data"], $param["uid"]);
    }
  }

  class Groups {
    public static function get($param) {
      return GroupsDB::get($param["uid"]);
    }
    public static function add($param) {
      return GroupsDB::add($param["data"]["title"], $param["uid"]);
    }
    public static function edit($param) {
      return GroupsDB::edit($param["data"]["id"], $param["data"]["data"]["title"], $param["uid"]);
    }
    public static function reorder($param) {
      return GroupsDB::reorder($param["data"], $param["uid"]);
    }
    public static function delete($param) {
      return GroupsDB::delete($param["data"], $param["uid"]);
    }
  }

  class User {
    public static function setPass($param) {
      $uid  = $param["uid"];
      $pass = [
        'old' => trim($param["data"]["old"]),
        're'  => trim($param["data"]["re"]),
        'new' => trim($param["data"]["new"]),
      ];

      foreach ($pass as $p) {
        if (mb_strlen($p) < 3 && mb_strlen($p) > 100) return 4;
      }

      if ($pass['new'] !== $pass['re']) return 3;

      $user = UserDB::getById($uid);
      if ($user["pass"] !== hash("md5", $pass["old"])) return 2;

      return UserDB::edit($uid, hash("md5", $pass["new"]));
    }
    public static function signup($param) {
      $login = trim($param["data"]["login"]);
      $pass  = trim($param["data"]["pass"]);

      if (mb_strlen($login) < 3 && mb_strlen($login) > 100) return 4;
      if (mb_strlen($pass)  < 3 && mb_strlen($pass)  > 100) return 4;

      $q1 = UserDB::getByLogin($login);
      if ($q1) return 3;

      $id = UserDB::add([
        "login" => $login,
        "pass" =>  hash("md5", $pass)
      ]);

      if ($id) {
        Session::start($id);
        return 1;
      } else {
        return 2;
      }
    }
    public static function signin($param) {
      $login = trim($param["data"]['login']);
      $pass  = trim($param["data"]['pass']);

      if (mb_strlen($login) < 3 && mb_strlen($login) > 100) return 4;
      if (mb_strlen($pass)  < 3 && mb_strlen($pass)  > 100) return 4;

      $user = UserDB::getByLogin($login);
      if (!$user) return 3;

      if ($user['pass'] === hash('md5', $pass)) {
        Session::start($user['id']);
        return 1;
      } else {
        return 2;
      }
    }
    public static function signout() {
      Session::stop();
      return 1;
    }
    public static function delete($param) {
      $user = UserDB::getById($param["uid"]);
      if ($user['pass'] !== hash("md5", $param["data"])) return 2;

      $q = UserDB::delete($param["uid"]);
      if ($q) Session::unsetCookie();
      return $q;
    }
    public static function revoke ($param) {
      $token = Session::getCookie();
      return SessionDB::deleteAll($param["uid"], $token);
    }
  }

  class Session {
    public static $lifetime = 604800;
    public static function getCookie() {
      return (isset($_COOKIE[APPNAME])) ? $_COOKIE[APPNAME] : null;
    }
    public static function setCookie($token) {
      setcookie(APPNAME, $token, time() + self::$lifetime, "/");
    }
    public static function unsetCookie() {
      setcookie(APPNAME, "", time() - 3600, "/");
    }
    public static function getUID() {
      $token = self::getCookie();
      if ($token) {
        $session = SessionDB::get($token);
        if (empty($session)) {
          self::unsetCookie();
          return null;
        } else {
          return $session["uid"];
        }
      } else {
        return null;
      }
    }
    public static function start($id) {
      $token = hash("md5", $id . time());
      SessionDB::set($token, $id);
      self::setCookie($token);
    }
    public static function stop() {
      $token = self::getCookie();
      SessionDB::delete($token);
      self::unsetCookie();
    }
  }

  class Helper {
    public static function getPostData() {
      if (!empty($_POST)) {
        return filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
      } else {
        return json_decode(file_get_contents("php://input"), true);
      }
    }
    public static function encodeJson($data) {
      return json_encode($data, JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_NUMERIC_CHECK);
    }
    public static function goHome() {
      header("Location: ../");
      exit;
    }
  }

?>
