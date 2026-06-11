import { getInternationalDays } from "international-days-cs";

export function getInternationalDayLines(date) {
	return getInternationalDays(date.toJSDate())
		.map(day => `${day.icon ?? "🗓"} ${day.name}`);
}
