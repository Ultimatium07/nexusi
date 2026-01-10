import argparse
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List, Tuple

BASE_DIR = Path(__file__).resolve().parent
SCRIPTS = {
    "secure": BASE_DIR / "secure_bot.py",
    "main": BASE_DIR / "nexus_media_bot.py"
}


def start_process(name: str, script_path: Path) -> subprocess.Popen:
    if not script_path.exists():
        raise FileNotFoundError(f"Script '{script_path}' not found.")

    print(f"[launcher] Starting {name} bot: {script_path.name}")
    return subprocess.Popen([sys.executable, str(script_path)], cwd=str(BASE_DIR))


def monitor_processes(procs: List[Tuple[str, subprocess.Popen]]) -> None:
    try:
        while True:
            for name, proc in procs:
                retcode = proc.poll()
                if retcode is not None:
                    print(f"[launcher] {name} bot exited with code {retcode}.")
                    raise SystemExit(retcode or 1)
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[launcher] KeyboardInterrupt received. Shutting down child processes...")
    finally:
        for name, proc in procs:
            if proc.poll() is None:
                print(f"[launcher] Terminating {name} bot...")
                proc.terminate()
                try:
                    proc.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    print(f"[launcher] Force killing {name} bot.")
                    proc.kill()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run Nexus Media bots together")
    parser.add_argument(
        "--target",
        choices=["all", "secure", "main"],
        default="all",
        help="Choose which bot(s) to start."
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    targets: Dict[str, Path]
    if args.target == "all":
        targets = SCRIPTS
    else:
        targets = {args.target: SCRIPTS[args.target]}

    processes: List[Tuple[str, subprocess.Popen]] = []
    for name, script_path in targets.items():
        proc = start_process(name, script_path)
        processes.append((name, proc))

    monitor_processes(processes)


if __name__ == "__main__":
    main()
