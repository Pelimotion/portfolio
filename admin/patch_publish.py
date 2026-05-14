import re
from pathlib import Path

# --- patch index.html modal ---
idx_path = Path('/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/admin/index.html')
idx = idx_path.read_text(encoding='utf-8')

# change modal to local deploy modal
new_modal = """<!-- PUBLISH MODAL -->
<div class="modal-bg" id="publish-modal">
  <div class="modal-card">
    <div class="auth-badge">Local Deploy</div>
    <div class="modal-title">Apply & Deploy</div>
    <div class="modal-sub" style="font-size:12px; line-height:1.6">You are editing locally. Clicking apply will download the updated JSON file. You must then run your deployment script (<code>./watch_and_deploy.sh</code>) to push to Vercel.</div>
    <div class="modal-actions" style="margin-top:20px;">
      <button class="btn primary" id="publish-btn" onclick="doPublish()">💾 Download & Save</button>
      <button class="btn" onclick="closePublishModal()">Cancel</button>
    </div>
  </div>
</div>"""

idx = re.sub(r'<!-- PUBLISH MODAL -->.*?</div>\s*</div>', new_modal, idx, flags=re.DOTALL)
idx_path.write_text(idx, encoding='utf-8')


# --- patch admin.js doPublish ---
js_path = Path('/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/admin/admin.js')
js = js_path.read_text(encoding='utf-8')

new_dopublish = """function openPublishModal() {
  autoSave();
  document.getElementById('publish-modal').classList.add('open');
}

function closePublishModal() {
  document.getElementById('publish-modal').classList.remove('open');
}

async function doPublish() {
  autoSave();
  exportJSON();
  closePublishModal();
  hasUnsaved = false;
  document.getElementById('unsaved-label').classList.remove('visible');
  toast('✓ Saved! Now run ./watch_and_deploy.sh in your terminal.');
}

// ─── Export / Import ──────────────────────────────────────────────────────"""

js = re.sub(r'function openPublishModal\(\) \{.*?(?=// ─── Export / Import ──────────────────────────────────────────────────────)', new_dopublish, js, flags=re.DOTALL)
js_path.write_text(js, encoding='utf-8')
print("Patched index.html and admin.js successfully.")
