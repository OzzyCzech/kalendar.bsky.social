import { getInternationalDays } from "international-days-cs";

export function getInternationalDayText(date) {
	const days = getInternationalDays(date.toJSDate());
	if (days.length > 0) {
		return `\n\n${days.map(day => `${day.icon ?? "🗓"} ${day.name}`).join("\n")}`
	}

	return "";
}