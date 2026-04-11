### Breaking Changes

- Default `delayTime` for the mention plugin changed from `200` to `120`
- The toolbar `selectAll` button now selects the entire editor content immediately instead of stepping through scopes (keyboard Ctrl+A still uses scope stepping)

### Enhancement

- Improved browser search to query all folders instead of only the currently selected folder
- Added keyword highlighting to browser search results for matching file names
- Added a clear button to the browser search form to reset the search
- An `expand` option has been added to the file browser to control initial folder expand depth (default: `1`)

### Bugfix

- Fixed a bug where switching folders in the file browser did not update the item list and tags, causing search and tag filters to operate on stale data
- Fixed iframe mode not working in Firefox — content was empty and buttons non-functional due to Firefox firing double `load` events for sandboxed iframes (`editor.js`, `constructor.js`)
