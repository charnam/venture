
class Random {
	static id() {
		return Date.now().toString(16)+"-"+(Math.random() * 9999999).toString(16)
	}
}

export default Random;