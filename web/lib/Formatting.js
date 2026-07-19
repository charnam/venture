
class Formatting {
	static roundToNearest(number, numbers) {
		return numbers.reduce((closest, current) =>
			Math.abs(current - number) < Math.abs(closest - number)
				? current
				: closest
		);
	}
}

export default Formatting;