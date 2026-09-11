CREATE TABLE project_drive_slots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  slot_key      TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  slot_type     TEXT NOT NULL CHECK (slot_type IN ('folder', 'file')),
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, slot_key)
);

ALTER TABLE project_drive_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all_pds" ON project_drive_slots FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE drive_slot_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id       UUID NOT NULL REFERENCES project_drive_slots(id) ON DELETE CASCADE,
  page_id       UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  drive_url     TEXT,
  drive_file_id TEXT,
  drive_name    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(slot_id, page_id)
);

ALTER TABLE drive_slot_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all_dsl" ON drive_slot_links FOR ALL USING (auth.role() = 'authenticated');
