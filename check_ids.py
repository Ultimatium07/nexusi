import re
import os

def get_ids_from_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    ids = set(re.findall(r'id=["\']([^"\']+)["\']', content))
    return ids

def get_refs_from_js(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Match getElementById('id') and getElementById("id")
    refs = set(re.findall(r'getElementById\s*\(\s*["\']([^"\']+)["\']\s*\)', content))
    return refs

html_file = 'nexus-ultimate.html'
js_file = 'nexus-ultimate.js'

if os.path.exists(html_file) and os.path.exists(js_file):
    html_ids = get_ids_from_html(html_file)
    js_refs = get_refs_from_js(js_file)

    missing = js_refs - html_ids
    print("IDs referenced in JS but missing in HTML:")
    for m in missing:
        print(f"- {m}")
else:
    print("Files not found.")
