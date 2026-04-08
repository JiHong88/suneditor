### change

* Default `delayTime` for the mention plugin changed from `200` to `120`
* The toolbar `selectAll` button now selects the entire editor content immediately instead of stepping through scopes (keyboard Ctrl+A still uses scope stepping)

### Enhancement

* Browser search now queries all folders instead of only the currently selected folder
* Browser search results now highlight matching keywords in file names
* A clear button has been added to the browser search form to reset the search
* An `expand` option has been added to the file browser to control initial folder expand depth (default: `1`)

### Bugfix

* Fixed a bug where switching folders in the file browser did not update the item list and tags, causing search and tag filters to operate on stale data
