import { Game } from "../../typing";

const pools = () => {
  const games: {
    [key: string]: Game;
  } = {};
  return {
    getGame: (gameId: string) => {
      return games[gameId];
    },
    saveGame: (gameId: string, game: any) => {
      games[gameId] = game;
    },
    removeGame: (gameId: string) => {
      delete games[gameId];
    },
  };
};
export const gamePools = pools();
