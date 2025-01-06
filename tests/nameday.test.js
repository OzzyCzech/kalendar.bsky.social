import { describe, expect, it } from "vitest";
import { getNameDayText } from "../src/get-name-day-text.js";
import { DateTime } from "luxon";


describe("Jmeniny", () => {
	it("Svátek mají tři a více", () => {
		const kmb = DateTime.fromISO("2025-01-06");
		expect(getNameDayText(kmb)).toBe("\n\nSvátek mají Kašpar, Melichar, Baltazar");
	});

	it("Svátek mají dvě osoby", () => {
		const date = DateTime.fromISO("2025-12-24");
		expect(getNameDayText(date)).toBe("\n\nSvátek mají Adam a Eva");
	});

	it("Svátek má jedna osoba", () => {
		const date = DateTime.fromISO("2025-01-23");
		expect(getNameDayText(date)).toBe("\n\nSvátek má Zdeněk");
	});
});