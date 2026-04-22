import os

file_path = "/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/V1/portfolio/script.js"

with open(file_path, 'r') as f:
    content = f.read()

# Replace literal \n with actual newlines
# Replace literal \" with actual quotes
# Note: we need to be careful if there are actual escaped sequences that should stay.
# But looking at the cat output, it seems everything was escaped.

fixed_content = content.encode('utf-8').decode('unicode_escape')

# Ensure we don't have double escaping issues or other artifacts
# unicode_escape might be too aggressive if there were actual unicode characters.
# But let's try a simpler approach if possible.

# Manual replacement for safety
fixed_content = content.replace('\\n', '\n').replace('\\"', '"')

with open(file_path, 'w') as f:
    f.write(fixed_content)

print("Fixed script.js content.")
