# Adding or Changing an Editor Option

`src/core/schema/options.js` is the source of truth for options, but **three coordinated spots
must agree** or the option silently breaks (won't reset, throws on reset, or is dropped entirely).
Whenever you add, rename, or change the semantics of an option, check all three:

1. **`resetOptions` handling** — for a resettable option, apply it in `OptionProvider.reset()`
   (`src/core/config/optionProvider.js`) so `editor.resetOptions({ ... })` actually takes effect.
   Mirror the `if (diff.has('placeholder')) { ... }` pattern; **per-frame** options go inside the
   per-root loop. Skip this only for `'fixed'` (immutable) options.

2. **`OPTION_FIXED_FLAG`** (same file) — register the key here for **global** options.

3. **`OPTION_FRAME_FIXED_FLAG`** (same file) — register the key here for **per-frame** options
   (e.g. `placeholder`, `placeholder_line`). Pick exactly one of map 2 or 3, never both.

   Flag value: `'fixed'` = immutable after create (`resetOptions` warns and skips it) ·
   `true` = resettable. A key in **neither** map is ignored by `resetOptions` completely.

Also declare the type: add/update the `@property` in the right typedef — `EditorInitOptions`
core block for global, the frame-level block (with `value` / `placeholder`) for per-frame. Never
inside the auto-generated plugin-options marker.

After editing: `npm run ts-build` (regenerates `types/`). If the typedef marker changed,
`npm run check:inject`.
