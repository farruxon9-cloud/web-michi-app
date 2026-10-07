# Japanese Zipcode Lookup Specification

## Lookup Data Format
- Input: 7-digit string (e.g. `1000001`).
- Output: `{ prefecture: "東京都", city: "千代田区", town: "千代田" }`.
- Cache: In-memory hash map lookup for 124,000 Japanese postal codes.
