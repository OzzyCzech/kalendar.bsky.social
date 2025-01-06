import { getNameDay } from "namedays-cs";

export function getNameDayText(date) {
	const names = getNameDay(date.toJSDate());
	if (names.length > 0) {
		const glue = names.length >= 3 ? ", " : " a ";
		return `\n\nSvátek má ${names.join(glue)}`;
	}
	return "";
}