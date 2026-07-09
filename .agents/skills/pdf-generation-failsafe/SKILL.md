---
name: pdf-generation-failsafe
description: Guidelines for generating fail-safe PDFs in browser, memory optimization, local font loading, and popup handling.
---

# PDF Generation Failsafe Skill

This skill guarantees stable PDF compilation and download cycles.

## 1. Local Font Dependencies
- Always fetch fonts locally to avoid slow network/CDN blocking issues (e.g. `/SawarabiGothic-Regular.ttf` in our public directory).
- Check that `pdfMake.vfs` contains the base64 conversion before initiating `pdfMake.createPdf()`.

## 2. Popup Blocker Handling
- In modern browsers, opening a PDF blob in a new tab via `window.open` can be blocked.
- Always provide a direct fallback download button: `pdf.download(filename)` as it bypasses pop-up restrictions.

## 3. Base64 Asset Conversion
- Convert all external profile image URLs to base64 synchronously or asynchronously before compiling the PDF doc definition, preventing canvas blank issues.
