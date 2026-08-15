# Visual comparison tool

Run the comparison from the repository root:

```bash
xcrun swift -module-cache-path /private/tmp/coffeelink-compare-module-cache \
  ios/VisualTests/compare.swift \
  ios/VisualTests/References/01-home.png \
  ios/VisualTests/Captures/01-home.png \
  01-home
```

The reference and capture must decode successfully and have identical pixel dimensions. Both inputs are rendered to 8-bit sRGB RGBA on a transparent backing before comparison. A pixel is different only when its largest RGB channel delta is greater than 12.

Successful runs print exactly three lines to standard output and write these files under `ios/VisualTests/Results/<name>/`:

- `overlay.png`: the capture drawn over the reference at 50% alpha.
- `difference.png`: absolute RGB channel differences.
- `metrics.txt`: the same three metrics printed to standard output.

An optional fourth argument changes the `Results` root. This is useful for isolated test output:

```bash
xcrun swift -module-cache-path /private/tmp/coffeelink-compare-module-cache \
  ios/VisualTests/compare.swift reference.png capture.png sample /private/tmp/Results
```

Run the executable self-test with:

```bash
ios/VisualTests/test-compare.sh
```
