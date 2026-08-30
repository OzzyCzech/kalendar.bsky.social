# Kalendář na Bluesky

[![Tests](https://github.com/OzzyCzech/kalendar.bsky.social/actions/workflows/tests.yml/badge.svg)](https://github.com/OzzyCzech/kalendar.bsky.social/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Každý den koukám do kalendáře, abych Vám připomněl svátky a ostatní důležité události.
Všechna zjištění posílám na [Bluesky](https://bsky.app/profile/kalendar.bsky.social).

Bot je malý Node skript bez databáze a bez stavu. Jednou denně se probudí, poskládá
text z několika knihoven a odešle ho. Nic si nepamatuje — den, o kterém píše, je
vždycky „dnes“.

## Co bot posílá

```
Dobré ráno, je pátek, 28. srpen 2026:

Svátek má Augustýn

🦸 Den čtení komiksů na veřejnosti
🦇 Evropská noc pro netopýry
🌼 Národní den narcisů
```

Post se skládá z těchto částí — každou dodává jeden modul v `src/`:

| Část | Modul | Příklad |
|---|---|---|
| Oslovení a datum | `daily.js` | `Dobré ráno, je pátek, 28. srpen 2026:` |
| Jmeniny | `get-name-day-text.js` | `Svátek mají Václav a Václava` |
| Pašijový týden | `get-holy-week-name.js` | ` (✝ Škaredá středa)` |
| Státní svátek | `get-holiday-text.js` | `St. Svátek 🇨🇿 Den české státnosti` |
| Významný den | `get-significant-day-text.js` | `Den památky Jana Palacha (1969)` |
| Mezinárodní dny | `get-international-day-text.js` | `🦇 Evropská noc pro netopýry` |
| Otevírací doba obchodů | `get-shopping-alert.js` | `🚨 Zítra je státní svátek a budou zavřené obchody!!!` |

## Jak vzniká text

Bluesky má tvrdý limit **300 grafémů** (ne bajtů a ne znaků — proto
`Intl.Segmenter`, aby emoji a diakritika počítaly za jedna). Delší post by API
odmítlo, takže `daily.js` hospodaří s rozpočtem podle priorit:

1. **Vždy se vejde** — oslovení, jmeniny, pašijový týden, státní svátek.
2. **Rezervuje se místo** pro nákupní hlášku, i když se přidává až na konec.
3. **Významný den** se přidá jen celý; když se nevejde, vypadne úplně.
4. **Mezinárodní dny** se přidávají po jednom, dokud je místo. U prvního, který
   se nevejde, se končí.

Díky tomu se nikdy neuřízne půlka slova a to podstatné zůstane i ve dnech, kdy se
sejde svátek s pěti mezinárodními dny.

## Jak se to spouští

Každý den v **6:00 (Europe/Prague)** zavolá [cron-job.org](https://console.cron-job.org/jobs)
GitHub API, které spustí workflow [`.github/workflows/cron.yml`](.github/workflows/cron.yml).

```
cron-job.org  ──POST──>  GitHub API  ──>  workflow  ──>  Bluesky
```

### Proč ne `schedule:` v GitHub Actions

Používalo se, ale od 27. 8. 2026 chodily běhy se zpožděním **6–11 hodin** — ranní post
tak vycházel odpoledne. GitHub to má zdokumentované: plánované běhy se pod zátěží
odkládají a mohou se i zahodit. Posun na jinou minutu v hodině nepomohl. Proto
`cron.yml` reaguje **jen na `workflow_dispatch`** a plánování je venku.

Neber `schedule:` zpátky — vrátila by se ta zpoždění i duplicitní posty.

### Nastavení jobu v cron-job.org

| Položka | Hodnota |
|---|---|
| URL | `https://api.github.com/repos/OzzyCzech/kalendar.bsky.social/actions/workflows/cron.yml/dispatches` |
| Metoda | `POST` |
| Plán | `0 6 * * *`, zóna `Europe/Prague` |
| Body | `{"ref":"main"}` |
| `Accept` | `application/vnd.github+json` |
| `Content-Type` | `application/json` |
| `X-GitHub-Api-Version` | `2022-11-28` |
| `Authorization` | `Bearer <token>` |

Úspěch je **HTTP 204 No Content** (dispatch nevrací tělo). `401` = špatný token,
`404` = token nemá přístup k repozitáři.

> [!WARNING]
> **TEST RUN v cron-job.org publikuje doopravdy.** Body neobsahuje `dry_run`,
> takže platí default `false`. Druhé spuštění téhož dne sice zastaví kontrola
> duplicity níže, ale to první post pošle.

### Token

Fine-grained PAT: *Only select repositories* → `kalendar.bsky.social`,
oprávnění **Actions: Read and write** (nic víc není potřeba).

> [!IMPORTANT]
> Až token vyprší, posty **tiše přestanou chodit** — v repozitáři nebude žádná
> chyba, protože se workflow vůbec nespustí. Selhání hlásí cron-job.org e-mailem
> (job má zapnuté „notify on failure“), jinak se to pozná jen podle prázdného feedu.

Heslo k Bluesky je v GitHub secrets jako `CALENDAR_APP_PASSWORD`.

### Ruční spuštění

```bash
gh workflow run cron.yml --ref main                 # ostrý post
gh workflow run cron.yml --ref main -f dry_run=true # jen vypíše text, nepublikuje
```

### Ochrana proti duplicitě

Publikace není idempotentní, a workflow se dá spustit vícekrát denně. Proto se
[`src/daily.js`](src/daily.js) před odesláním podívá přes `getAuthorFeed`, jestli
už dnešní post existuje, a pokud ano, skončí bez publikace. Den se počítá podle
pražské půlnoci — viz [`src/has-posted-on.js`](src/has-posted-on.js).

## Lokálně

```bash
pnpm install
pnpm test
pnpm post   # načte .env a odešle
```

Zkopíruj `example.env` do `.env` (je v `.gitignore`, nikdy ho necommituj) a vyplň
app password z [Bluesky → Settings → App Passwords](https://bsky.app/settings/app-passwords)
— ne hlavní heslo k účtu.

| Proměnná | Význam |
|---|---|
| `CALENDAR_APP_HANDLE` | handle účtu, např. `kalendar.bsky.social` |
| `CALENDAR_APP_PASSWORD` | app password z Bluesky |
| `DRY_RUN` | neprázdná hodnota = jen vypsat text, nepublikovat |

> [!CAUTION]
> `DRY_RUN` se testuje na pravdivost (`if (process.env.DRY_RUN)`), takže **jakákoli
> neprázdná hodnota dry run zapne — včetně `DRY_RUN=false`**. Chceš-li publikovat,
> nech řádek prázdný nebo ho z `.env` úplně smaž.

Bluesky pouští jen **10 pokusů o přihlášení denně**. Když se objeví
`XRPCError: Invalid identifier or password`, neopakuj to dokola — vygeneruj nové
app password.

### Zkoušení jiného data

V `daily.js` je na to připravený zakomentovaný řádek hned pod výpočtem `date`:

```js
date = DateTime.fromFormat("2025-04-20", "yyyy-MM-dd");
```

Hodí se na Velikonoce, Štědrý den nebo dny před svátkem, kdy se chová nákupní
hláška jinak. Nezapomeň ho zase zakomentovat.

## Struktura

```
src/
  daily.js                       vstupní bod – poskládá text a odešle ho
  get-name-day-text.js           jmeniny
  get-holy-week-name.js          dny pašijového týdne
  get-holiday-text.js            státní svátky
  get-significant-day-text.js    významné dny
  get-international-day-text.js  mezinárodní dny
  get-shopping-alert.js          otevírací doba obchodů o svátcích
  has-posted-on.js               kontrola, že dnešní post ještě není venku
tests/
  nameday.test.js
  velikonoce.test.js
  duplicate.test.js
.github/workflows/
  cron.yml                       denní post (workflow_dispatch)
  tests.yml                      testy při každém pushi
```

Moduly `get-*.js` jsou čisté funkce: berou `DateTime` a vracejí řetězec (prázdný,
když se jich den netýká). Díky tomu jdou testovat bez sítě a bez přihlášení.

## Testy

```bash
pnpm test              # watch režim
pnpm exec vitest run   # jednorázově
```

Testy pokrývají tu část, kde se dá nejsnáz udělat chyba: pašijový týden (pohyblivé
datum odvozené od Velikonoc), skloňování u jmenin (`má` / `mají`, `a` / čárka) a
kontrolu duplicity včetně toho, že se půlnoc počítá podle Prahy, ne podle UTC.

## Použité knihovny

- 🗓️ [holidays-cs](https://github.com/OzzyCzech/holidays-cs/) — státní svátky,
  významné dny, Velikonoce a otevírací doba obchodů
- 🗓️ [namedays-cs](https://github.com/OzzyCzech/namedays-cs) — jmeniny
- 🗓️ [international-days-cs](https://github.com/OzzyCzech/international-days-cs) — mezinárodní dny
- 🦋 [@atproto/api](https://github.com/bluesky-social/atproto) — klient Bluesky
- ⏱️ [luxon](https://moment.github.io/luxon/) — práce s datem a časovými zónami

Velikonoce počítá [easter-date](https://github.com/OzzyCzech/easter-date/), které
se sem dostane přes `holidays-cs`.

## Licence

[MIT](./LICENSE)
