# System Info Tool

> Collect comprehensive system metrics (CPU, Memory, Disk, Uptime, Platform)

## 🎯 Overview

This tool provides detailed system information and can be used in two ways:
1. **As a Mastra Tool** - Called by the AI agent via natural language
2. **As a CLI** - Run standalone for testing, monitoring, or integration

## 📊 Metrics Collected

### CPU
- Model name
- Logical core count
- Physical core count (if available)
- Speed in GHz and MHz
- Load average (Unix only)

### Memory
- Total, used, and free memory
- Usage percentage
- Usage ratio (0.0 - 1.0 for UI progress bars)
- Human-readable formatted strings

### Disk
- Total, used, and available space
- Usage percentage
- Filesystem type (if available)
- Mount point

### Uptime
- Seconds (raw value)
- Formatted string (e.g., "5d 12h 34m 56s")
- Human-readable string (e.g., "5 days, 12 hours")

### Platform
- OS type (Linux, Darwin, Windows_NT)
- Release version
- Architecture (x64, arm64, etc.)
- Hostname
- Current user (if available)

## 🚀 Usage

### Via Mastra Agent

Simply ask the agent in natural language:

```
"Show me system information"
"What's the system status?"
"Get system metrics"
"Display CPU and memory usage"
```

### Via CLI

```bash
# Basic usage
tsx src/mastra/tools/system-info/cli.ts

# JSON output
tsx src/mastra/tools/system-info/cli.ts --json

# Detailed metrics
tsx src/mastra/tools/system-info/cli.ts --detailed

# Compact output
tsx src/mastra/tools/system-info/cli.ts --compact

# Help
tsx src/mastra/tools/system-info/cli.ts --help
```

### Integration Examples

```bash
# Pipe to jq for processing
tsx src/mastra/tools/system-info/cli.ts --json | jq '.memory.usedPercent'

# Continuous monitoring
watch -n 5 'tsx src/mastra/tools/system-info/cli.ts --compact'

# Save to file
tsx src/mastra/tools/system-info/cli.ts --json > system-metrics.json

# Use in scripts
if [ $(tsx src/mastra/tools/system-info/cli.ts --json | jq '.memory.usedPercent') -gt 90 ]; then
  echo "High memory usage!"
fi
```

## 🏗️ Architecture

```
system-info/
├── core.ts          # Pure logic (OS APIs, no framework deps)
├── schemas.ts       # Zod schemas and TypeScript types
├── index.ts         # Mastra Tool wrapper
├── cli.ts           # CLI executable
└── README.md        # This file
```

### Separation of Concerns

- **`core.ts`**: Pure functions using Node.js built-in modules (`os`, `child_process`)
- **`schemas.ts`**: Zod schemas with resilient nullable/optional fields
- **`index.ts`**: Mastra tool integration
- **`cli.ts`**: Standalone CLI interface

This architecture enables:
- ✅ Testing without running the full agent
- ✅ Reusable logic across Mastra and CLI
- ✅ Easy debugging and development
- ✅ Integration in CI/CD and scripts

## 🌍 Cross-Platform Support

The tool works on:
- ✅ Linux (tested on 6.14.0-33-generic)
- ✅ macOS
- ✅ Windows

Platform-specific implementations:
- **Disk info**: Uses `df` on Unix, `wmic` on Windows
- **Physical cores**: Different commands per OS
- **Load average**: Unix only (returns null on Windows)

## 🛡️ Error Handling

The tool is resilient and uses graceful degradation:

- Shell commands have 5-second timeouts
- Failed commands return fallback values ('N/A' or null)
- Schema allows nullable/optional fields
- Never crashes, always returns partial data

## 📝 Output Schema

```typescript
{
  tool_version: string;
  timestamp: string; // ISO 8601
  
  cpu: {
    model: string;
    cores: number;
    physicalCores: number | null;
    speedGHz: number | null;
    speedMHz: number | null;
    loadAverage: number[] | null;
  };
  
  memory: {
    totalGB: number;
    freeGB: number;
    usedGB: number;
    usedPercent: number;
    usedRatio: number; // 0.0 - 1.0
    total: string;     // Formatted
    free: string;
    used: string;
  };
  
  disk: {
    total: string;
    used: string;
    available: string;
    usedPercent: string;
    usedRatio: number | null;
    filesystem: string | null;
    mountPoint: string | null;
  };
  
  uptime: {
    seconds: number;
    formatted: string; // "5d 12h 34m"
    human: string;     // "5 days, 12 hours"
  };
  
  platform: {
    type: string;
    release: string;
    arch: string;
    hostname: string;
    user: string | null;
  };
}
```

## 🧪 Testing

```bash
# Test CLI
tsx src/mastra/tools/system-info/cli.ts

# Test JSON output
tsx src/mastra/tools/system-info/cli.ts --json

# Validate JSON
tsx src/mastra/tools/system-info/cli.ts --json | jq .

# Test specific fields
tsx src/mastra/tools/system-info/cli.ts --json | jq '.cpu.cores'

# Test exit code
tsx src/mastra/tools/system-info/cli.ts > /dev/null && echo "OK"
```

## 🔍 Debug Mode

Enable debug logging:

```bash
SYSTEM_INFO_DEBUG=true tsx src/mastra/tools/system-info/cli.ts
```

Output:
```
[SystemInfoTool] === System Info Tool V1 Started ===
[SystemInfoTool] Gathering CPU info...
[SystemInfoTool] Gathering Memory info...
[SystemInfoTool] Platform detected: linux
[SystemInfoTool] Using Unix df command
[SystemInfoTool] Gathering Disk info...
[SystemInfoTool] Gathering Uptime info...
[SystemInfoTool] Gathering Platform info...
[SystemInfoTool] === System Info Tool V1 Completed in 45ms ===
```

## 📚 References

- [Node.js os module](https://nodejs.org/api/os.html)
- [Node.js child_process](https://nodejs.org/api/child_process.html)
- [Mastra Tools Documentation](https://mastra.ai/docs/tools)
- [Zod Schema Validation](https://zod.dev/)

## 🎨 UI Integration

The schema includes `usedRatio` fields (0.0 - 1.0) perfect for progress bars:

```tsx
<ProgressBar value={data.memory.usedRatio * 100} />
<ProgressBar value={data.disk.usedRatio * 100} />
```

## 📦 Version

**Current version:** 1.0.0

## 📄 License

Part of Deus Ex Machina project - Nosana Agents 102 Challenge

