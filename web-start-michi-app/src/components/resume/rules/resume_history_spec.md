# Resume History Section Specification

## Layout Geometry & Positioning
- **Timeline Row Item**: `display: flex`, `gap: 12px`, `align-items: center`, `margin-bottom: 12px`.
- **Year Input**: `width: 90px`, `height: 44px`, `border-radius: 10px`.
- **Month Input**: `width: 70px`, `height: 44px`, `border-radius: 10px`.
- **School / Company Description**: `flex: 1`, `height: 44px`.

## Button & Event Rules
- **Add Entry Button**: Appends new blank row to `educationHistory` or `workHistory` state array.
- **Delete Entry Button**: Removes selected row by index without disturbing surrounding items.
- **Status Toggle**: Options `Nyuugaku` (Enrolled), `Sotsugyou` (Graduated), `Nyousha` (Joined Company), `Taisha` (Left Company).
