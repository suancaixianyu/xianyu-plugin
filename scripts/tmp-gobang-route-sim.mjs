// 临时模拟脚本：复现 alemonjs 路由分发，观察五子棋落子指令在未开局时的真实回复。
import "../node_modules/alemonjs/lib/application/define-children.js";
import "../node_modules/alemonjs/lib/application/format/message-api.js";
import { ResultCode } from "../node_modules/alemonjs/lib/common/variable.js";
import { createResult } from "../node_modules/alemonjs/lib/common/result.js";
import { setDirectSend } from "../node_modules/alemonjs/lib/application/runtime/cbp/processor/transport.js";
import { actionRequestResolves, actionRequestTimeouts } from "../node_modules/alemonjs/lib/application/runtime/cbp/processor/request-registry.js";
import { withEventContext } from "../node_modules/alemonjs/lib/application/runtime/hook-event-context.js";

const sends = [];
setDirectSend((envelope) => {
  sends.push(JSON.stringify(envelope?.payload ?? envelope));
  const id = envelope?.id;
  queueMicrotask(() => {
    const resolve = actionRequestResolves.get(id);
    if (resolve) {
      actionRequestResolves.delete(id);
      const timeout = actionRequestTimeouts.get(id);
      if (timeout) {
        actionRequestTimeouts.delete(id);
        clearTimeout(timeout);
      }
      resolve([createResult(ResultCode.Ok, "ok", null)]);
    }
  });
});

const app = (await import("../lib/index.js")).default;
const { responseRouter } = app.callback.register();
const nodes = responseRouter.current;

const unwrap = (value, eventName) => {
  let unwrapped = value;
  if (unwrapped && typeof unwrapped === "object" && "default" in unwrapped) {
    unwrapped = unwrapped.default;
  }
  if (typeof unwrapped === "function") {
    return [unwrapped];
  }
  if (unwrapped && typeof unwrapped === "object" && "current" in unwrapped) {
    if (unwrapped.select) {
      const selects = Array.isArray(unwrapped.select) ? unwrapped.select : [unwrapped.select];
      if (!selects.includes(eventName)) {
        return [];
      }
    }
    const currents = Array.isArray(unwrapped.current) ? unwrapped.current : [unwrapped.current];
    return currents.filter((item) => typeof item === "function");
  }
  return [];
};

const dispatch = async (eventName, MessageText, extra = {}) => {
  const event = {
    name: eventName,
    MessageText,
    UserId: "user-1",
    UserName: "tester",
    ChannelId: "group-1",
    IsPrivate: false,
    guid: "guid:group-1",
    ...extra,
  };
  sends.length = 0;
  await withEventContext(event, undefined, async () => {
    for (const node of nodes) {
      if (node.selects && !(Array.isArray(node.selects) ? node.selects : [node.selects]).includes(eventName)) {
        continue;
      }
      if (node.regular && !node.regular.test(event.MessageText ?? "")) {
        continue;
      }
      if (!node.handler) {
        continue;
      }
      const imported = await node.handler();
      const fns = unwrap(imported, eventName);
      if (fns.length === 0) {
        continue;
      }
      let advanced = false;
      for (const fn of fns) {
        advanced = false;
        const result = await fn(event, async () => {
          advanced = true;
        });
        if (advanced) {
          break;
        }
        if (result === false) {
          return;
        }
        return; // 未调用 next：事件被当前节点消费
      }
    }
  });
  return sends.map((text) => {
    try {
      const parsed = JSON.parse(text);
      const value = parsed?.input?.params?.format?.value ?? parsed?.input?.format?.value ?? parsed;
      return JSON.stringify(value);
    } catch {
      return text;
    }
  });
};

const cases = [
  ["message.create", "落子 8 8"],
  ["message.create", "8 8"],
  ["message.create", "五子棋落子"],
  ["message.create", "五子棋 落子 8 8"],
  ["message.create", "落子"],
  ["message.create", "五子棋落子 8 8"],
  ["message.create", "结束五子棋"],
];

for (const [eventName, text] of cases) {
  const replies = await dispatch(eventName, text);
  console.log(`[${text}] => ${replies.length === 0 ? "(无回复)" : replies.join(" || ")}`);
}

process.exit(0);
