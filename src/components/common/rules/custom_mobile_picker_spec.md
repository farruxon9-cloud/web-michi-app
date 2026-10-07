# Custom Mobile Picker Specification

## Layout Geometry & Positioning
- **Sheet Drag Handle**: Centered top bar `width: 36px`, `height: 5px`, `border-radius: 3px`, background `rgba(255, 255, 255, 0.2)`.
- **Search Header Input**: `height: 44px`, `border-radius: 12px`, `padding: 0 14px`, `margin: 12px 16px`.
- **Option Item**: `height: 50px`, `padding: 0 20px`, `display: flex`, `align-items: center`, `justify-content: space-between`.

## Button & Event Rules
- **Select Option**: Passes selected value to `onChange(val)` and closes sheet.
- **Clear Search Input**: Resets filter text query.
