<?php

  error_reporting(E_ALL);
  ini_set('display_errors', 1);

  $p = (!empty($_POST)) ? filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING) : json_decode(file_get_contents('php://input'), true);

  if ($p) {

    defined('ROOT') or define('ROOT', dirname(__FILE__));

    require_once ROOT . '/database.php';
    require_once ROOT . '/user.php';
    require_once ROOT . '/parse.php';
    require_once ROOT . '/api.php';

    $a = (isset($p['action']) && !empty($p['action'])) ? $p['action'] : null;
    $t = (isset($p['token'])  && !empty($p['token']))  ? $p['token']  : null;
    $u = ($t) ? SessionDB::get($t) : null;

    if ($t && !$u) {

      Session::unsetCookie();
      header('HTTP/1.0 403 Forbidden');
      exit;

    } else if ($t && $u) {

      Api::main($a, $p, $u, $t);
      exit;

    } else if (!$t && !$u) {

      Api::auth($a, $p);
      exit;

    }

  } else {

    header('Location: ../');
    exit;

  }

?>
