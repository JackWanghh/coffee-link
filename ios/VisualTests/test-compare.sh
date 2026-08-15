#!/bin/sh
set -eu
export LC_ALL=C
export LANG=C

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
comparison_script="$script_directory/compare.swift"
fixture_source="$script_directory/Captures/01-home.png"
temporary_directory=$(mktemp -d /private/tmp/coffeelink-compare-self-test.XXXXXX)
module_cache=$(mktemp -d /private/tmp/coffeelink-compare-module-cache.XXXXXX)

cleanup() {
  rm -rf "$temporary_directory" "$module_cache"
}
trap cleanup EXIT HUP INT TERM

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

run_compare() {
  xcrun swift -module-cache-path "$module_cache" "$comparison_script" "$@"
}

test -f "$fixture_source" || fail "fixture is missing: $fixture_source"
sips -z 9 7 "$fixture_source" --out "$temporary_directory/small.png" >/dev/null
sips -z 8 7 "$fixture_source" --out "$temporary_directory/wrong-size.png" >/dev/null
printf 'this is not an image\n' >"$temporary_directory/corrupt.png"
printf 'P3\n1 1\n255\n100 100 100\n' >"$temporary_directory/threshold-base.ppm"
printf 'P3\n1 1\n255\n112 100 100\n' >"$temporary_directory/threshold-within.ppm"
printf 'P3\n1 1\n255\n113 100 100\n' >"$temporary_directory/threshold-beyond.ppm"

results_root="$temporary_directory/Results"
same_stdout="$temporary_directory/same.stdout"
run_compare \
  "$temporary_directory/small.png" \
  "$temporary_directory/small.png" \
  same \
  "$results_root" >"$same_stdout"

expected_same_output='different_pixels=0
total_pixels=63
difference_ratio=0'
test "$(cat "$same_stdout")" = "$expected_same_output" || fail "same-image metrics are incorrect"
test "$(cat "$results_root/same/metrics.txt")" = "$expected_same_output" || fail "metrics.txt differs from stdout"

for artifact in overlay.png difference.png; do
  test -f "$results_root/same/$artifact" || fail "$artifact was not created"
  width=$(sips -g pixelWidth "$results_root/same/$artifact" | awk '/pixelWidth/ {print $2}')
  height=$(sips -g pixelHeight "$results_root/same/$artifact" | awk '/pixelHeight/ {print $2}')
  test "$width" = "7" || fail "$artifact width is $width, expected 7"
  test "$height" = "9" || fail "$artifact height is $height, expected 9"
done

if run_compare \
  "$temporary_directory/small.png" \
  "$temporary_directory/wrong-size.png" \
  wrong-size \
  "$results_root" >"$temporary_directory/wrong-size.stdout" 2>"$temporary_directory/wrong-size.stderr"; then
  fail "dimension mismatch unexpectedly succeeded"
fi
grep -q 'dimension mismatch' "$temporary_directory/wrong-size.stderr" || fail "dimension mismatch error is unclear"

if run_compare \
  "$temporary_directory/small.png" \
  "$temporary_directory/corrupt.png" \
  corrupt \
  "$results_root" >"$temporary_directory/corrupt.stdout" 2>"$temporary_directory/corrupt.stderr"; then
  fail "corrupt input unexpectedly succeeded"
fi
grep -q 'unable to decode image' "$temporary_directory/corrupt.stderr" || fail "corrupt-image error is unclear"

if run_compare \
  "$temporary_directory/missing.png" \
  "$temporary_directory/small.png" \
  missing \
  "$results_root" >"$temporary_directory/missing.stdout" 2>"$temporary_directory/missing.stderr"; then
  fail "missing input unexpectedly succeeded"
fi
grep -q 'image not found' "$temporary_directory/missing.stderr" || fail "missing-image error is unclear"

within_stdout=$(run_compare \
  "$temporary_directory/threshold-base.ppm" \
  "$temporary_directory/threshold-within.ppm" \
  threshold-within \
  "$results_root")
beyond_stdout=$(run_compare \
  "$temporary_directory/threshold-base.ppm" \
  "$temporary_directory/threshold-beyond.ppm" \
  threshold-beyond \
  "$results_root")
printf '%s\n' "$within_stdout" | grep -q '^different_pixels=0$' || fail "delta 12 should be equal"
printf '%s\n' "$beyond_stdout" | grep -q '^different_pixels=1$' || fail "delta 13 should be different"
printf '%s\n' "$beyond_stdout" | grep -q '^difference_ratio=1$' || fail "ratio 1 formatting is incorrect"

first_checksums=$(shasum -a 256 \
  "$results_root/same/overlay.png" \
  "$results_root/same/difference.png" \
  "$results_root/same/metrics.txt")
run_compare \
  "$temporary_directory/small.png" \
  "$temporary_directory/small.png" \
  same \
  "$results_root" >"$temporary_directory/same-second.stdout"
second_checksums=$(shasum -a 256 \
  "$results_root/same/overlay.png" \
  "$results_root/same/difference.png" \
  "$results_root/same/metrics.txt")

test "$first_checksums" = "$second_checksums" || fail "repeated output is not deterministic"
test "$(cat "$temporary_directory/same-second.stdout")" = "$expected_same_output" || fail "repeated stdout changed"

echo "PASS: same-image ratio is zero"
echo "PASS: missing, corrupt, and dimension-mismatch inputs fail"
echo "PASS: RGB delta threshold is inclusive through 12"
echo "PASS: PNG output dimensions are preserved"
echo "PASS: repeated outputs are deterministic"
