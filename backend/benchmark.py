import asyncio
import json
import os
import subprocess
import sys
from typing import Callable, Optional

BENCHMARK_EXE = os.environ.get(
    "BENCHMARK_EXE",
    os.path.join(os.path.dirname(__file__), "..", "build", "benchmark.exe"),
)

SCHEMA_REGISTRY = {
    "user": {"fields": ["id", "name", "email", "age", "isActive", "balance", "address", "phone"]},
    "logEntry": {"fields": ["timestamp", "level", "service", "message", "traceId", "metadata"]},
}


async def run_benchmark(
    schema_name: str,
    count: int,
    progress_callback: Optional[Callable] = None,
    batch_size: int = 10_000,
) -> dict:
    if count <= 10_000:
        batch_size = count
    elif count <= 1_000_000:
        batch_size = 50_000
    else:
        batch_size = 500_000

    exe = BENCHMARK_EXE
    if not os.path.isfile(exe):
        return {"type": "error", "message": f"Benchmark binary not found at {exe}"}

    cmd = [exe, "--schema", schema_name, "--count", str(count), "--batch", str(batch_size)]

    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    result = None

    async for line in proc.stdout:
        line = line.decode("utf-8", errors="replace").strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            continue

        if msg.get("type") == "progress" and progress_callback:
            await progress_callback(msg)
        elif msg.get("type") == "result":
            result = msg

    await proc.wait()

    if result is None:
        stderr = (await proc.stderr.read()).decode("utf-8", errors="replace")
        return {"type": "error", "message": f"Benchmark failed (exit {proc.returncode}): {stderr[:500]}"}

    return result
