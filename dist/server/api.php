<?php

  class Api {
    public static function main($a, $p, $u, $t) {

      Session::setCookie($t);

      switch ($a) {

        case 'init':
          $data = [
            'bookmarks' => BookmarksDB::get($u),
            'groups' => GroupsDB::get($u),
          ];
          echo self::json($data);
          break;

        case 'bookmarksGet':
          echo self::json(BookmarksDB::get($u));
          break;

        case 'bookmarksGetId':
          echo self::json(BookmarksDB::getId($p['id'], $u));
          break;

        case 'bookmarksAdd':
          $data = Parse::meta($p['data']['link']);
          $data['gid']  = $p['data']['gid'];
          $data['date'] = time();
          $data['star'] = 0;
          $id = BookmarksDB::add($data, $u);
          echo ($id) ? self::json(BookmarksDB::getId($id, $u)) : $id;
          break;

        case 'bookmarksEdit':
          echo BookmarksDB::edit($p['id'], $p['data'], $u);
          break;

        case 'bookmarksDelete':
          echo BookmarksDB::delete($p['id'], $u);
          break;

        case 'bookmarksReorder':
          echo BookmarksDB::reorder($p['data'], $u);
          break;

        case 'bookmarksBatch':
          echo BookmarksDB::batch($p['data'], $u);
          break;

        case 'groupsGet':
          echo self::json(GroupsDB::get($u));
          break;

        case 'groupsAdd':
          echo self::json(GroupsDB::add($p['data']['title'], $u));
          break;

        case 'groupsEdit':
          echo GroupsDB::edit($p['id'], $p['data']['title'], $u);
          break;

        case 'groupsReorder':
          echo GroupsDB::reorder($p['data'], $u);
          break;

        case 'groupsDelete':
          echo GroupsDB::delete($p['id'], $u);
          break;

        case 'parseMetadata':
          echo json_encode(Parse::meta($p['link']));
          break;

        case 'parseImages':
          echo json_encode(Parse::image($p['link']));
          break;

        case 'userLogout':
          Session::unsetCookie();
          echo SessionDB::delete($t);
          break;

        case 'userLogoutAll':
          echo SessionDB::deleteAll($u, $t);
          break;

        case 'userPassChange':
          echo User::passChange($p['data'], $u);
          break;

        case 'userDelete':
          echo User::delete($p['pass'], $u);
          break;

        default:
          header('HTTP/1.0 404 Not Found');
          break;
      }

    }
    public static function auth($a, $p) {

      switch ($a) {

        case 'userRegister':
          echo User::register($p['data']);
          break;

        case 'userLogin':
          echo User::login($p['data']);
          break;

        default:
          header('HTTP/1.0 404 Not Found');
          break;
      }

    }
    public static function json($data) {
      return json_encode($data, JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_NUMERIC_CHECK);
    }
  }

?>
