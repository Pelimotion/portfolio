import re

filepath = "/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/admin/admin.js"
with open(filepath, "r", encoding="utf-8") as f:
    js = f.read()

auth_logic = """
// ─── GitHub API Auth ──────────────────────────────────────────────────────
const REPO = 'Pelimotion/portfolio';
let githubToken = localStorage.getItem('ghToken');

function checkAuth() {
  const overlay = document.getElementById('login-overlay');
  if(githubToken) {
    if(overlay) overlay.style.display = 'none';
    return true;
  }
  if(overlay) overlay.style.display = 'flex';
  return false;
}

async function authenticate() {
  const input = document.getElementById('gh-token');
  const btn = document.getElementById('login-btn');
  const token = input.value.trim();
  if(!token) return;
  
  btn.textContent = 'Verifying...';
  btn.disabled = true;
  
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `token ${token}` }
    });
    if(!res.ok) throw new Error('Invalid token');
    
    githubToken = token;
    localStorage.setItem('ghToken', token);
    document.getElementById('login-overlay').style.display = 'none';
    toast('Authenticated successfully!');
    
    // Refresh data now that we have auth
    loadData();
  } catch(e) {
    alert('Authentication failed: ' + e.message);
    btn.textContent = 'Authenticate';
    btn.disabled = false;
  }
}
"""

save_logic = """
async function saveAll(){
  if(!checkAuth()) return;
  autoSave();
  
  const legacy = { _note: D._note||'', clients: D.clients||{}, categories: D.categories||{} };
  const jsonContent = JSON.stringify(D, null, 2);
  const legacyContent = JSON.stringify(legacy, null, 2);
  
  const btn = document.getElementById('btn-save-all-main');
  const oldText = btn.textContent;
  btn.textContent = 'Publishing...';
  btn.disabled = true;
  toast('Pushing changes to GitHub...');
  
  try {
    // 1. Get SHA of site-content.json
    let sha1 = await getFileSha('site-content.json');
    await commitFile('site-content.json', jsonContent, sha1, 'Admin: Update site-content.json');
    
    // 2. Get SHA of content.json (legacy)
    let sha2 = await getFileSha('content.json');
    await commitFile('content.json', legacyContent, sha2, 'Admin: Update content.json');
    
    hasUnsaved=false;
    document.getElementById('unsaved-label').classList.remove('visible');
    buildSidebar();
    toast('✓ Published successfully! Vercel is now deploying your changes.');
  } catch(e) {
    console.error(e);
    toast('Error publishing: ' + e.message, true);
  } finally {
    btn.textContent = oldText;
    btn.disabled = false;
  }
}

async function getFileSha(path) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    headers: { 'Authorization': `token ${githubToken}` }
  });
  if(res.status === 404) return null; // File doesn't exist yet
  if(!res.ok) throw new Error('Failed to get file info');
  const data = await res.json();
  return data.sha;
}

async function commitFile(path, content, sha, message) {
  const body = {
    message: message,
    content: btoa(unescape(encodeURIComponent(content))), // Base64 encode UTF-8
    branch: 'main'
  };
  if(sha) body.sha = sha;
  
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  if(!res.ok) throw new Error(`Failed to commit ${path}`);
}
"""

# Insert Auth Logic at the top (after variables)
js = re.sub(r'(let hasUnsaved = false;\n)', r'\1\n' + auth_logic + '\n', js)

# Add checkAuth() to the beginning of init
js = re.sub(r'(loadData\(\);)', r'checkAuth();\n\1', js)

# Replace saveAll() and download() with GitHub API commit logic
js = re.sub(r'function saveAll\(\)\{.*?(?=function copyJSON\(\))', save_logic, js, flags=re.DOTALL)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(js)
print("admin.js patched successfully!")
