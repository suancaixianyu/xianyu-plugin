//#region src/api/lib.ts
function timeDiff(start, end) {
	return Math.floor((end - start) / 1e3);
}

//#endregion
export { timeDiff };