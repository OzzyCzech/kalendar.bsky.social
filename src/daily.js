import { AtpAgent, RichText } from "@atproto/api";
import process from "node:process";
import { DateTime } from "luxon";
import { getShoppingAlert } from "./get-shopping-alert.js";
import { getHolidayText } from "./get-holiday-text.js";
import { getNameDayText } from "./get-name-day-text.js";
import { getInternationalDayLines } from "./get-international-day-text.js";
import { getSignificantDayText } from "./get-significant-day-text.js";
import { getHolyWeekName } from "./get-holy-week-name.js";
import { hasPostedOn } from "./has-posted-on.js";

const CALENDAR_APP_PASSWORD = process.env.CALENDAR_APP_PASSWORD;
const CALENDAR_APP_HANDLE = process.env.CALENDAR_APP_HANDLE;

// Check if the environment variables are set
if (!CALENDAR_APP_PASSWORD || !CALENDAR_APP_HANDLE) {
	console.error("Please provide CALENDAR_APP_PASSWORD and CALENDAR_APP_HANDLE in the environment variables.");
	process.exit(1);
}

// Bluesky hard limit is 300 graphemes
const LIMIT = 300;
const segmenter = new Intl.Segmenter("cs", {granularity: "grapheme"});
const len = (s) => [...segmenter.segment(s)].length;

let date = DateTime.local({zone: "Europe/Prague"}).setLocale("cs");
//date = DateTime.fromFormat("2025-04-20", "yyyy-MM-dd");

// Mandatory parts (always kept)
let text = `Dobré ráno, je ${date.toFormat("cccc")}, ${date.toFormat("d. LLLL yyyy")}:`;
text += getNameDayText(date);
text += getHolyWeekName(date);
text += getHolidayText(date);

// Shopping alert is reserved for the end, so account for it in the budget
const shopping = getShoppingAlert(date);
let budget = LIMIT - len(text) - len(shopping);

// Optional: significant day (dropped entirely if it does not fit)
const significant = getSignificantDayText(date);
if (significant && len(significant) <= budget) {
	text += significant;
	budget -= len(significant);
}

// Optional: international days, added one by one until the limit is reached
const lines = getInternationalDayLines(date);
for (let i = 0; i < lines.length; i++) {
	const chunk = (i === 0 ? "\n\n" : "\n") + lines[i];
	if (len(chunk) > budget) break; // stop at the first one that does not fit
	text += chunk;
	budget -= len(chunk);
}

text += shopping;

console.log(`Post text:\n\n${text}`);

// If the DRY_RUN environment variable is set, skip the post creation
if (process.env.DRY_RUN) {
	console.error("\n\nDry run, skipping post creation. Exiting...");
	process.exit(0);
}

const agent = new AtpAgent({service: "https://bsky.social"});
await agent.login({identifier: CALENDAR_APP_HANDLE, password: CALENDAR_APP_PASSWORD})

// Never post twice for the same day, no matter how often we are dispatched
const {data} = await agent.getAuthorFeed({actor: agent.session.did, limit: 20, filter: "posts_no_replies"});
if (hasPostedOn(data.feed, agent.session.did, date)) {
    console.error("\n\nToday's post already exists, skipping. Exiting...");
    process.exit(0);
}

const richText = new RichText({text});
await richText.detectFacets(agent) // automatically detects mentions and links

await agent.post({
	text: richText.text,
	facets: richText.facets,
	langs: ["cs"],
	createdAt: new Date().toISOString(),
});