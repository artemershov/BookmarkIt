<?php

  class DB {
    private static $instance = null;
    private function __construct() {

      // EasyDB
      require_once ROOT . '/vendor/easyDb/EasyDB.php';
      require_once ROOT . '/vendor/easyDb/EasyStatement.php';
      require_once ROOT . '/vendor/easyDb/Factory.php';

      $pdo = new PDO('sqlite:' . ROOT . '/sqlite.db');
      $db = new \ParagonIE\EasyDB\EasyDB($pdo, 'sqlite');
      self::$instance = $db;

      $db->run('CREATE TABLE IF NOT EXISTS bookmarks (
        id integer PRIMARY KEY AUTOINCREMENT,
        link text,
        title text,
        text text,
        image text,
        favicon text,
        gid integer,
        date integer,
        star boolean,
        pos integer,
        uid integer
      );');

      $db->run('CREATE TABLE IF NOT EXISTS groups (
        id integer PRIMARY KEY AUTOINCREMENT,
        title text,
        pos integer,
        uid integer
      );');

      $db->run('CREATE TABLE IF NOT EXISTS users (
        id integer PRIMARY KEY AUTOINCREMENT,
        login text,
        pass text
      );');

      $db->run('CREATE TABLE IF NOT EXISTS session (
        id integer PRIMARY KEY AUTOINCREMENT,
        uid integer,
        token text
      );');

    }
    public static function getInstance() {
      if (self::$instance == null) new self();
      return self::$instance;
    }
  }

  class BookmarksDB {
    public static function get($uid) {
      return DB::getInstance()->run('SELECT * FROM bookmarks WHERE uid = ?', $uid);
    }
    public static function getId($id, $uid) {
      return DB::getInstance()->row('SELECT * FROM bookmarks WHERE id = ' . $id . ' AND uid = ' . $uid . ';');
    }
    public static function add($data, $uid) {
      $db = DB::getInstance();
      $q1 = $db->cell('SELECT MAX(pos) FROM bookmarks WHERE uid = ?', $uid);
      $data['pos'] = ($q1) ? $q1 + 1 : 1;
      $data['uid'] = $uid;
      $q2 = $db->insert('bookmarks', $data);
      return ($q2) ? $db->cell('SELECT last_insert_rowid() FROM bookmarks WHERE uid = ?;', $uid) : $q2;
    }
    public static function edit($id, $data, $uid) {
      unset($data['id'], $data['uid']); // prevent changes of ids
      return DB::getInstance()->update('bookmarks', $data, ['id' => $id, 'uid' => $uid]);
    }
    public static function reorder($data, $uid) {
      $pdo = DB::getInstance()->getPdo();
      $q = '';
      foreach ($data as $b) {
        $q .= 'UPDATE bookmarks SET pos = ' . $b['pos'] . ' WHERE id = ' . $b['id'] . ' AND uid = ' . $uid . ';';
      }
      return $pdo->exec($q);
    }
    public static function delete($id, $uid) {
      return DB::getInstance()->delete('bookmarks', ['id' => $id, 'uid' => $uid]);
    }
    public static function batch($data, $uid) {
      $pdo = DB::getInstance()->getPdo();
      $q = '';
      switch ($data['action']) {
        case 'move':
          foreach ($data['id'] as $id) {
            $q .= 'UPDATE bookmarks SET gid = ' . $data['gid'] . ' WHERE id = ' . $id . ' AND uid = ' . $uid . ';';
          }
          break;
        case 'delete':
          foreach ($data['id'] as $id) {
            $q .= 'DELETE FROM bookmarks WHERE id=' . $id . ' AND uid=' . $uid . ';';
          }
          break;
      }
      return $pdo->exec($q);
    }
  }

  class GroupsDB {
    public static function get($uid) {
      return DB::getInstance()->run('SELECT * FROM groups WHERE uid = ?', $uid);
    }
    public static function add($data, $uid) {
      $db = DB::getInstance();
      $q1 = $db->cell('SELECT MAX(pos) FROM groups WHERE uid = ?', $uid);
      $pos = ($q1) ? $q1 + 1 : 1;
      $q2 = $db->insert('groups', [
        'title' => $data,
        'pos'   => $pos,
        'uid'   => $uid,
      ]);
      if ($q2) {
        return [
          'id' => $db->cell('SELECT last_insert_rowid() FROM groups WHERE uid = ?;', $uid),
          'pos' => $pos
        ];
      } else {
        return $q2;
      }
    }
    public static function edit($id, $data, $uid) {
      return DB::getInstance()->update('groups', ['title' => $data], ['id' => $id, 'uid' => $uid]);
    }
    public static function reorder($data, $uid) {
      $pdo = DB::getInstance()->getPdo();
      $q = '';
      foreach ($data as $b) {
        $q .= 'UPDATE groups SET pos = ' . $b['pos'] . ' WHERE id = ' . $b['id'] . ' AND uid = ' . $uid . ';';
      }
      return $pdo->exec($q);
    }
    public static function delete($id, $uid) {
      $pdo = DB::getInstance()->getPdo();
      $q   = 'DELETE FROM bookmarks WHERE gid=' . $id . ' AND uid=' . $uid . ';';
      $q  .= 'DELETE FROM groups    WHERE  id=' . $id . ' AND uid=' . $uid . ';';
      return $pdo->exec($q);
    }
  }

  class UserDB {
    public static function getById($id) {
      return DB::getInstance()->row('SELECT * FROM users WHERE id = ?', $id);
    }
    public static function getByLogin($login) {
      return DB::getInstance()->row('SELECT * FROM users WHERE login = ?', $login);
    }
    public static function add($login, $pass) {
      $db = DB::getInstance();
      $q = $db->insert('users', [
        'login' => $login,
        'pass'  => hash('md5', $pass),
      ]);
      return ($q) ? $db->cell('SELECT last_insert_rowid() FROM users WHERE login = ?;', $login) : $q;
    }
    public static function edit($id, $pass) {
      return DB::getInstance()->update('users', ['pass' => hash('md5', $pass)], ['id' => $id]);
    }
    public static function delete($id) {
      $pdo = DB::getInstance()->getPdo();
      $q   = 'DELETE FROM session   WHERE uid=' . $id . ';';
      $q  .= 'DELETE FROM bookmarks WHERE uid=' . $id . ';';
      $q  .= 'DELETE FROM groups    WHERE uid=' . $id . ';';
      $q  .= 'DELETE FROM users     WHERE  id=' . $id . ';';
      return $pdo->exec($q);
    }
  }

  class SessionDB {
    public static function get($token) {
      return DB::getInstance()->cell('SELECT uid FROM session WHERE token = ?', $token);
    }
    public static function set($token, $uid) {
      return DB::getInstance()->insert('session', [
        'token' => $token,
        'uid'   => $uid,
      ]);
    }
    public static function delete($token) {
      return DB::getInstance()->delete('session', ['token' => $token]);
    }
    public static function deleteAll($uid, $token) {
      $pdo = DB::getInstance()->getPdo();
      $q   = 'DELETE FROM session WHERE uid=' . $uid . ' AND NOT token="' . $token . '";';
      return $pdo->exec($q);
    }
  }

?>
