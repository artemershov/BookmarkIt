<?php

  use Medoo\Medoo;

  class DB {
    private static $instance = null;
    private function __construct() {

      $db = new Medoo([
        "database_type" => "sqlite",
        "database_file" => ROOT . "/" . DBNAME
      ]);

      $db->query("CREATE TABLE IF NOT EXISTS bookmarks (
        id      integer PRIMARY KEY AUTOINCREMENT,
        link    text,
        title   text,
        text    text,
        image   text,
        favicon text,
        gid     integer,
        date    integer,
        star    boolean,
        pos     integer,
        uid     integer
      );");

      $db->query("CREATE TABLE IF NOT EXISTS groups (
        id      integer PRIMARY KEY AUTOINCREMENT,
        title   text,
        pos     integer,
        uid     integer
      );");

      $db->query("CREATE TABLE IF NOT EXISTS users (
        id      integer PRIMARY KEY AUTOINCREMENT,
        login   text,
        pass    text
      );");

      $db->query("CREATE TABLE IF NOT EXISTS session (
        id      integer PRIMARY KEY AUTOINCREMENT,
        uid     integer,
        token   text
      );");

      self::$instance = $db;

    }
    public static function getInstance() {
      if (self::$instance == null) new self();
      return self::$instance;
    }
  }

  class BookmarksDB {
    public static function get($uid) {
      return DB::getInstance()->select("bookmarks", "*", ["uid" => $uid]);
    }
    public static function getId($id, $uid) {
      return DB::getInstance()->get("bookmarks", "*", ["AND" => ["uid" => $uid, "id" => $id]]);
    }
    public static function add($data, $uid) {
      $db = DB::getInstance();
      $q1 = $db->max("bookmarks", "pos", ["uid" => $uid]);
      $data["pos"] = ($q1) ? $q1 + 1 : 1;
      $data["uid"] = $uid;
      $q2 = $db->insert("bookmarks", $data);
      return $db->id();
    }
    public static function edit($id, $data, $uid) {
      unset($data["id"], $data["uid"], $data["batch"]);
      return DB::getInstance()->update("bookmarks", $data, ["id" => $id, "uid" => $uid])->rowCount();
    }
    public static function reorder($data, $uid) {
      $q = "";
      foreach ($data as $b) {
        $q .= "UPDATE bookmarks SET pos = " . $b["pos"] . " WHERE id = " . $b["id"] . " AND uid = " . $uid . ";";
      }
      return DB::getInstance()->pdo->exec($q);
    }
    public static function delete($id, $uid) {
      return DB::getInstance()->delete("bookmarks", ["AND" => ["id" => $id, "uid" => $uid]])->rowCount();
    }
    public static function batch($data, $uid) {
      $q = "";
      switch ($data["action"]) {
        case "move":
          foreach ($data["id"] as $id) {
            $q .= "UPDATE bookmarks SET gid = " . $data["gid"] . " WHERE id = " . $id . " AND uid = " . $uid . ";";
          }
          break;
        case "delete":
          foreach ($data["id"] as $id) {
            $q .= "DELETE FROM bookmarks WHERE id=" . $id . " AND uid=" . $uid . ";";
          }
          break;
      }
      return DB::getInstance()->pdo->exec($q);
    }
  }

  class GroupsDB {
    public static function get($uid) {
      return DB::getInstance()->select("groups", "*", ["uid" => $uid]);
    }
    public static function add($data, $uid) {
      $db = DB::getInstance();
      $q1 = $db->max("groups", "pos", ["uid" => $uid]);
      $pos = ($q1) ? $q1 + 1 : 1;
      $q2 = $db->insert("groups", [
        "title" => $data,
        "pos"   => $pos,
        "uid"   => $uid,
      ]);
      if ($q2) {
        return [
          "id"  => $db->id(),
          "pos" => $pos
        ];
      } else {
        return $q2;
      }
    }
    public static function edit($id, $data, $uid) {
      return DB::getInstance()->update("groups", ["title" => $data], ["AND" => ["id" => $id, "uid" => $uid]])->rowCount();
    }
    public static function reorder($data, $uid) {
      $q = "";
      foreach ($data as $b) {
        $q .= "UPDATE groups SET pos = " . $b["pos"] . " WHERE id = " . $b["id"] . " AND uid = " . $uid . ";";
      }
      return DB::getInstance()->pdo->exec($q);
    }
    public static function delete($id, $uid) {
      $q   = "DELETE FROM bookmarks WHERE gid=" . $id . " AND uid=" . $uid . ";";
      $q  .= "DELETE FROM groups    WHERE  id=" . $id . " AND uid=" . $uid . ";";
      return DB::getInstance()->pdo->exec($q);
    }
  }

  class UserDB {
    public static function getById($id) {
      return DB::getInstance()->get("users", "*", ["id" => $id]);
    }
    public static function getByLogin($login) {
      return DB::getInstance()->get("users", "*", ["login" => $login]);
    }
    public static function add($data) {
      $db = DB::getInstance();
      $q = $db->insert("users", $data);
      return ($q) ? $db->id() : $q;
    }
    public static function edit($id, $pass) {
      return DB::getInstance()->update("users", ["pass" => $pass], ["id" => $id])->rowCount();
    }
    public static function delete($id) {
      $q   = "DELETE FROM session   WHERE uid=" . $id . ";";
      $q  .= "DELETE FROM bookmarks WHERE uid=" . $id . ";";
      $q  .= "DELETE FROM groups    WHERE uid=" . $id . ";";
      $q  .= "DELETE FROM users     WHERE  id=" . $id . ";";
      return DB::getInstance()->pdo->exec($q);
    }
  }

  class SessionDB {
    public static function get($token) {
      return DB::getInstance()->get("session", ["uid"], ["token" => $token]);
    }
    public static function set($token, $uid) {
      return DB::getInstance()->insert("session", [
        "token" => $token,
        "uid"   => $uid,
      ]);
    }
    public static function delete($token) {
      return DB::getInstance()->delete("session", ["token" => $token])->rowCount();
    }
    public static function deleteAll($uid, $token) {
      return DB::getInstance()->delete("session", ["AND" => ["uid" => $uid, "token[!]" => $token]])->rowCount();
    }
  }

?>
