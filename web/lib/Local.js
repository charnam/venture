
class Local {
	static byMeta(metaURL, filename) {
		const fullURL = new URL(metaURL);
		const splitURL = fullURL.pathname.split("/");
		splitURL.pop();
		splitURL.push(filename);
		const styleURL = splitURL.join("/")
		return styleURL;
	}
}

export default Local;