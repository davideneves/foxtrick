#!/usr/bin/env python3
"""Validate that Foxtrick manifest and background.html script paths exist."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def strip_js_comments(raw: str) -> str:
	lines = []
	for line in raw.splitlines():
		if '//' not in line:
			lines.append(line)
			continue
		in_str = False
		out = []
		i = 0
		while i < len(line):
			c = line[i]
			if c == '"':
				in_str = not in_str
				out.append(c)
			elif c == '/' and not in_str and i + 1 < len(line) and line[i + 1] == '/':
				break
			else:
				out.append(c)
			i += 1
		lines.append(''.join(out))
	text = '\n'.join(lines)
	text = re.sub(r',\s*}', '}', text)
	text = re.sub(r',\s*]', ']', text)
	return text


def main() -> int:
	raw = (ROOT / 'manifest.json').read_text(encoding='utf-8')
	data = json.loads(strip_js_comments(raw))
	missing: list[str] = []
	checked = 0

	for cs in data.get('content_scripts', []):
		for key in ('js', 'css'):
			for rel in cs.get(key, []):
				checked += 1
				if not (ROOT / rel).is_file():
					missing.append(rel)

	for key in ('background',):
		page = (data.get(key) or {}).get('page')
		if page:
			checked += 1
			if not (ROOT / page).is_file():
				missing.append(page)

	html = (ROOT / 'content' / 'background.html').read_text(encoding='utf-8')
	for m in re.finditer(r'src="\./([^"]+)"', html):
		rel = f'content/{m.group(1)}'
		checked += 1
		if not (ROOT / rel).is_file():
			missing.append(rel)

	print(f'manifest_version={data.get("manifest_version")} version={data.get("version")}')
	print(f'checked={checked} missing={len(missing)}')
	for path in missing:
		print(f'MISSING {path}')
	return 1 if missing else 0


if __name__ == '__main__':
	sys.exit(main())
