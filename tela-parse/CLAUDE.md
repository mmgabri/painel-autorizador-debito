# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`tela-parse/` is a **standalone single-file tool**: `iso8583-parser.html`. No build step, no dependencies, no framework. Open directly in a browser.

## Architecture

Everything lives in one file with three sections:

1. **`DE_MAP`** — a plain JS object mapping DE number → `{name, icon, type, maxLen, fixed}`. This is the source of truth for field metadata. `fixed: true` means fixed-length; absence means variable-length.

2. **Parser (`parseISO`)** — accepts two input formats:
   - `DE2:value DE3:value ...` (primary format, regex-driven)
   - `field=value` or `field:value` space-separated pairs (fallback)
   - MTI prefix (e.g. `0200`) is accepted but ignored — only DE key/value pairs are extracted.

3. **Renderer (`renderFields`)** — builds card HTML directly via string concatenation into `#results`. Two layout modes: `list` (default) and `grid`, toggled via `view` state. Cards are re-rendered from scratch on each `setView` call.

## Key behaviors

- **Bitmap section** (`renderBitmap`) visualizes DE 1–64 presence; it is purely cosmetic and derived from the parsed `fields` object.
- **Inline editing**: each rendered card contains an `<input>` whose `oninput` handler updates `fields[de]` and refreshes the length badge/overflow styling in place — without re-rendering the full list.
- **Overflow detection**: a field is "over" when `val.length > info.maxLen` (only checked when `maxLen < 999`; `999` is the sentinel for "unbounded").
- **`esc()`** is the only XSS mitigation — applied to values injected into `innerHTML` as `value="..."` attributes.

## Extending DE_MAP

To add or correct a field definition, add an entry to `DE_MAP` at the top of the `<script>` block:

```js
42: {name:"Card Acceptor ID Code", icon:"🏷️", type:"ANS", maxLen:15, fixed:true},
```

Missing DEs fall back to `{name:'DE N', icon:'🔳', type:'AN', maxLen:999}`.
