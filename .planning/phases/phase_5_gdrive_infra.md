# Plan: Phase 5 — GDrive Infrastructure

**Goal:** Establish the foundation for Google Drive communication and data persistence.

## 1. OAuth Configuration (Plan 5.1)
- [ ] Research the best OAuth flow for this "Vanilla-ish" React app.
- [ ] Define the necessary Google API Scopes (`https://www.googleapis.com/auth/drive.metadata.readonly`).
- [ ] Setup a placeholder for Client ID in `.env`.

## 2. Storage Provider Logic (Plan 5.2)
- [ ] Implement `src/core/storage/storageProvider.js`.
- [ ] Add `listFolders(parentId)` method using `fetch` to Google API.
- [ ] Implement a recursive `crawlProject(rootId)` method for full indexing.

## 3. Database Sync (Plan 5.3)
- [ ] Update `src/services/storageService.js` with `syncFolders(connectionId, gdriveData)`.
- [ ] Ensure the `storage_folders` table correctly handles the hierarchical path.

## 4. Verification
- [ ] Test the API call with a mock token.
- [ ] Verify that folders are correctly saved to Supabase.
