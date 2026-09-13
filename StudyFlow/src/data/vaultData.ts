import { VaultNote } from '../types';

export const INITIAL_VAULT_NOTES: VaultNote[] = [
  // 1. Data Structures -> Trees
  {
    id: 'vault-bst',
    title: 'Binary Search Trees',
    folderPath: ['Data Structures', 'Trees'],
    sessionId: 'session-ds-trees-graphs',
    tags: ['algorithms', 'trees', 'cs201', 'high-yield'],
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-13T10:05:00Z',
    content: `# Binary Search Trees (BST)

A **Binary Search Tree** is a rooted hierarchical data structure with the monotonic ordering invariant: for any node $X$, all keys in the left subtree $< X.val$ and all keys in the right subtree $> X.val$.

---

## ⚡ Complexity Comparison Table

| Operation | Average Case | Worst Case (Degenerate) | Balanced (AVL / Red-Black) |
| :--- | :--- | :--- | :--- |
| **Lookup / Search** | $O(\\log N)$ | $O(N)$ | $O(\\log N)$ |
| **Insert** | $O(\\log N)$ | $O(N)$ | $O(\\log N)$ |
| **Delete** | $O(\\log N)$ | $O(N)$ | $O(\\log N)$ |

---

## 🎯 Key Principles & Invariants
1. **Inorder Traversal Ordering:**
   - Executing an [[Tree Traversals]] (specifically Inorder) yields keys in strictly ascending sorted order.
2. **Successor & Predecessor:**
   - Inorder successor of node $X$ is the minimum element in $X$'s right subtree.
3. **Generalization to Graphs:**
   - Trees are acyclic connected graphs explored via [[Graph Search (BFS & DFS)]].

> **Exam Takeaway:** When validating a BST, check each node against an interval range $(min, max)$ instead of solely comparing with immediate parent nodes.

---

## 💻 C++ Validation Implementation

\`\`\`cpp
bool isValidBST(TreeNode* root, long minVal = LONG_MIN, long maxVal = LONG_MAX) {
    if (!root) return true;
    if (root->val <= minVal || root->val >= maxVal) return false;
    return isValidBST(root->left, minVal, root->val) &&
           isValidBST(root->right, root->val, maxVal);
}
\`\`\`

---

## ✅ Active Revision Checklist
- [x] Understand the BST monotonic ordering invariant
- [ ] Implement iterative vs recursive search
- [ ] Practice 3 cases of node deletion (leaf, 1 child, 2 children)`
  },
  {
    id: 'vault-traversals',
    title: 'Tree Traversals',
    folderPath: ['Data Structures', 'Trees'],
    sessionId: 'session-ds-trees-graphs',
    tags: ['trees', 'recursion', 'traversals'],
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-13T10:05:00Z',
    content: `# Tree Traversals

Systematic algorithms for visiting every vertex in a hierarchical tree data structure.

---

## 📋 Traversal Summary Table

| Traversal Order | Sequence | Primary Applications |
| :--- | :--- | :--- |
| **Inorder** | Left $\\rightarrow$ Root $\\rightarrow$ Right | Ascending sort in [[Binary Search Trees]] |
| **Preorder** | Root $\\rightarrow$ Left $\\rightarrow$ Right | Serialization, tree cloning, prefix expressions |
| **Postorder** | Left $\\rightarrow$ Right $\\rightarrow$ Root | Bottom-up subtree deletion, syntax trees |
| **Level-Order** | Breadth-First (Queue) | Shortest level distance, similar to [[Graph Search (BFS & DFS)]] |

---

## 💻 Recursive Traversal Implementation

\`\`\`cpp
void inorder(Node* root) {
    if (!root) return;
    inorder(root->left);
    visit(root->val);
    inorder(root->right);
}
\`\`\`

---

## ✅ Mastery Checklist
- [x] Memorize Inorder, Preorder, and Postorder visit sequences
- [ ] Implement Morris Inorder Traversal in $O(1)$ extra space
- [ ] Connect Level-Order traversal with BFS queue mechanics`
  },

  // 2. Data Structures -> Graphs
  {
    id: 'vault-graph-search',
    title: 'Graph Search (BFS & DFS)',
    folderPath: ['Data Structures', 'Graphs'],
    sessionId: 'session-ds-trees-graphs',
    tags: ['graphs', 'bfs', 'dfs', 'algorithms'],
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-13T10:05:00Z',
    content: `# Graph Search: Breadth-First & Depth-First

Graphs represent arbitrary pairwise relationships between vertices $V$ and edges $E$.

---

## ⚡ BFS vs DFS Comparison Table

| Strategy | Data Structure | Time Complexity | Optimal Use Case |
| :--- | :--- | :--- | :--- |
| **BFS (Breadth-First)** | FIFO Queue | $O(V + E)$ | Unweighted shortest path, connected levels |
| **DFS (Depth-First)** | Recursion / Stack | $O(V + E)$ | Topological sort, cycle detection, SCCs |

---

## 🎯 Important Exploration Principles
- **BFS Edge Weight Limit:** BFS guarantees shortest path *only* on unweighted or equal-weight edges. For non-negative weighted graphs, use [[Dijkstra's Algorithm]].
- **Visited Tracking:** Always maintain a \`visited\` set/array to prevent infinite loops in cyclic graphs.

> **Exam Trap:** In BFS, mark nodes as visited *immediately* when pushing them to the queue, NOT when popping them, to prevent duplicate queue expansions.`
  },
  {
    id: 'vault-dijkstra',
    title: "Dijkstra's Algorithm",
    folderPath: ['Data Structures', 'Graphs'],
    sessionId: 'session-ds-trees-graphs',
    tags: ['graphs', 'greedy', 'shortest-path'],
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-13T10:05:00Z',
    content: `# Dijkstra's Algorithm

Greedy single-source shortest path algorithm on directed or undirected graphs with **non-negative** edge weights.

---

## ⚡ Mechanics & Complexity

| Aspect | Specification |
| :--- | :--- |
| **Time Complexity** | $O((V + E) \\log V)$ using a Min-Priority Queue |
| **Space Complexity** | $O(V)$ for distance table and heap |
| **Constraint** | Edge weights must be $\\ge 0$ (fails on negative cycles) |

---

## 🔗 Related Topologies
- Extends [[Graph Search (BFS & DFS)]] to weighted networks.
- Used in distributed routing protocols alongside consensus algorithms like [[Raft Consensus Algorithm]].`
  },

  // 3. Distributed Systems -> Consensus
  {
    id: 'vault-raft',
    title: 'Raft Consensus Algorithm',
    folderPath: ['Distributed Systems', 'Consensus'],
    sessionId: 'session-cs-raft',
    tags: ['distributed-systems', 'consensus', 'raft', 'cs350'],
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-13T10:05:00Z',
    content: `# Raft Consensus Algorithm

Raft is a distributed consensus protocol designed for understandability, decomposing state machine replication into [[Leader Election]], Log Replication, and Safety Invariants.

---

## ⚡ Cluster State Machine Roles

| Role | Responsibilities | State Transitions |
| :--- | :--- | :--- |
| **Leader** | Handles client RPCs, replicates log entries | Steps down to Follower if higher term seen |
| **Candidate** | Broadcasts \`RequestVote\` with randomized election timers | Transitions to Leader on majority vote |
| **Follower** | Passive, responds to heartbeats and log append RPCs | Transitions to Candidate upon election timeout |

---

## 🛡️ Core Quorum Invariant
- Any decision requires a strict majority quorum $Q = \\lfloor N/2 \\rfloor + 1$.
- Any two quorums overlap by at least one node with the latest committed term.`
  },
  {
    id: 'vault-leader-election',
    title: 'Leader Election',
    folderPath: ['Distributed Systems', 'Consensus'],
    sessionId: 'session-cs-raft',
    tags: ['raft', 'election', 'distributed'],
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-13T10:05:00Z',
    content: `# Leader Election in Raft

How a distributed cluster dynamically chooses a leader when the active leader experiences failure.

---

## ⚡ Election Step-by-Step

1. **Heartbeat Timeout:** Follower election timer (150ms–300ms) expires without receiving \`AppendEntries\`.
2. **Term Increment:** Node increments its current term and transitions to **Candidate**.
3. **Vote Request:** Candidate votes for itself and broadcasts \`RequestVote\` RPCs.
4. **Majority Quorum:** Upon receiving votes from a majority of nodes, transitions to Leader in [[Raft Consensus Algorithm]].

> **Exam Tip:** Randomized election timers prevent split-vote deadlocks by ensuring one candidate times out first.`
  },

  // 4. Biology -> Cellular Biology
  {
    id: 'vault-cell-resp',
    title: 'Cellular Respiration & Metabolism',
    folderPath: ['Biology', 'Cellular Biology'],
    sessionId: 'session-bio-cell-resp',
    tags: ['biology', 'metabolism', 'atp', 'bio101'],
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-13T10:05:00Z',
    content: `# Cellular Respiration & ATP Synthesis

Catabolic biochemical pathway converting stored biochemical energy from nutrients into ATP.

$$C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + \\sim 30\\text{--}32\\text{ ATP}$$

---

## ⚡ Three Metabolic Stages Table

| Stage | Location | Inputs | Net ATP Yield |
| :--- | :--- | :--- | :--- |
| **[[Glycolysis]]** | Cytosol | Glucose, 2 NAD+, 2 ATP | $2\\text{ ATP} + 2\\text{ NADH}$ |
| **Krebs Cycle** | Mitochondrial Matrix | Acetyl-CoA, NAD+, FAD | $2\\text{ ATP} + 6\\text{ NADH} + 2\\text{ FADH}_2$ |
| **Oxidative Phosphorylation** | Inner Mitochondrial Membrane | NADH, $\\text{FADH}_2$, $O_2$ | $\\sim 26\\text{--}28\\text{ ATP}$ |`
  },
  {
    id: 'vault-glycolysis',
    title: 'Glycolysis',
    folderPath: ['Biology', 'Cellular Biology'],
    sessionId: 'session-bio-cell-resp',
    tags: ['biology', 'enzymes', 'cytoplasm'],
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-13T10:05:00Z',
    content: `# Glycolysis

Initial universal anaerobic phase of [[Cellular Respiration & Metabolism]] occurring in the cytoplasm.

---

## ⚡ Phases Breakdown

| Phase | Key Enzymes | Net Yield / Consumed |
| :--- | :--- | :--- |
| **Energy Investment** | Hexokinase, Phosphofructokinase-1 (PFK-1) | Consumes 2 ATP |
| **Energy Payoff** | Glyceraldehyde-3-phosphate dehydrogenase, Pyruvate kinase | Produces $4\\text{ ATP} + 2\\text{ NADH}$ |
| **Net Balance** | Cytosolic pathway | **$2\\text{ Pyruvate} + 2\\text{ ATP} + 2\\text{ NADH}$** |

---

## ✅ Revision Checklist
- [x] Memorize the net ATP and NADH yield of glycolysis
- [ ] Understand why PFK-1 is the rate-limiting committed step
- [ ] Connect pyruvate entry into mitochondrial matrix with the Krebs cycle`
  }
];
