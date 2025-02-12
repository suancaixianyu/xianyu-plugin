import React from "react";
import { defineConfig } from "jsxp";
import Word from "@src/image/conponent/help";
import Minesweeper from "@src/image/conponent/minesweeper/help";
import Map from "@src/image/conponent/minesweeper/map";
import { newGame } from "@src/apps/minesweeper/start/res";
export default defineConfig({
  routes: {
    "/": {
      component: <Word data={"AlemonJS 跨平台开发框架"} />,
    },
    "/minesweeper/help": {
      component: <Minesweeper />,
    },
    "/minesweeper": {
      component: <Map game={newGame("简单")} />,
    },
  },
});
