import json

from benchmark import SCHEMA_REGISTRY, run_benchmark
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Zero-Copy Benchmark API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.frontend("/", directory="assets")

@app.get("/api/schemas")
async def list_schemas():
    return {
        name: {"fields": reg["fields"]}
        for name, reg in SCHEMA_REGISTRY.items()
    }


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.websocket("/ws/benchmark")
async def benchmark_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)

            schema_name = msg.get("schema", "user")
            count = msg.get("count", 10_000)

            if schema_name not in SCHEMA_REGISTRY:
                await websocket.send_json({"type": "error", "message": f"Unknown schema: {schema_name}"})
                continue

            max_count = 1_000_000_000
            if count > max_count:
                await websocket.send_json({"type": "error", "message": f"Count exceeds max {max_count}"})
                continue

            # Scale batch size based on count
            if count <= 10_000:
                batch_size = count
            elif count <= 1_000_000:
                batch_size = 50_000
            else:
                batch_size = 500_000

            await websocket.send_json({"type": "started", "schema": schema_name, "count": count})

            async def on_progress(data):
                await websocket.send_json(data)

            result = await run_benchmark(
                schema_name=schema_name,
                count=count,
                progress_callback=on_progress,
                batch_size=batch_size,
            )

            await websocket.send_json(result)

    except WebSocketDisconnect:
        pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
