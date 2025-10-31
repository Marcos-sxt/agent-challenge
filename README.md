# 🌌 Deus Ex Machina

> **AI Agent for DevOps Orchestration & Automation**  
> Built for [Nosana Builders Challenge: Agents 102](https://earn.superteam.fun/listing/nosana-builders-challenge-agents-102)

**Deus Ex Machina** is an intelligent AI agent that orchestrates infrastructure and controls computational environments through natural language. It transforms complex DevOps operations into simple conversational commands.

---

## ✨ Features

### 🎯 Core Capabilities

- **🔍 GitHub Integration** - Search repositories, get detailed info, list issues, and fetch user profiles
- **💻 System Monitoring** - Real-time CPU, memory, disk, and uptime metrics
- **🌐 Interactive UI** - Beautiful, responsive frontend with generative UI cards
- **🧠 Intelligent Agent** - Context-aware decision making powered by Mastra AI Framework
- **🛡️ Battle-Tested** - Robust error handling and defensive programming throughout

### 🚀 Coming Soon (MCP Implementation)

- **MCP Server** - Model Context Protocol integration (Challenge requirement)
- **Live Synchronization** - Real-time UI updates when agents modify resources
- **Dynamic Prompts** - Domain-specific prompt generation for DevOps
- **Custom MCP Tools** - Specialized tools for Nosana Network orchestration
- **Nosana Deployment** - Full integration with Nosana decentralized GPU network

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (Next.js)                      │
│         • Chat Interface (CopilotKit)                   │
│         • Generative UI Cards                            │
│         • Real-time Updates                              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Agent Layer (Mastra AI)                     │
│         • Natural Language Understanding                 │
│         • Context Management                             │
│         • Tool Orchestration                             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    Tools Layer                           │
│  • GitHub Tools (Search, Repo Info, Issues, Users)       │
│  • System Info Tool                                      │
│  • [MCP Tools - Planned]                                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  External Services                       │
│  • GitHub API                                            │
│  • Ollama LLM (via Nosana endpoint)                     │
│  • [Nosana Network - Planned]                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Framework:** [Mastra AI](https://mastra.ai/docs) - AI agent framework
- **Frontend:** Next.js 15.5.4 + CopilotKit - Interactive chat interface
- **LLM:** Ollama (qwen3:8b) via Nosana endpoint
- **Runtime:** Node.js v23.10.0
- **Package Manager:** pnpm v10.15.0
- **Language:** TypeScript
- **Deployment:** Docker + Nosana Network (planned)

---

## 📦 Installation

### Prerequisites

- Node.js v20+ 
- pnpm (`npm install -g pnpm`)
- Ollama endpoint (or configure Nosana endpoint)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd "NOSANA BUILDERS CHALLENGE/agent-challenge"
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Ollama Configuration
OLLAMA_API_URL=http://your-ollama-endpoint:11434
MODEL_NAME_AT_ENDPOINT=qwen3:8b

# GitHub API (optional, for rate limits)
GITHUB_TOKEN=your_github_token

# Nosana Configuration
NOS_OLLAMA_API_URL=https://your-nosana-endpoint
NOS_MODEL_NAME_AT_ENDPOINT=qwen3:8b
```

4. **Run development servers**
```bash
# Terminal 1: Agent Server
pnpm run dev:agent

# Terminal 2: UI Server
pnpm run dev:ui
```

5. **Open your browser**
   - UI: http://localhost:3000
   - Agent API: http://localhost:4111

---

## 🎮 Usage

### Example Commands

**GitHub Operations:**
```
"Search for repositories about machine learning"
"Show me details about microsoft/vscode"
"List open issues from facebook/react"
"Get info about user torvalds"
```

**System Monitoring:**
```
"Show me system info"
"What's my CPU usage?"
"Check disk space"
```

**Natural Language:**
```
"I want to see what repositories Microsoft has about AI"
"Tell me about Linus Torvalds' GitHub profile"
"Show me open issues in the React repository"
```

---

## 📊 Project Status

### ✅ Completed (Phase 1)

- [x] Complete project setup and exploration
- [x] System Info Tool (CLI + Mastra integration)
- [x] GitHub Tools Suite (4 read-only tools):
  - [x] GitHub Search Tool
  - [x] GitHub Repo Info Tool
  - [x] GitHub Issues Tool
  - [x] GitHub User Info Tool
- [x] Generative UI Cards for all GitHub tools
- [x] Robust error handling and defensive programming
- [x] Complete documentation (25+ markdown files)

### 🚧 In Progress (Phase 2)

- [ ] MCP Server implementation
- [ ] Live synchronization
- [ ] Dynamic prompts for DevOps domain
- [ ] Custom MCP tools (2+ required)
- [ ] Nosana Network deployment

### 📅 Timeline

| Phase | Status | Deadline |
|-------|--------|----------|
| **Phase 1: GitHub Tools** | ✅ Complete | Oct 17, 2025 |
| **Phase 2: MCP Implementation** | 🚧 In Progress | Oct 22, 2025 |
| **Phase 3: Deployment** | ⏳ Planned | Oct 24, 2025 |

---

## 📚 Documentation

- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Detailed project status and progress
- **[EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** - Quick overview
- **[docs/](./docs/)** - Complete documentation directory
  - Strategic planning documents
  - Technical implementation notes
  - Challenge requirements analysis
  - MCP implementation research

---

## 🧪 Testing

### Robustness Testing

The application has been extensively tested with adversarial inputs:
- ✅ Non-existent repositories/users
- ✅ Private repository access attempts
- ✅ XSS and injection attempts
- ✅ Invalid parameters and edge cases
- ✅ Malformed API responses

**Result:** Zero crashes, graceful error handling throughout.

---

## 🎯 Challenge Requirements

### Nosana Builders Challenge: Agents 102

**Mandatory Requirements:**
- ✅ Mastra AI Agent (with context awareness)
- ✅ Interactive Frontend (Next.js + real-time UI)
- 🚧 MCP Server (Model Context Protocol) - **In Progress**
- 🚧 Live Synchronization - **Planned**
- 🚧 At least 2 custom MCP tools - **Planned**
- 🚧 Dynamic prompts for DevOps domain - **Planned**
- 🚧 Deploy on Nosana Network - **Planned**

**Evaluation Categories:**
- 🏆 Best Overall Application
- 🎨 Most Creative Use of MCP
- 🎨 Best UI/UX Design
- 💼 Most Practical Business Solution
- 👥 Community Choice Award

---

## 🤝 Contributing

This project is part of the Nosana Builders Challenge. For issues or questions:
- Discord: Nosana #agents-102 channel
- GitHub: Open an issue (when repository is public)

---

## 📄 License

[Add license information]

---

## 🙏 Acknowledgments

- **Nosana Network** - For providing the decentralized GPU infrastructure
- **Mastra AI** - For the powerful agent framework
- **Superteam** - For organizing the challenge

---

## 🔗 Links

- **Bounty:** https://earn.superteam.fun/listing/nosana-builders-challenge-agents-102
- **Nosana Docs:** https://docs.nosana.com/
- **Mastra Docs:** https://mastra.ai/docs
- **Nosana Discord:** https://discord.gg/nosana

---

**Built with ❤️ for the Nosana Builders Challenge**

*"Deus Ex Machina - Where intention meets execution."*
