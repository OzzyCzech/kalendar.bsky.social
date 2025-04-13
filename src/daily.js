import { AtpAgent, RichText } from "@atproto/api";
import process from "node:process";
import { DateTime } from "luxon";
import { getShoppingAlert } from "./get-shopping-alert.js";
import { getHolidayText } from "./get-holiday-text.js";
import { getNameDayText } from "./get-name-day-text.js";
import { getInternationalDayText } from "./get-international-day-text.js";
import { getSignificantDayText } from "./get-significant-day-text.js";
import { getHolyWeekName } from "./get-holy-week-name.js";

const CALENDAR_APP_PASSWORD = process.env.CALENDAR_APP_PASSWORD;
const CALENDAR_APP_HANDLE = process.env.CALENDAR_APP_HANDLE;

// Check if the environment variables are set
if (!CALENDAR_APP_PASSWORD || !CALENDAR_APP_HANDLE) {
	console.error("Please provide CALENDAR_APP_PASSWORD and CALENDAR_APP_HANDLE in the environment variables.");
	process.exit(1);
}

let date = DateTime.local({zone: "Europe/Prague"}).setLocale("cs");
//date = DateTime.fromFormat("2025-04-20", "yyyy-MM-dd");
let text = `Dobré ráno, je ${date.toFormat("cccc")}, ${date.toFormat("d. LLLL yyyy")}:`;

// Compile the post text
text += getNameDayText(date);
text += getHolyWeekName(date);
text += getHolidayText(date);
text += getSignificantDayText(date);
text += getInternationalDayText(date)
text += getShoppingAlert(date);

console.log(`Post text:\n\n${text}`);

// If the DRY_RUN environment variable is set, skip the post creation
if (process.env.DRY_RUN) {
	console.error("\n\nDry run, skipping post creation. Exiting...");
	process.exit(0);
}

const agent = new AtpAgent({service: "https://bsky.social"});
await agent.login({identifier: CALENDAR_APP_HANDLE, password: CALENDAR_APP_PASSWORD})

const richText = new RichText({text});
await richText.detectFacets(agent) // automatically detects mentions and links

await agent.post({
	text: richText.text,
	facets: richText.facets,
	langs: ["cs"],
	createdAt: new Date().toISOString(),
});