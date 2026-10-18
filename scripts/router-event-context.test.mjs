import assert from "node:assert/strict";
import { mock, test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { default: _default, ...realAlemon } = await import("alemonjs");
let router;
const sent = [];
const events = [];
mock.module("alemonjs", { namedExports: {
  ...realAlemon,
  defineChildren: (options) => options,
  Router: { create: (options) => { router = realAlemon.Router.create(options); return router; } },
  useMessage: (event) => {
    assert.ok(event && typeof event === "object", "必须使用处理器收到的真实事件，不能依赖宿主的隐式上下文");
    events.push(event);
    return [{ send: async (payload) => { sent.push(payload); } }];
  },
} });
const moduleUrl = (file) => new URL(`../lib/${file}`, import.meta.url).href;
mock.module(moduleUrl("api/gameAgents.js"), { namedExports: { xianyuGameExpose: [] } });
globalThis.format = (...items) => items;
await import(moduleUrl("index.js"));

const dispatch = async (event) => {
  const entries = router.values;
  let passed = false;
  const visit = async (index) => {
    if (index === entries.length) { passed = true; return; }
    const entry = entries[index];
    if (entry.regular) {
      entry.regular.lastIndex = 0;
      if (!entry.regular.test(event.MessageText)) return visit(index + 1);
    }
    const module = await entry.handler();
    const handler = typeof module === "function" ? module : module.default;
    await handler(event, () => visit(index + 1));
  };
  // 顶层会话处理器不参与问候路由，保留真实 scope 与 fallback 派发。
  entries.shift();
  await visit(0);
  return passed;
};

test("普通你好继续传给 AI；前缀问候在无宿主上下文时仍可回复", async () => {
  for (const name of ["message.create", "private.message.create"]) {
    const base = { name, Platform: "onebot", UserId: "user", MessageId: "test" };
    const before = sent.length;
    assert.equal(await dispatch({ ...base, MessageText: "你好" }), true);
    assert.equal(sent.length, before);
    for (const prefix of ["/", "#"]) {
      const event = { ...base, MessageText: `${prefix}你好` };
      assert.equal(await dispatch(event), false);
      assert.equal(events.at(-1), event);
    }
    assert.equal(sent.length, before + 2);
  }
});

test("所有游戏处理器显式传递事件，避免独立 AlemonJS 实例的上下文丢失", () => {
  const root = fileURLToPath(new URL("../src/response/", import.meta.url));
  const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
  for (const file of walk(root).filter((file) => file.endsWith(".ts"))) {
    assert.doesNotMatch(fs.readFileSync(file, "utf8"), /\buseMessage\(\s*\)/, file);
  }
});
