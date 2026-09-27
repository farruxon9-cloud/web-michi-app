# Resume PDF Preview Specification

## Layout Geometry & Positioning
- **Preview Canvas Container**: Standard JIS A4 paper representation (`width: 100%`, `max-width: 595px`, `aspect-ratio: 1 / 1.414`).
- **Paper Shadow & Border**: `box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4)`, `background: #ffffff` (white Japanese Rirekisho sheet).

## Button & Event Rules
- **Download PDF Button**: Generates A4 PDF binary via canvas html2canvas / jsPDF pipeline and prompts file save `rirekisho.pdf`.
- **Print Button**: Triggers `window.print()` print dialog targeted strictly at `.rirekisho-paper-container`.
