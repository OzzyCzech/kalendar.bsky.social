import { getDayMeta } from "holidays-cs";

export function getHolyWeekName(date) {
	let meta = getDayMeta(date.toJSDate());

	console.log(meta);
	// Easter days in Holy Week
	if (meta.isHolyWeek && !meta.easter.isEasterMonday && !meta.easter.isGoodFriday) {
		return ` († ${meta.easter.name})`;
	}

	return "";
}