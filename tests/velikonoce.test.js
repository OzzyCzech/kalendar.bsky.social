import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { getHolyWeekName } from "../src/get-holy-week-name.js";


describe("Velikonoce", () => {
	it("Květná neděle", () => {
		const nedele = DateTime.fromISO("2025-04-13");
		expect(getHolyWeekName(nedele)).toBe(" († Květná neděle)");
	});

	it("Modré pondělí", () => {
		const pondeli = DateTime.fromISO("2025-04-14");
		expect(getHolyWeekName(pondeli)).toBe(" († Modré pondělí)");
	});

	it("Šedivé úterý", () => {
		const utery = DateTime.fromISO("2025-04-15");
		expect(getHolyWeekName(utery)).toBe(" († Šedivé úterý)");
	});

	it("Škaredá středa", () => {
		const streda = DateTime.fromISO("2025-04-16");
		expect(getHolyWeekName(streda)).toBe(" († Škaredá středa)");
	});

	it("Zelený čtvrtek", () => {
		const ctvrtek = DateTime.fromISO("2025-04-17");
		expect(getHolyWeekName(ctvrtek)).toBe(" († Zelený čtvrtek)");
	});

	it("Bílá sobota", () => {
		const sobota = DateTime.fromISO("2025-04-19");
		expect(getHolyWeekName(sobota)).toBe(" († Bílá sobota)");
	});

	it("Velikonoční neděle", () => {
		const nedele = DateTime.fromISO("2025-04-20");
		expect(getHolyWeekName(nedele)).toBe(" († Velikonoční neděle)");
	});

	it("Velký pátek a Velikonoční pondělí", () => {
		const patek = DateTime.fromISO("2025-04-18");
		expect(getHolyWeekName(patek)).toBe(""); // státní svátek

		const pondeli = DateTime.fromISO("2025-04-21");
		expect(getHolyWeekName(pondeli)).toBe(""); // státní svátek
	});

});