# Kalendář na Blusky

Každý den koukám do kalendář, abych Vám připomněl svátky a ostatní důležité události.
Všechna zjištění posílám na [Bluesky](https://bsky.app/profile/kalendar.bsky.social).

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

### Lokálně

Zkopíruj `example.env` do `.env` (je v `.gitignore`, nikdy ho necommituj) a vyplň
app password z [Bluesky → Settings → App Passwords](https://bsky.app/settings/app-passwords)
— ne hlavní heslo k účtu.

```bash
pnpm post   # načte .env a odešle
pnpm test
```

> [!CAUTION]
> `DRY_RUN` se testuje na pravdivost (`if (process.env.DRY_RUN)`), takže **jakákoli
> neprázdná hodnota dry run zapne — včetně `DRY_RUN=false`**. Chceš-li publikovat,
> nech řádek prázdný nebo ho z `.env` úplně smaž.

Bluesky pouští jen **10 pokusů o přihlášení denně**. Když se objeví
`XRPCError: Invalid identifier or password`, neopakuj to dokola — vygeneruj nové
app password.

### Ochrana proti duplicitě

Publikace není idempotentní, a workflow se dá spustit vícekrát denně. Proto se
[`src/daily.js`](src/daily.js) před odesláním podívá přes `getAuthorFeed`, jestli
už dnešní post existuje, a pokud ano, skončí bez publikace. Den se počítá podle
pražské půlnoci — viz [`src/has-posted-on.js`](src/has-posted-on.js).

## Použité knihovny

- 🗓️ [holidays-cs](https://github.com/OzzyCzech/holidays-cs/)
- 🗓️ [easter-date](https://github.com/OzzyCzech/easter-date/)
- 🗓️ [namedays-cs](https://github.com/OzzyCzech/namedays-cs)

## Licence

[MIT](./LICENSE)