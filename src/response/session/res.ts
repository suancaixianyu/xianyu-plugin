import { gameSession } from "@src/api";

export default async (event, next) => {
  const rewritten = gameSession.rewriteActiveCommand(event);

  if (rewritten) {
    event.MessageText = rewritten;
  }

  if (typeof next === "function") {
    await next();
  }
};
