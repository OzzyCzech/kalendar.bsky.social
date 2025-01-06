import { getNameDay } from "namedays-cs";

export function getNameDayText(date) {
	const names = getNameDay(date.toJSDate());
	if (names.length > 0) {
		const glue = names.length >= 3 ? ", " : " a ";
		const has = names.length > 1 ? "mají" : "má";

		return `\n\nSvátek ${has} ${names.join(glue)}`;
	}

	return "";
}