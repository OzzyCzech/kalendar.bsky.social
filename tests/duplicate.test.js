import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { hasPostedOn } from "../src/has-posted-on.js";

const DID = "did:plc:kalendar";

const entry = (createdAt, did = DID) => ({post: {author: {did}, record: {createdAt}}});

describe("Kontrola duplicity", () => {
    const date = DateTime.fromISO("2026-08-30", {zone: "Europe/Prague"});

    it("Pozná dnešní post", () => {
        expect(hasPostedOn([entry("2026-08-30T05:22:05.304Z")], DID, date)).toBe(true);
    });

    it("Prázdný feed znamená, že se ještě neposílalo", () => {
        expect(hasPostedOn([], DID, date)).toBe(false);
    });

    it("Včerejší post dnešní odeslání neblokuje", () => {
        expect(hasPostedOn([entry("2026-08-29T04:23:00.000Z")], DID, date)).toBe(false);
    });

    it("Ignoruje cizí posty ve feedu", () => {
        expect(hasPostedOn([entry("2026-08-30T05:22:05.304Z", "did:plc:someone")], DID, date)).toBe(false);
    });

    it("Půlnoc počítá podle pražského času, ne UTC", () => {
        // 2026-08-30T22:30Z je v Praze už 31. 8. 00:30 (CEST, UTC+2)
        expect(hasPostedOn([entry("2026-08-30T22:30:00.000Z")], DID, date)).toBe(false);
    });
});
