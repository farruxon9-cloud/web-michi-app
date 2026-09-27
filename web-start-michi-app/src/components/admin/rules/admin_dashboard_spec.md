# Admin Dashboard Specification

## Layout Geometry & Positioning
- **Header Action Bar**: `display: flex`, `justify-content: space-between`, `margin-bottom: 24px`.
- **Metric Card**: Icon box `width: 48px`, `height: 48px`, `border-radius: 12px`, background `rgba(255, 255, 255, 0.08)`.
- **User Row Actions**: Flex end container with `gap: 8px`.

## Button & Event Rules
- **Approve Company Listing**: Updates company status to `verified: true`.
- **Ban / Suspend Account**: Triggers confirmation dialog before revoking access.
- **Export CSV Data**: Exports current table records to `.csv` file.
