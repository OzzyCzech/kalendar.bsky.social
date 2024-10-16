import { getNameDay } from "namedays-cs";

export function getNameDayText(date) {
	const names = getNameDay(date.toJSDate());
	return names.length > 0 ? `\n\nSvátek má ${names.join(" a ")}` : "";
}