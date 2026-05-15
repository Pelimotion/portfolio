# Requirements: Google Drive Integration & Automation

## 1. Overview
The goal is to automate the asset management workflow by integrating Google Drive directly into the Pelimotion OS. Users should be able to browse their project's cloud directory structure and link specific folders to scenes without manual URL pasting.

## 2. User Stories
- **As a Producer**, I want to connect my Google Drive project folder once so the system knows where to look for assets.
- **As a Creative**, I want to see a list of subfolders (renders, project files) and select them from a tree view.
- **As a Motion Designer**, I want the system to automatically suggest linking a folder to a scene if the names match.

## 3. Technical Requirements

### 3.1 Infrastructure
- **Provider API:** Integration with Google Drive API v3.
- **Auth Flow:** OAuth 2.0 (User-level or Service Account depending on privacy needs).
- **Indexing:** A mechanism to crawl and cache the folder structure starting from the `root_folder_id`.
- **Database:** Support for `storage_folders` table to store the indexed tree.

### 3.2 UI/UX
- **Directory Explorer:** A React component that renders a hierarchical view of folders.
- **Breadcrumbs:** Navigation aid for deep folder structures.
- **Loading States:** Clear feedback while fetching data from the Drive API.
- **Error Handling:** Robust handling of revoked permissions or missing folders.

### 3.3 Automation
- **Fuzzy Matching:** Logic to correlate scene titles (e.g., "Scene 01") with folder names (e.g., "01_renders").
- **Real-time Sync:** Option to refresh the directory cache on demand.

## 4. Success Criteria
- [ ] Successful OAuth connection to Google Drive.
- [ ] Folder tree renders correctly in the `AssetsPanel`.
- [ ] Linking a folder to a scene can be done via selection, not typing.
- [ ] No hardcoded URLs required for scene-to-folder mapping.
