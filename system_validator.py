import ast
from pathlib import Path
from typing import List, Tuple, Optional

ROOT = Path(__file__).resolve().parent
PY_FILE = ROOT / "nexus_media_bot.py"
JS_FILE = ROOT / "nexus-ultimate.js"
HTML_FILE = ROOT / "nexus-ultimate.html"

HANDLER_DECORATORS = {
    "message_handler",
    "callback_query_handler",
    "chat_member_handler",
    "my_chat_member_handler",
    "chat_join_request_handler",
    "inline_handler",
    "errors_handler",
}

REQUIRED_JS_FUNCTIONS = [
    "modalLoadingHtml",
    "aiTestsModalTemplate",
    "shuffleArray",
    "renderLeaderboardHTML",
]

REQUIRED_HTML_IDS = [
    "claimBtn",
    "activeEffectsContainer",
    "flashcardsContainer",
    "addFlashcardForm",
    "saveFlashcardBtn",
    "flashcardAnswer",
    "flashcardCategory",
    "flashcardStatus",
    "flashcardQuestion",
    "aiTestsList",
    "aiTestForm",
    "aiTestStatus",
]

HANDLER_THRESHOLD = 33


def get_attr_name(node: ast.AST) -> Optional[str]:
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        parent = get_attr_name(node.value)
        if parent:
            return f"{parent}.{node.attr}"
        return node.attr
    return None


def analyze_python_handlers(path: Path) -> Tuple[int, int]:
    source = path.read_text(encoding="utf-8")
    tree = ast.parse(source, filename=str(path))

    decorated_count = 0
    add_handler_calls = 0

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            for deco in node.decorator_list:
                name = get_attr_name(deco.func if isinstance(deco, ast.Call) else deco)
                if name and name.split(".")[-1] in HANDLER_DECORATORS:
                    decorated_count += 1
                    break
        elif isinstance(node, ast.Call):
            attr_name = get_attr_name(node.func)
            if attr_name and attr_name.endswith("add_handler"):
                add_handler_calls += 1

    return decorated_count, add_handler_calls


def check_js_functions(path: Path) -> List[str]:
    text = path.read_text(encoding="utf-8")
    missing = []
    for fn in REQUIRED_JS_FUNCTIONS:
        signature = f"function {fn}"
        if signature not in text:
            missing.append(fn)
    return missing


def check_html_ids(path: Path) -> List[str]:
    text = path.read_text(encoding="utf-8")
    missing = []
    for dom_id in REQUIRED_HTML_IDS:
        token = f'id="{dom_id}"'
        if token not in text:
            missing.append(dom_id)
    return missing


def main() -> None:
    print("=== Nexus Diagnostics ===")

    if not PY_FILE.exists():
        print(f"[ERROR] {PY_FILE} not found")
        return

    handlers, add_calls = analyze_python_handlers(PY_FILE)
    print(f"[PY] Decorated handler functions: {handlers}")
    print(f"[PY] .add_handler calls: {add_calls}")
    if handlers >= HANDLER_THRESHOLD:
        print(f"[PY] ✅ Meets minimum handler count ({HANDLER_THRESHOLD})")
    else:
        print(f"[PY] ❌ Below handler threshold ({HANDLER_THRESHOLD})")

    if not JS_FILE.exists():
        print(f"[WARN] {JS_FILE} not found, skipping JS check")
    else:
        missing_js = check_js_functions(JS_FILE)
        if missing_js:
            print(f"[JS] ❌ Missing functions: {', '.join(missing_js)}")
        else:
            print("[JS] ✅ Required helper functions present")

    if not HTML_FILE.exists():
        print(f"[WARN] {HTML_FILE} not found, skipping DOM check")
    else:
        missing_ids = check_html_ids(HTML_FILE)
        if missing_ids:
            print(f"[HTML] ❌ Missing DOM IDs: {', '.join(missing_ids)}")
        else:
            print("[HTML] ✅ Required DOM IDs present")


if __name__ == "__main__":
    main()
