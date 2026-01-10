import argparse
import ast
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

HANDLER_DECORATORS = {
    "message_handler",
    "callback_query_handler",
    "chat_member_handler",
    "my_chat_member_handler",
    "inline_handler",
    "errors_handler",
    "channel_post_handler",
    "edited_message_handler",
    "poll_handler",
}

HANDLER_CLASSES = {
    "MessageHandler",
    "CallbackQueryHandler",
    "ChatMemberHandler",
    "InlineQueryHandler",
    "PollHandler",
}

STATE_BASES = {"StatesGroup"}


def get_attr_name(node: ast.AST) -> Optional[str]:
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        parent = get_attr_name(node.value)
        if parent:
            return f"{parent}.{node.attr}"
        return node.attr
    return None


def describe_call(node: ast.Call) -> str:
    name = get_attr_name(node.func) or "<unknown>"
    return f"{name}()"


@dataclass
class DecoratedHandler:
    name: str
    decorator: str
    lineno: int


@dataclass
class AddHandlerCall:
    handler: str
    lineno: int


@dataclass
class StateGroup:
    name: str
    lineno: int


class HandlerAnalyzer(ast.NodeVisitor):
    def __init__(self) -> None:
        self.decorated: List[DecoratedHandler] = []
        self.add_calls: List[AddHandlerCall] = []
        self.state_groups: List[StateGroup] = []
        self.main_present = False

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self._inspect_function(node)
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        self._inspect_function(node)
        self.generic_visit(node)

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        for base in node.bases:
            base_name = get_attr_name(base)
            if base_name and base_name.split(".")[-1] in STATE_BASES:
                self.state_groups.append(StateGroup(node.name, node.lineno))
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call) -> None:
        attr = get_attr_name(node.func)
        if attr and attr.endswith("add_handler"):
            handler_repr = describe_call(node.args[0]) if node.args else "<missing>"
            self.add_calls.append(AddHandlerCall(handler_repr, node.lineno))
        elif attr and attr.split(".")[-1] in HANDLER_CLASSES:
            self.add_calls.append(AddHandlerCall(describe_call(node), node.lineno))

        if (
            isinstance(node.func, ast.Attribute)
            and isinstance(node.func.value, ast.Name)
            and node.func.value.id == "__name__"
        ):
            self.main_present = True
        self.generic_visit(node)

    def visit_If(self, node: ast.If) -> None:
        # Detect "if __name__ == '__main__':" blocks
        if (
            isinstance(node.test, ast.Compare)
            and isinstance(node.test.left, ast.Name)
            and node.test.left.id == "__name__"
        ):
            self.main_present = True
        self.generic_visit(node)

    def _inspect_function(self, node: ast.AST) -> None:
        fun_name = getattr(node, "name", "<anonymous>")
        decorators = getattr(node, "decorator_list", [])
        for deco in decorators:
            deco_name = None
            if isinstance(deco, ast.Call):
                deco_name = get_attr_name(deco.func)
            else:
                deco_name = get_attr_name(deco)

            if deco_name and deco_name.split(".")[-1] in HANDLER_DECORATORS:
                simple = deco_name.split(".")[-1]
                self.decorated.append(DecoratedHandler(fun_name, simple, getattr(node, "lineno", 0)))


def analyze_file(path: Path) -> HandlerAnalyzer:
    source = path.read_text(encoding="utf-8")
    tree = ast.parse(source, filename=str(path))
    analyzer = HandlerAnalyzer()
    analyzer.visit(tree)
    return analyzer


def print_report(path: Path, analyzer: HandlerAnalyzer) -> None:
    print(f"𐄁 Handler Report for: {path.name}")
    print("─" * 60)
    print(f"Decorated handlers: {len(analyzer.decorated)}")
    for item in analyzer.decorated[:10]:
        print(f"  • {item.decorator}: {item.name} (line {item.lineno})")
    if len(analyzer.decorated) > 10:
        print(f"  … {len(analyzer.decorated) - 10} more")

    print()
    print(f"Dispatcher .add_handler calls: {len(analyzer.add_calls)}")
    for call in analyzer.add_calls[:10]:
        print(f"  • {call.handler} at line {call.lineno}")
    if len(analyzer.add_calls) > 10:
        print(f"  … {len(analyzer.add_calls) - 10} more")

    print()
    print(f"State groups detected: {len(analyzer.state_groups)}")
    for state in analyzer.state_groups[:10]:
        print(f"  • {state.name} (line {state.lineno})")
    if len(analyzer.state_groups) > 10:
        print(f"  … {len(analyzer.state_groups) - 10} more")

    print()
    if analyzer.main_present:
        print("✅ __main__ guard detected.")
    else:
        print("⚠️ No __main__ guard detected. Make sure the bot entrypoint is defined.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Analyze Nexus Media bot handlers")
    parser.add_argument(
        "target",
        nargs="?",
        default="nexus_media_bot.py",
        help="Python file to analyze (default: nexus_media_bot.py)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    target_path = Path(args.target)
    if not target_path.exists():
        raise FileNotFoundError(f"Target file '{target_path}' not found.")

    analyzer = analyze_file(target_path)
    print_report(target_path, analyzer)


if __name__ == "__main__":
    main()
