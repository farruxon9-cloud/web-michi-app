---
name: asset-and-media-optimization
description: Guidelines for compressing assets, loading images lazily, and leveraging modern formats like WebP and SVG.
---

# Asset and Media Optimization Skill

This skill governs optimization techniques for loading images, icons, and static documents.

## 1. Image Lazy Loading
- Always use the `loading="lazy"` attribute for user-submitted images, company logos, and driver feed thumbnails.
- Specify fixed dimensions (`width` and `height`) on images to prevent Cumulative Layout Shifts (CLS) during page rendering.

## 2. Format Selection
- Prefer lightweight vector graphic files (`.svg`) for UI icons, system illustrations, and brand decoration elements.
- Compress raw raster images (like `.png`, `.jpg`) into the `.webp` format to reduce payload size by up to 70%.
