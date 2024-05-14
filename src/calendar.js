import {BskyAgent, RichText} from "@atproto/api";
import {getDayMeta} from "holidays-cs";
import {DateTime} from "luxon";
import {getNameDayArray} from "namedays-cs";
import {getInternationalDays} from "international-days-cs";

const CALENDAR_APP_PASSWORD = process.env.CALENDAR_APP_PASSWORD;
const CALENDAR_APP_HANDLE = process.env.CALENDAR_APP_HANDLE;

// Check if the environment variables are set
if (!CALENDAR_APP_PASSWORD || !CALENDAR_APP_HANDLE) {
	console.error('Please provide CALENDAR_APP_PASSWORD and CALENDAR_APP_HANDLE in the environment variables.');
	process.exit(1);
}

const agent = new BskyAgent({service: 'https://bsky.social'});
await agent.login({identifier: CALENDAR_APP_HANDLE, password: CALENDAR_APP_PASSWORD})

let date = DateTime.local();
let text = `Dobré ráno je ${date.setLocale('cs').toFormat('cccc')}, ${date.setLocale('cs').toFormat('d. LLLL yyyy')}:`;

// Name day
const names = getNameDayArray(date.toJSDate());
if (names.length > 0) {
	text += `\n\nSvátek má ${names.join(' a ')}`;
}

let meta = getDayMeta(date.toJSDate());

// Easter days in Holy Week
if (meta.isHolyWeek && !meta.easter.isEasterMonday && !meta.easter.isGoodFriday) {
	text += ` (je ${meta.easter.name})`;
}

if (meta.isPublicHoliday) {
	if (date.toFormat('ddMM') === '0101') {
		text += `\n\n🎉 Nový rok!\n\nSlavíme 🇨🇿 ${meta.publicHoliday}. Obchody mají dnes ${meta.shops.status}`;
	} else if (date.toFormat('ddMM') === '2412') {
		text += `\n\n🎄 Štědrý den. Obchody mají dnes ${meta.shops.status}.`;
	} else if (meta.easter?.isGoodFriday || meta.easter?.isEasterMonday) {
		text += `\n\n🐣 ${meta.easter.name}. Obchody mají dnes ${meta.shops.status}.`;
	} else {
		text += `\n\nSlavíme 🇨🇿 ${meta.publicHoliday}. Obchody mají dnes ${meta.shops.status}.`;
	}
}

// Other significant days
if (meta.isSignificantDay) {
	text += `\n\n${meta.significantDay.name} (${meta.significantDay.year})`;
}

// International days
const days = getInternationalDays(date.toJSDate());
if (days.length > 0) {
	text += `\n\n${days.map(day => `${day.icon ?? '🗓️'} ${day.name}`).join('\n')}`
}

// Tomorrow holiday alert
const next = getDayMeta(date.plus({days: 1}).toJSDate());
if (next.isPublicHoliday) {
	if (next.shops.areOpen) {
		text += `\n\n😌 Zítra je státní svátek, ale obchody budou otevřené.`;
	} else {
		text += `\n\n🔥 POZOR! Zítra je státní svátek a obchody mají ${next.shops.status}!`;
	}
}

console.log('Post text:', text);

const rt = new RichText({text});
await rt.detectFacets(agent) // automatically detects mentions and links

await agent.post({
	text: rt.text,
	facets: rt.facets,
	langs: ['cs'],
	createdAt: new Date().toISOString(),
})