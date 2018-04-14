<?php

  error_reporting(E_ALL);
  ini_set("display_errors", 1);

  defined("APPNAME") or define("APPNAME", "BookmarkIt");
  defined("DBNAME")  or define("DBNAME",  "database.db");
  defined("PATH")    or define("PATH",    "/BookmarkIt/dist/server");
  defined("ROOT")    or define("ROOT",    dirname(__FILE__));

  require_once ROOT . "/vendor/AltoRouter.php";
  require_once ROOT . "/vendor/Medoo.php";
  require_once ROOT . "/vendor/simple_html_dom.php";
  require_once ROOT . "/app/model.php";
  require_once ROOT . "/app/controller.php";
  require_once ROOT . "/app/parse.php";
  require_once ROOT . "/app/route.php";

?>
