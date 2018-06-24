<?php

  $router = new AltoRouter();
  $router->setBasePath(PATH);
  if (Session::getUID()) {
    Session::updateCookie();
    $routes = [
      ["POST", "/bookmarks/get",     "Bookmarks::get"    ],
      ["POST", "/bookmarks/add",     "Bookmarks::add"    ],
      ["POST", "/bookmarks/edit",    "Bookmarks::edit"   ],
      ["POST", "/bookmarks/reorder", "Bookmarks::reorder"],
      ["POST", "/bookmarks/delete",  "Bookmarks::delete" ],
      ["POST", "/bookmarks/batch",   "Bookmarks::batch"  ],

      ["POST", "/groups/get",        "Groups::get"       ],
      ["POST", "/groups/add",        "Groups::add"       ],
      ["POST", "/groups/edit",       "Groups::edit"      ],
      ["POST", "/groups/reorder",    "Groups::reorder"   ],
      ["POST", "/groups/delete",     "Groups::delete"    ],

      ["POST", "/user/signout",      "User::signout"     ],
      ["POST", "/user/setpass",      "User::setpass"     ],
      ["POST", "/user/delete",       "User::delete"      ],
      ["POST", "/user/revoke",       "User::revoke"      ],

      ["POST", "/parse/meta",        "Data::meta"        ],
      ["POST", "/parse/image",       "Data::image"       ],
    ];
  } else {
    $routes = [
      ["POST", "/user/signin",      "User::signin"      ],
      ["POST", "/user/signup",      "User::signup"      ],
    ];
  }
  $router->addRoutes($routes);

  $match = $router->match();
  if (!$match) {
    header("HTTP/1.0 403 Forbidden");
    exit;
  }

  if($match && is_callable($match["target"])) {
    $data = call_user_func_array($match["target"], [
      [
        "uid"  => Session::getUID(),
        "data" => Helper::getPostData()
      ]
    ]);
    echo Helper::encodeJson($data);
  } else {
    header("HTTP/1.0 403 Forbidden");
    exit;
  }

?>
