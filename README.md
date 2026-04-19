# 🧬 Neural HQ: The Autonomous AI Enterprise OS

Welcome to **Neural HQ**, a cutting-edge, unified Web IDE designed for orchestrating specialized AI agents. Neural HQ transforms complex agentic workflows into a high-fidelity, real-time experience, providing a "Command Center" view of your entire AI workforce.

![Neural HQ Preview](public/preview.png) *(Note: Add your preview image to public/preview.png)*

## 🌌 The Vision
Neural HQ is built on the philosophy that AI agents should not just be chat bubbles. They should be visible, accountable, and collaborative. Our platform provides the infrastructure to deploy, monitor, and secure an autonomous AI company.

## 🏗️ 4-Zone Neural Architecture
The interface is engineered around a high-performance, resizable 4-zone layout, optimized for deep work and systemic oversight.

1.  **Zone 1: The Roster & Explorer (Left)**
    *   **Source Explorer:** Direct access to your local filesystem using the Web File System Access API.
    *   **Agent Roster:** A live directory of your AI employees (CEO, CTO, Engineers), showing their status, roles, and configured MCP skills.

2.  **Zone 2: The Neural Workspace (Center)**
    *   **Monaco Editor:** A professional-grade code editor for human-AI collaborative coding.
    *   **Neural Canvas:** A real-time, animated orchestration map. Watch as the CEO delegates tasks to workers with live connection glows and data-flow animations.
    *   **System Analytics:** Deep insights into token usage, task success rates, and agent performance metrics.

3.  **Zone 3: Command & Control (Right)**
    *   **Agent Chat:** Direct neural link to any agent in your roster for instruction and feedback.
    *   **Task Inspector:** A granular view of the active directive pipeline, tracking Every sub-task and delegation.

4.  **Zone 4: The Neural Shell (Bottom)**
    *   **xterm.js Terminal:** A fully-functional terminal simulation.
    *   **Live Log Stream:** A high-velocity stream of system events, agent thoughts, and execution logs.

## 🛡️ Live Agent Orchestration & Security
Neural HQ features a sophisticated orchestration layer:
*   **Animated Orchestration:** Real-time visual feedback of agent communication on the Neural Canvas.
*   **Security Gates (Human-in-the-Loop):** Sensitive operations (filesystem writes, deployments, API calls) trigger a **Neural Approval Dialog**, requiring human authorization with full diff previews.
*   **Real-time Log Streaming:** Every action is streamed to the unified terminal and log view, ensuring 100% observability.

## 🛠️ Technology Stack
*   **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://reactjs.org/)
*   **Runtime:** [Bun](https://bun.sh/)
*   **State:** [Zustand](https://github.com/pmndrs/zustand) (Fully Synced IDE State)
*   **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
*   **Database:** [Prisma](https://www.prisma.io/) + [SQLite](https://sqlite.org/)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Editor/Terminal:** [Monaco](https://microsoft.github.io/monaco-editor/) / [xterm.js](https://xtermjs.org/)

## 🚀 Getting Started

### Prerequisites
*   [Bun](https://bun.sh/) installed.

### Installation
1.  **Clone and Install:**
    ```bash
    bun install
    ```

2.  **Environment Setup:**
    ```bash
    cp .env.example .env
    # Add your API keys for OpenAI, Z.AI, or other providers
    ```

3.  **Database Initialization:**
    ```bash
    bun db:push
    bun prisma db seed
    ```

4.  **Launch the HQ:**
    ```bash
    bun dev
    ```
    Visit `http://localhost:3000` to enter the Neural HQ.

## 📜 Browser Support
Neural HQ utilizes the **File System Access API**. For the best experience, use **Chrome, Edge, or Brave**. A robust fallback "Demo Mode" is provided for Safari and Firefox.

---

*Neural HQ — Orchestrating the future of autonomous work.*
