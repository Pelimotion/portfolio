import re

with open('admin/admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add contactText to curriculum save memory
pattern_save = r"C\.socialBehance=v\('f-cvBE'\);"
replacement_save = "C.socialBehance=v('f-cvBE');\n  C.contactText=v('f-cvContactText');"
content = re.sub(pattern_save, replacement_save, content)

# 2. Add contactText to showCurriculum
pattern_show = r"<div class=\"field\"><label>Email</label><input id=\"f-cvEmail\""
replacement_show = """<div class="field"><label>Contact Call to Action <div class="format-toolbar"><button type="button" tabindex="-1" onclick="insertFormat('f-cvContactText', 'b')">B</button><button type="button" tabindex="-1" onclick="insertFormat('f-cvContactText', 'i')">I</button><button type="button" tabindex="-1" onclick="insertFormat('f-cvContactText', 'br')">↵</button></div></label><textarea id="f-cvContactText" rows="3" oninput="markUnsaved()">${esc(C.contactText||'Open to direction,<br>\\n<span class="serif text-white/70">collaborations</span> and<br>\\nlong-form briefs<span class="text-white/30">.</span>')}</textarea><div class="hint">The large text in the Contact section of the curriculum.</div></div>
      <div class="field"><label>Email</label><input id="f-cvEmail" """
content = content.replace(pattern_show, replacement_show)

# 3. Add format toolbar to Profile Paragraphs and Subtitle
p1_pattern = r'<div class="field"><label>Paragraph 1 \(main summary — shown in bold\)</label><textarea id="f-cvP1"'
p1_replace = r'<div class="field"><label>Paragraph 1 (main summary — shown in bold) <div class="format-toolbar"><button type="button" tabindex="-1" onclick="insertFormat(\'f-cvP1\', \'b\')">B</button><button type="button" tabindex="-1" onclick="insertFormat(\'f-cvP1\', \'i\')">I</button></div></label><textarea id="f-cvP1"'
content = content.replace(p1_pattern, p1_replace)

p2_pattern = r'<div class="field"><label>Paragraph 2 \(supporting detail\)</label><textarea id="f-cvP2"'
p2_replace = r'<div class="field"><label>Paragraph 2 (supporting detail) <div class="format-toolbar"><button type="button" tabindex="-1" onclick="insertFormat(\'f-cvP2\', \'b\')">B</button><button type="button" tabindex="-1" onclick="insertFormat(\'f-cvP2\', \'i\')">I</button></div></label><textarea id="f-cvP2"'
content = content.replace(p2_pattern, p2_replace)

sub_pattern = r'<div class="field"><label>Subtitle / Tagline</label><textarea id="f-cvSub"'
sub_replace = r'<div class="field"><label>Subtitle / Tagline <div class="format-toolbar"><button type="button" tabindex="-1" onclick="insertFormat(\'f-cvSub\', \'b\')">B</button><button type="button" tabindex="-1" onclick="insertFormat(\'f-cvSub\', \'i\')">I</button></div></label><textarea id="f-cvSub"'
content = content.replace(sub_pattern, sub_replace)

# 4. Add insertFormat function
insert_format_func = """
// ─── Text Formatting Helper ───────────────────────────────────────────────
function insertFormat(id, tag) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const val = el.value;
  const selectedText = val.substring(start, end);
  
  let insertion = '';
  if(tag === 'br') {
    insertion = '<br>\\n';
  } else if(tag === 'b') {
    insertion = `<b>${selectedText}</b>`;
  } else if(tag === 'i') {
    insertion = `<i>${selectedText}</i>`;
  }
  
  el.value = val.substring(0, start) + insertion + val.substring(end);
  el.selectionStart = el.selectionEnd = start + insertion.length;
  el.focus();
  markUnsaved();
}
"""

if 'function insertFormat' not in content:
    content = content.replace('// ─── PIN Auth', insert_format_func + '\n// ─── PIN Auth')

with open('admin/admin.js', 'w', encoding='utf-8') as f:
    f.write(content)
