var index = defineChildren(() => ({
    onCreated() {
        console.log("onCreated");
    },
}));

export { index as default };
