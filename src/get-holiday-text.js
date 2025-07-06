import { getDayMeta } from "holidays-cs";

export function getHolidayText(date) {
	const meta = getDayMeta(date.toJSDate());

	if (meta.isPublicHoliday) {

		if (date.toFormat("ddMM") === "0101") {
			return `\n\n🎉 Nový rok!\n\nSlavíme 🇨🇿 ${meta.publicHoliday}`;
		}

		if (date.toFormat("ddMM") === "2412") {
			return `\n\n🎄 Štědrý den`;
		}

		if (meta.easter?.isGoodFriday || meta.easter?.isEasterMonday) {
			return `\n\n🐣 ${meta.easter.name}`;
		}

		return `\n\nSt. Svátek 🇨🇿 ${meta.publicHoliday}`;
	}

	return "";
}