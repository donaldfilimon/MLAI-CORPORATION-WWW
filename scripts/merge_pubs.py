import json

with open('src/data/content.ts', 'r') as f:
    content = f.read()

# This is a bit hacky because it's a TS file, but I can use python to find the publications array
start_marker = "publications: ["
end_marker = "    ]"
start_idx = content.find(start_marker) + len(start_marker)
end_idx = content.find(end_marker, start_idx)

# Get the new publications
with open('new_publications.json', 'r') as f:
    new_pubs = json.load(f)

new_pubs_str = ",\n".join([json.dumps(p, indent=6) for p in new_pubs])
new_content = content[:start_idx] + "\n" + content[start_idx:end_idx] + ",\n" + new_pubs_str + "\n" + content[end_idx:]

with open('src/data/content.ts', 'w') as f:
    f.write(new_content)
