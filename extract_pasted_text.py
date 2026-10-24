from pathlib import Path
import sys


path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name("Pasted text(4).txt")
text = path.read_text(encoding="utf-8")
lines = text.splitlines()

print("chars", len(text), "lines", len(lines))
print("\n".join(f"{index + 1}: {line}" for index, line in enumerate(lines[470:504], start=470)))
