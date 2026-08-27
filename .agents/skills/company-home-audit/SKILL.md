---
name: company-home-audit
description: Dedicated Page Skill for MichiApp Company Home & Enterprise Dashboard. Covers enterprise applicant tracking, contract status badges, driver fleet overview, and recruitment management.
---

# 🏢 Company Home & Enterprise Audit Skill (`company-home-audit`)

This skill defines the complete visual structure, applicant management, contract badges, and button interactions for **Company Home (企業マイページ)**.

## 📐 1. Visual Layout Standards
- **Enterprise Header Banner:** `.company-banner { border-radius: 24px; padding: 20px; margin-bottom: 16px; }`.
- **Applicant Cards:** `.applicant-card { border-radius: 20px; border: 1px solid var(--glass-border); padding: 16px; margin-bottom: 14px; }`.
- **Contract Badges:** `.status-badge.active` (Green), `.status-badge.inactive` (Gray).

## 🔘 2. Button & Action Registry
- **Accept Applicant Button (`onAcceptEmployeeRequest`):** Confirms driver connection to company fleet.
- **Post New Job Listing Button (`handleCreateJob`):** Opens enterprise job creation form.
- **Edit Company Profile (`handleOpenCompanyEdit`):** Updates enterprise info, logo, and contract status.
