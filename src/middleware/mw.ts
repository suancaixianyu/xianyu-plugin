// OnMiddleware((事件体,控制体)=>消息体,消息类型)
export default OnMiddleware(
  (event, next) => {
    // 新增字段
    // event["user_id"] = event.UserId;

    // 常用于兼容其他框架或增强event功能

    next();
  },
  "message.create" // 监听的事件类型
  //  ['message.create','private.message.create'] // 多选
);
