### fix

- Fixed the selected file name not showing in the file input when `createUrlInput: false` (#1726, `image`, `video`, `audio`)
- Fixed `image: { createUrlInput: false }` being ignored when `createFileInput` is left at its default (#1726, `image`)
- Fixed an error when opening the audio edit modal with `createUrlInput: false` (`audio`)
- Fixed Markdown loose lists (items separated by blank lines) losing their blank lines in a round trip (#1724, `helper/markdown`)
- Fixed an ordered list not starting at 1 splitting a Markdown paragraph (#1724, `helper/markdown`)
