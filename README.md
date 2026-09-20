# Instagram follow checker

A simple, local tool to see who you follow on Instagram who does not follow you back.

## Use

1. Download your Instagram followers and following export with the **All time** date range.
2. Open `index.html` in a current browser.
3. Select all ZIPs from the same account and export, or drop them onto the page. There is no fixed file-count limit.
4. Search the results and open profile links.

Extracted follower and following JSON or HTML files also work. Files are processed on your device; there is no server, login, upload, analytics, or saved history. No installation or internet connection is needed to compare files. Profile links open Instagram.

## Details and limits

- Reads ZIPs one at a time and ignores unrelated media and messages.
- Combines numbered follower files and deduplicates usernames.
- Supports stored and deflated ZIP entries, including ZIP64.
- Stops the comparison if a selected archive or matching data file cannot be read.
- Results reflect the export, not the live account. Missing export parts can produce incomplete results.
- True split archives (`.z01`, `.z02`, etc.) must be extracted together first.
- A ZIP file index or an individual extracted data file may be up to 128 MB. Large account lists also depend on available browser memory.

## Checks

Requires Python 3 and Node.js 22 or later:

```sh
python3 tests/make-fixtures.py
node tests/test-checker.cjs
```

Fixtures are synthetic and excluded from Git. Checks cover a 34-ZIP batch, duplicates, ZIP64, malformed files, checksums, cancellation, and missing lists. The test harness mocks the DOM and HTML anchor parser; it does not replace browser UI testing.
