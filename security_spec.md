# Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Owner-Only Mutations:** Only the verified owner account (`sbmc.3925@gmail.com` with `email_verified == true`, or verified admin UID `ngH4tKvzVDee0eI0IvTnC6mwSnS2`) can create, update, or delete documents in `/portfolio/{docId}`, `/siteSettings/{docId}`, `/projects/{projectId}`, `/siteVersions/{versionId}`, and `/admins/{userId}`.
2. **Public Read Isolation:**
   - `/portfolio/published`, `/portfolio/design_published`, and `/siteSettings/published` are publicly readable via `get`.
   - `/portfolio/draft` and `/siteSettings/draft` are readable ONLY by the verified owner (`isAdmin()`).
   - `/projects/{projectId}` and `/works/{workId}` are publicly readable (`get` and `list`) when `resource.data.status == 'published'` or by `isAdmin()`.
   - `/siteVersions/{versionId}` and `/leads/{leadId}` are readable ONLY by `isAdmin()`.
3. **Path & Payload Boundaries:** All document IDs must match `^[a-zA-Z0-9_\-]+$` with length `<= 128`, and all incoming fields are validated for type and length bounds.

## 2. The "Dirty Dozen" Payloads
1. **Unverified Email Spoof:** Authenticated user with `email: "sbmc.3925@gmail.com"` and `email_verified: false` attempting to write `/siteSettings/published`. -> `PERMISSION_DENIED`
2. **Non-Owner Write to `siteSettings`:** Authenticated user `intruder@example.com` attempting to update `/siteSettings/published`. -> `PERMISSION_DENIED`
3. **Anonymous Draft Read:** Unauthenticated user attempting `get` on `/siteSettings/draft`. -> `PERMISSION_DENIED`
4. **Anonymous Version History Read:** Unauthenticated user attempting `list` on `/siteVersions`. -> `PERMISSION_DENIED`
5. **Non-Owner Project Delete:** Authenticated non-owner attempting `delete` on `/projects/proj-1`. -> `PERMISSION_DENIED`
6. **Shadow Field Injection on Lead Create:** Unauthenticated user submitting `/leads/lead-1` with `{ name: "Test", email: "a@b.com", message: "Hello world", isAdmin: true }`. -> `PERMISSION_DENIED`
7. **Oversized Message on Lead Create:** Unauthenticated user submitting `/leads/lead-2` with `message` > 3000 chars. -> `PERMISSION_DENIED`
8. **Invalid Category on Project Write:** Owner writing `/projects/proj-1` with `category: "hacked"`. -> `PERMISSION_DENIED`
9. **ID Poisoning on Project Write:** Writing to `/projects/invalid$id!`. -> `PERMISSION_DENIED`
10. **PII Leak on Leads List:** Unauthenticated or non-owner user attempting `list` on `/leads`. -> `PERMISSION_DENIED`
11. **Draft Project Public Read:** Unauthenticated user attempting `get` on `/projects/draft-1` where `status == 'draft'`. -> `PERMISSION_DENIED`
12. **Privilege Escalation on `/admins`:** Non-owner attempting `create` on `/admins/someUid`. -> `PERMISSION_DENIED`
