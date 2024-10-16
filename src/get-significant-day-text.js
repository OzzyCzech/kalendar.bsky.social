import { getDayMeta } from "holidays-cs";

export function getSignificantDayText(date) {
	const meta = getDayMeta(date.toJSDate());
	return meta.isSignificantDay ? `\n\n${meta.significantDay.name} (${meta.significantDay.year})` : "";
}