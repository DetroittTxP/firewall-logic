# Dynamic Firewall Logic Builder — ui-v2

A visual, flow-based editor for designing firewall rule processing logic. Built with **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **@xyflow/react (React Flow v12)**.

---

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Node Types](#node-types)
- [Components](#components)
- [Utilities](#utilities)
- [Constants & Types](#constants--types)
- [Data Layer](#data-layer)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Profile Management](#profile-management)
- [Export Formats](#export-formats)

---

## Overview

The app lets you build a visual decision tree that models how an incoming firewall rule should be processed. You drag nodes onto the canvas, connect them with edges, and the app generates the corresponding logic in four export formats: human-readable prose, pseudocode, YAML, and JSON.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev        # http://localhost:3000

# Build for production
npm run build

# Start the production server
npm start

# Run ESLint
npm run lint
```

---

## Project Structure

```
ui-v2/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (HTML shell + metadata)
│   │   ├── page.tsx            # Entry page — mounts FlowCanvas inside ReactFlowProvider
│   │   └── globals.css         # Global Tailwind base styles
│   ├── components/
│   │   ├── FlowCanvas.tsx      # Main canvas component (all state & logic)
│   │   ├── Sidebar.tsx         # Left panel — palette (Flow nodes), profiles, actions
│   │   ├── TopBar.tsx          # Top bar — palette (Check Field & Action nodes)
│   │   └── ExportModal.tsx     # Modal dialog for viewing and copying exported logic
│   ├── nodes/
│   │   ├── index.ts            # nodeTypes registry for React Flow
│   │   ├── StartNode.tsx       # Entry-point node
│   │   ├── EndNode.tsx         # Terminal node
│   │   ├── ConditionNode.tsx   # Field-check node with 4 output handles
│   │   └── ActionNode.tsx      # Action execution node
│   ├── utils/
│   │   ├── exporters.ts        # buildLogic(), buildYAML(), buildJSON()
│   │   └── edgeStyle.ts        # makeEdgeStyle() — colour/label per handle
│   ├── data/
│   │   └── initialGraph.ts     # PALETTE, INIT_NODES, INIT_EDGES
│   ├── types/
│   │   └── index.ts            # All shared TypeScript types & interfaces
│   └── constants.ts            # COND_HANDLES, ACTIONS, HANDLE_MAP, HS
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

---

## Architecture

```
page.tsx
└─ ReactFlowProvider          (from @xyflow/react)
   └─ FlowCanvas              (owns all state)
      ├─ Sidebar              (left panel — receives props & callbacks)
      ├─ TopBar               (top bar — reads PALETTE directly)
      ├─ ExportModal          (receives modal state & tab callbacks)
      └─ ReactFlow            (renders nodes + edges)
         ├─ StartNode
         ├─ EndNode
         ├─ ConditionNode
         └─ ActionNode
```

### State in `FlowCanvas`

| State | Type | Purpose |
|---|---|---|
| `nodes` / `edges` | `Node[]` / `Edge[]` | The live React Flow graph |
| `selectedId` | `string \| null` | ID of the currently selected node |
| `historyRef` / `futureRef` | `Snapshot[]` | Undo / redo stacks (max 50 entries each) |
| `clipboardRef` | `Node \| null` | Last node copied with Ctrl+C |
| `profiles` | `ProfileMap` | Named saved graphs (persisted to `localStorage`) |
| `activeProfile` / `profileName` | `string` | Currently active / being-named profile |
| `modal` | `ExportResult \| null` | Export data shown in the modal; `null` hides it |
| `modalTab` | `ExportModalTab` | Which tab is active in the export modal |

### Node update pattern

Each node receives an `updateNode` callback injected into its `data` object by `FlowCanvas.nodesWithUpdater`. Nodes call `updateNode(id, patch)` when the user changes a select element, which triggers `setNodes` with an immutable patch — keeping all state in `FlowCanvas`.

---

## Node Types

### `StartNode`

- **Visual**: Dark pill — "▶ New Firewall Rule Arrives"
- **Handles**: one **source** handle at the bottom
- **Purpose**: Entry point of every flow graph; there should be exactly one per canvas

### `EndNode`

- **Visual**: Light pill — "🏁 {label}"  (`label` defaults to `"Done"`)
- **Handles**: one **target** handle at the top
- **Purpose**: Terminates a branch of the flow

### `ConditionNode`

- **Visual**: White card — "🔍 Check Field" with a field selector
- **Handles**:
  - **target** (top) — incoming connection
  - **4 sources** (bottom, left to right):

| Handle ID | Label | Colour |
|---|---|---|
| `exact` | exact | green `#4ade80` |
| `contain` | contain | amber `#fbbf24` |
| `any` | any / * | blue `#60a5fa` |
| `new` | new / none | red `#f87171` |

- **Data**: `field: ConditionField` — one of `src`, `dest`, `port`
- **Purpose**: Branches the flow based on how the rule's field matches existing rules

### `ActionNode`

- **Visual**: Light card — "⚡ Action" with an action selector
- **Handles**: **target** (top) + **source** (bottom)
- **Data**: `action: ActionKey`

| Action key | Label |
|---|---|
| `skip` | Skip |
| `add_port` | Add Port |
| `add_number` | Add UR Number |
| `add_src` | Add Source & Comment |
| `add_dest` | Add Dest & Comment |
| `create` | Create New Rule |

- **Purpose**: Represents a concrete operation performed on the firewall rule

---

## Components

### `FlowCanvas`

The top-level "smart" component. Owns all graph state and exposes callbacks downward. Key responsibilities:

- **Drag-and-drop**: `onDragOver` + `onDrop` handlers read `rf/type` and `rf/data` from the drag transfer, convert screen coordinates to flow coordinates via `screenToFlowPosition`, and append a new node with an auto-incremented ID (`n100`, `n101`, …).
- **Edge connection**: `onConnect` calls `makeEdgeStyle(sourceHandle)` to colour and label the new edge, then pushes to the undo history.
- **Undo / Redo**: `pushHistory()` snapshots `{nodes, edges}` into `historyRef`. Ctrl+Z restores the top snapshot; Ctrl+Y / Ctrl+Shift+Z re-applies from `futureRef`.
- **Copy / Paste**: Ctrl+C copies the selected node into `clipboardRef`; Ctrl+V creates a clone offset by `+30, +30`.
- **Delete**: Pressing `Delete` (or the sidebar button) removes the selected node and all its connected edges.
- **Clear**: Confirms via `window.confirm`, then resets nodes and edges to empty arrays.
- **Export**: Calls `buildLogic()` and `buildYAML()`, stores the result in `modal` state, and opens `ExportModal`.

### `Sidebar`

Left panel (195 px wide). Contains:

1. **Usage tips** — brief interaction guide
2. **Condition outputs legend** — colour-coded `COND_HANDLES` reference
3. **Flow palette** — draggable `Start` and `Done` nodes
4. **Profiles section** — text input for naming, save/load/delete buttons, list of saved profiles
5. **Canvas actions** — Export Logic, Clear All, Delete Selected

Props: all state and callbacks are passed from `FlowCanvas` — `profiles`, `activeProfile`, `profileName`, `setProfileName`, `saveProfile`, `loadProfile`, `deleteProfile`, `openExport`, `clearAll`, `deleteSelected`, `selectedId`.

### `TopBar`

Horizontal bar at the top of the canvas area. Renders all `PALETTE` groups that are **not** `Flow` (i.e., "Check Field" and "Action") as rows of draggable items, separated by thin vertical dividers. Reads `PALETTE` directly — no props.

### `ExportModal`

Full-screen overlay modal. Shown when `FlowCanvas.modal` is non-null.

- **Tabs**: Human Readable · Pseudocode · YAML · JSON
- **Copy button**: writes the current tab's content to the clipboard via `navigator.clipboard.writeText`
- **Close**: clicking the backdrop or the Close button sets `modal` to `null`

Props: `modal: ExportResult | null`, `modalTab`, `setModalTab`, `onClose`.

---

## Utilities

### `exporters.ts`

All three export functions traverse the graph as an adjacency list built from `edges`.

#### `buildLogic(nodes, edges): ExportResult`

Returns all four export formats. Internally calls `buildYAML` and `buildJSON` for those fields.

Traversal (`tr(nodeId, depth, branchLabel)`):
- `startNode` → emits flow entry lines, starts pseudocode function
- `conditionNode` → emits "Check {FIELD}" and iterates child handles as `if/elif` branches
- `actionNode` → emits "⚡ Action → {label}" and `{action_key}(rule)`
- `endNode` → emits `return` and terminates the branch

Depth is capped at 30 to prevent infinite loops on cyclic graphs.

#### `buildYAML(nodes, edges): string`

Produces a YAML document under the key `firewall_logic`. Condition nodes become `- check: {field}` with child keys per handle; action nodes become `- action: {key}`; end nodes become `- done: true`.

#### `buildJSON(nodes, edges): string`

Mirrors the YAML structure as a JSON object serialised with `JSON.stringify(..., null, 2)`.

---

### `edgeStyle.ts`

```ts
makeEdgeStyle(handleId: string | null | undefined): Partial<Edge>
```

Looks up the handle in `HANDLE_MAP`. If found, returns a coloured arrow marker, stroke style, and a labelled badge. If not found (plain non-condition edge), returns a neutral slate colour with no label.

---

## Constants & Types

### `constants.ts`

| Export | Description |
|---|---|
| `COND_HANDLES` | Array of 4 `ConditionHandle` objects (id, label, colour) |
| `HANDLE_MAP` | `Record<string, ConditionHandle>` — keyed by handle ID for O(1) lookup |
| `ACTIONS` | `Record<ActionKey, ActionConfig>` — label and colour for every action |
| `HS` | Shared `React.CSSProperties` for handle size (11 × 11 px, 3 px border-radius) |

### `types/index.ts`

| Type / Interface | Description |
|---|---|
| `ConditionField` | `'src' \| 'dest' \| 'port'` |
| `ActionKey` | Union of the 6 action string literals |
| `ConditionHandle` | `{ id, label, color }` |
| `ActionConfig` | `{ label, color }` |
| `UpdateNodeFn` | `(id: string, patch: Record<string, unknown>) => void` |
| `ConditionNodeData` | `ConditionNodeBaseData & { updateNode }` |
| `ActionNodeData` | `ActionNodeBaseData & { updateNode }` |
| `PaletteItem` | `{ type, label, color, data }` — one draggable palette entry |
| `PaletteGroup` | `{ group, items: PaletteItem[] }` — a labelled group of palette items |
| `ProfileData` | `{ nodes: Node[], edges: Edge[] }` — a saved canvas snapshot |
| `ProfileMap` | `Record<string, ProfileData>` |
| `ExportModalTab` | `'readable' \| 'pseudo' \| 'yaml' \| 'json'` |
| `ExportResult` | `{ readable, pseudo, yaml, json }` — all four export strings |

---

## Data Layer

### `data/initialGraph.ts`

- **`PALETTE`**: Three groups used to populate the sidebar and top bar:
  - `Flow` — Start, Done (shown in Sidebar)
  - `Check Field` — Check SRC, DEST, PORT (shown in TopBar)
  - `Action` — one entry per `ACTIONS` key (shown in TopBar)
- **`INIT_NODES`**: Default 8-node graph loaded when the app first opens
- **`INIT_EDGES`**: Default 9 edges connecting the initial graph

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` or `Ctrl+Shift+Z` | Redo |
| `Ctrl+C` | Copy selected node |
| `Ctrl+V` | Paste copied node (+30, +30 offset) |
| `Delete` | Delete selected node and its edges |

> Shortcuts are suppressed when focus is inside an `<input>` or `<textarea>`.

---

## Profile Management

Profiles are named snapshots of the canvas (nodes + edges) stored in `localStorage` under the key `fw_profiles` as a JSON-serialised `ProfileMap`.

- **Save**: Enter a name in the text input and click **Save**. Overwrites an existing profile with the same name.
- **Load**: Click a profile name in the list. Replaces the current canvas with the saved snapshot.
- **Delete**: Click the **×** button next to a profile name. Requires confirmation via `window.confirm`.

---

## Export Formats

Open the modal with the **Export Logic** button in the sidebar.

| Tab | Format | Description |
|---|---|---|
| Human Readable | Plain prose | Indented, emoji-decorated description of the flow |
| Pseudocode | Python-like | Function definition with `if/elif` branches |
| YAML | YAML | `firewall_logic` document with `check` and `action` keys |
| JSON | JSON | Equivalent tree structure as a JSON object |

All formats fall back to a warning message if no Start node is present or no connections exist.
