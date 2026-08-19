@0xb1c2d3e4f5a6b7c8;

struct LogEntry {
    timestamp @0 :UInt64;
    level @1 :Text;
    service @2 :Text;
    message @3 :Text;
    traceId @4 :Text;
    metadata @5 :Text;
}
