var index = defineChildren({
    onCreated() {
        logger.info({
            message: '本地测试启动'
        });
    }
});

export { index as default };
