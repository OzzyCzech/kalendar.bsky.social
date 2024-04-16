import {BskyAgent, RichText} from "@atproto/api";
import {getDayMeta, isFathersDay, isMothersDay} from "holidays-cs";
import {DateTime} from "luxon";

const CALENDAR_APP_PASSWORD = process.env.CALENDAR_APP_PASSWORD;
const CALENDAR_APP_HANDLE = process.env.CALENDAR_APP_HANDLE;

// Check if the environment variables are set
if (!CALENDAR_APP_PASSWORD || !CALENDAR_APP_HANDLE) {
  console.error('Please provide CALENDAR_APP_PASSWORD and CALENDAR_APP_HANDLE in the environment variables.');
  process.exit(1);
}

const agent = new BskyAgent({service: 'https://bsky.social'});
await agent.login({identifier: CALENDAR_APP_HANDLE, password: CALENDAR_APP_PASSWORD})

const date = DateTime.local().setLocale('cs');

let text = `Dobré ráno je ${date.toFormat('cccc')}, ${date.toFormat('d. LLLL yyyy')}:`;
let meta = getDayMeta(date.toJSDate());

// Name day
if (meta.names.length > 0) {
  text += `\n\nSvátek má ${meta.names.join(' a ')}`;
}

// Public holiday
if (meta.isPublicHoliday) {
  if (date.day === 24 && date.month === 12) {
    text += `\n\n🎄 Štědrý den a obchody mají dnes ${meta.shops.status}.`;
  } else if (date.day === 1 && date.month === 1) {
    text += `\n\n🎉 Nový rok a obchody mají dnes ${meta.shops.status}. ${meta.publicHoliday}`;
  } else {
    text += `\n\nSlavíme ${meta.publicHoliday} a obchody mají dnes ${meta.shops.status}.`;
  }
}

// Easter (special days)
if (meta.easter && !meta.easter.isGoodFriday && !meta.easter.isEasterMonday) {
  text += `\n\n${meta.easter.name}`;
}

// Other significant days
if (meta.isSignificantDay) {
  text += `\n\nSlavíme ${meta.significantDay.name} ${meta.significantDay.year ? `(${meta.significantDay.year})` : ''}.`;
}

// Mothers and Fathers day
if (isMothersDay(date)) {
  text += '\n\nDnes slavíme Den matek 🌷';
}

// Fathers day
if (isFathersDay(date)) {
  text += '\n\nDnes slavíme Den otců 🎮';
}

// Shops alert for tomorrow
const next = getDayMeta(date.plus({days: 1}));
if (next.isPublicHoliday && !next.shops.areOpen) {
  text += `\n\n🔥 Bacha zítra mají obchody ${next.shops.status}!`;
}

console.log('Post text:', text);

const rt = new RichText({text});
await rt.detectFacets(agent) // automatically detects mentions and links

await agent.post({
  text: rt.text,
  facets: rt.facets,
  langs: ['cs-CZ'],
  createdAt: new Date().toISOString(),
})