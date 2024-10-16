import { getDayMeta } from "holidays-cs";

export function getShoppingAlert(date) {
	const today = getDayMeta(date.toJSDate());
	const tomorrow = getDayMeta(date.plus({ days: 1 }).toJSDate());

	let text = "";

	if (today.isPublicHoliday) {
		// státní svátek
		text += today.shops.areOpen ? "\n\n🛍️ " : "\n\n🚨 "
		text += `Obchody mají dnes ${today.shops.status}`;

		// co zítra?
		if (tomorrow.isPublicHoliday) {
			text += " a zítra bude";

			if (today.shops.areOpen === tomorrow.shops.areOpen) {
				text += ` taky`;
			}

			if (today.shops.areOpen && !tomorrow.shops.areOpen) {
				text += ` 🚨`;
			}

			text += ` ${tomorrow.shops.status}`;
		}

	} else if (tomorrow.isPublicHoliday) {
		text += tomorrow.shops.areOpen ?
			"\n\n🛍️ Zítra je státní svátek, ale obchody budou otevřené" :
			"\n\n🚨 Zítra je státní svátek a budou zavřené obchody!!!";
	}


	return text;
}