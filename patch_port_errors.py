import re

file_path = 'V1/portfolio/index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the syntax error (escaped backticks)
content = content.replace('\\`', '`')

# 2. Fix the scroll layout issue. 
# Previously I set it to static which caused it to be constrained by body overflow:hidden.
# I will change style="position:static; opacity:1; visibility:visible; pointer-events:all;"
# to style="position:fixed; top:64px; left:0; width:100%; height:calc(100% - 64px); overflow-y:auto; overflow-x:hidden; opacity:1; visibility:visible; pointer-events:all;"
old_style = 'style="position:static; opacity:1; visibility:visible; pointer-events:all;"'
new_style = 'style="position:fixed; top:64px; left:0; width:100%; height:calc(100% - 64px); overflow-y:auto; overflow-x:hidden; opacity:1; visibility:visible; pointer-events:all; z-index:10;"'

if old_style in content:
    content = content.replace(old_style, new_style)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched Portfolio")
