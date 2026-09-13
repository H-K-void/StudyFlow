import { StudyFlowSession } from '../types';

export const SAMPLE_SESSIONS: StudyFlowSession[] = [
  {
    id: 'session-ds-trees-graphs',
    title: 'Trees and Graphs: Traversals & Algorithms',
    subject: 'Data Structures',
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-13T10:05:00Z',
    status: 'ready',
    material: {
      id: 'mat-ds-1',
      title: 'Trees and Graphs - Lecture Notes (CS201)',
      subject: 'Data Structures',
      sourceType: 'file',
      fileName: 'Lecture_07_Trees_and_Graphs.pptx',
      fileSize: '4.8 MB',
      content: `Lecture 07: Non-Linear Data Structures - Binary Search Trees and Graphs.
Key topics covered:
1. Binary Search Trees (BST): A rooted binary tree where for every node X, all elements in left subtree < X.val and right subtree > X.val. Average lookup, insertion, and deletion time is O(log N), while worst-case is O(N) when degenerate (skewed). Self-balancing trees (AVL, Red-Black) maintain O(log N) worst-case height.
2. Tree Traversals:
   - Inorder (Left, Root, Right): Yields elements in ascending sorted order for BSTs.
   - Preorder (Root, Left, Right): Useful for cloning or serializing trees.
   - Postorder (Left, Right, Root): Useful for tree deletion or bottom-up evaluations.
   - Level-Order (Breadth-First): Implemented using a FIFO Queue.
3. Graph Representations:
   - Adjacency Matrix: O(V^2) space, O(1) edge lookup. Best for dense graphs.
   - Adjacency List: O(V + E) space, optimal for sparse graphs.
4. Graph Search Algorithms:
   - Breadth-First Search (BFS): Uses a FIFO Queue to find shortest paths in unweighted graphs. Time: O(V + E).
   - Depth-First Search (DFS): Uses a Stack (or recursion) for cycle detection, topological sorting, and pathfinding. Time: O(V + E).
   - Dijkstra's Algorithm: Greedy shortest-path algorithm for graphs with non-negative weights using a Min-Priority Queue. Time: O((V + E) log V).`,
      wordCount: 220,
      readingTimeMinutes: 2,
      focusArea: 'exam_prep',
      createdAt: '2026-09-13T10:00:00Z'
    },
    notes: {
      id: 'notes-ds-1',
      title: 'Data Structures: Trees & Graphs Revision Guide',
      subject: 'Data Structures (CS201)',
      generatedDate: '2026-09-13T10:01:00Z',
      estimatedStudyTimeMinutes: 10,
      executiveSummary: 'Non-linear hierarchical data structures enable efficient searching and relationship modeling. BSTs provide O(log N) lookups when balanced; Inorder traversal visits BST nodes in sorted order. Graphs represent arbitrary relations using Adjacency Lists O(V+E) and are explored via BFS (shortest unweighted paths) and DFS (cycle detection & topological sorting).',
      coreConcepts: [
        {
          id: 'ds-c1',
          title: 'BST Properties & Inorder Sorting Invariant',
          importance: 'high-yield',
          summary: 'In any Binary Search Tree, an Inorder traversal (Left -> Node -> Right) strictly processes keys in ascending monotonic order.',
          bulletPoints: [
            'Search, Insert, Delete complexity: Average O(log N), Worst O(N) in degenerate linked-list trees.',
            'Balanced trees (AVL, Red-Black Trees) enforce height balancing to guarantee O(log N) worst-case.',
            'Successor of node X is the minimum element in its right subtree.'
          ],
          keyTakeaway: 'Always verify BST validity using range constraints (min < node.val < max), not just immediate child checks.'
        },
        {
          id: 'ds-c2',
          title: 'Graph Search: BFS vs. DFS',
          importance: 'high-yield',
          summary: 'BFS explores neighbor frontiers via a Queue; DFS explores branches to maximal depth using recursion/Stack.',
          bulletPoints: [
            'BFS guarantees shortest path in unweighted graphs. Time complexity: O(V + E), Space: O(V).',
            'DFS is optimal for cycle detection, connected components, and Topological Sort on DAGs.',
            'Always mark nodes as visited upon queueing/pushing to avoid infinite loops in cyclic graphs.'
          ],
          keyTakeaway: 'Adjacency list is preferred for sparse graphs where E << V^2.'
        },
        {
          id: 'ds-c3',
          title: 'Shortest Path Algorithms & Dijkstra',
          importance: 'core',
          summary: 'Dijkstra computes single-source shortest paths on non-negative weighted graphs in O((V + E) log V).',
          bulletPoints: [
            'Maintains a min-heap priority queue of known distances.',
            'Fails when edge weights can be negative (Bellman-Ford is required for negative weights).',
            'Relaxes edges greedily once each vertex distance is finalized.'
          ],
          keyTakeaway: 'Dijkstra greedily locks in the shortest distance to the next unvisited vertex.'
        }
      ],
      cheatSheet: [
        {
          id: 'ds-cs1',
          term: 'Inorder BST Traversal',
          type: 'principle',
          definition: 'Recursive Left-Root-Right traversal visiting nodes in strictly increasing sorted order.',
          formulaOrSyntax: 'void inorder(Node* n) { if(!n) return; inorder(n->left); print(n->val); inorder(n->right); }',
          contextOrUsage: 'Used to validate BST or retrieve elements in sorted order.'
        },
        {
          id: 'ds-cs2',
          term: 'BFS Time & Space Complexity',
          type: 'formula',
          definition: 'Graph exploration complexity using Adjacency List',
          formulaOrSyntax: 'Time: O(V + E)  |  Space: O(V) (Queue + Visited Set)',
          contextOrUsage: 'Guarantees minimum edge-count path in unweighted graphs.'
        },
        {
          id: 'ds-cs3',
          term: 'Adjacency List vs Matrix',
          type: 'term',
          definition: 'Matrix takes O(V^2) space with O(1) edge check; List takes O(V+E) space with O(deg(u)) neighbor iteration.',
          contextOrUsage: 'Use Matrix for dense graphs (E ≈ V^2); List for sparse graphs (E ≈ V).'
        }
      ],
      flashcards: [
        {
          id: 'fc-ds-1',
          front: 'What is the time complexity of searching a degenerate (unbalanced) BST with N nodes?',
          back: 'O(N) linear time, because the tree degenerates into a linked list.',
          category: 'Binary Search Trees'
        },
        {
          id: 'fc-ds-2',
          front: 'Which tree traversal produces keys in strictly ascending sorted order for a BST?',
          back: 'Inorder Traversal (Left, Root, Right).',
          category: 'Tree Traversals'
        },
        {
          id: 'fc-ds-3',
          front: 'Can Dijkstra\'s algorithm handle graphs with negative edge weights?',
          back: 'No. Dijkstra assumes once a vertex is visited, its shortest path is final. Use Bellman-Ford for negative weights.',
          category: 'Graph Algorithms'
        },
        {
          id: 'fc-ds-4',
          front: 'What data structure is utilized in Breadth-First Search (BFS)?',
          back: 'A FIFO Queue (First-In, First-Out).',
          category: 'Graph Traversals'
        }
      ],
      highYieldExamTips: [
        'Inorder traversal of BST = SORTED ARRAY. If an exam problem asks to find k-th smallest element, run Inorder!',
        'BFS uses a QUEUE for shortest paths; DFS uses a STACK/recursion for topological sorting & cycle detection.',
        'Dijkstra\'s algorithm requires NON-NEGATIVE edge weights.'
      ]
    },
    quiz: [
      {
        id: 'ds-q1',
        questionNumber: 1,
        prompt: 'Which tree traversal will output the nodes of a valid Binary Search Tree in strictly ascending sorted order?',
        options: [
          { id: 'A', text: 'Preorder traversal (Root, Left, Right)', explanation: 'Incorrect. Preorder visits root first, useful for cloning or serialization.' },
          { id: 'B', text: 'Inorder traversal (Left, Root, Right)', explanation: 'Correct! By definition of a BST, all left elements are smaller than root and right elements are larger. Left-Root-Right yields sorted order.' },
          { id: 'C', text: 'Postorder traversal (Left, Right, Root)', explanation: 'Incorrect. Postorder visits root last, useful for tree deallocation.' },
          { id: 'D', text: 'Level-order traversal (BFS)', explanation: 'Incorrect. Level-order explores row by row, not in sorted numerical order.' }
        ],
        correctOptionId: 'B',
        topicTag: 'Tree Traversals',
        difficulty: 'Foundation'
      },
      {
        id: 'ds-q2',
        questionNumber: 2,
        prompt: 'What is the worst-case time complexity of inserting an element into an unbalanced Binary Search Tree of N elements?',
        options: [
          { id: 'A', text: 'O(1)', explanation: 'Incorrect.' },
          { id: 'B', text: 'O(log N)', explanation: 'Incorrect. O(log N) is the average case or worst-case for self-balancing trees like AVL/Red-Black trees.' },
          { id: 'C', text: 'O(N)', explanation: 'Correct! If elements are inserted in already sorted order, the BST degenerates into a linear linked list of height N.' },
          { id: 'D', text: 'O(N log N)', explanation: 'Incorrect.' }
        ],
        correctOptionId: 'C',
        topicTag: 'BST Complexity',
        difficulty: 'Foundation'
      },
      {
        id: 'ds-q3',
        questionNumber: 3,
        prompt: 'Why is Breadth-First Search (BFS) guaranteed to find the shortest path between two vertices in an unweighted graph?',
        options: [
          { id: 'A', text: 'It sorts the edges by ascending weight using a min-heap.', explanation: 'Incorrect. Unweighted graphs do not require weight sorting.' },
          { id: 'B', text: 'It explores vertices level-by-level in order of their edge distance from the start node.', explanation: 'Correct! BFS uses a FIFO queue to visit all distance-1 nodes before distance-2 nodes, ensuring the first arrival at the target is the minimum edge path.' },
          { id: 'C', text: 'It backtracks whenever a cycle is detected.', explanation: 'Incorrect. Backtracking is a DFS property.' },
          { id: 'D', text: 'It only processes directed acyclic graphs (DAGs).', explanation: 'Incorrect. BFS works on any graph.' }
        ],
        correctOptionId: 'B',
        topicTag: 'Graph Search BFS',
        difficulty: 'Intermediate'
      },
      {
        id: 'ds-q4',
        questionNumber: 4,
        prompt: 'For a sparse graph with V = 100,000 vertices and E = 200,000 edges, which representation is significantly more space-efficient?',
        options: [
          { id: 'A', text: 'Adjacency Matrix, because it uses fixed arrays of size V × V.', explanation: 'Incorrect. An adjacency matrix requires 100,000^2 = 10 billion entries (~10GB memory), which is extremely wasteful for sparse graphs.' },
          { id: 'B', text: 'Adjacency List, because space is proportional to O(V + E) rather than O(V^2).', explanation: 'Correct! An adjacency list only stores existing edges, taking ~300,000 entries (O(V+E)) compared to 10 billion for a matrix.' },
          { id: 'C', text: 'Incidence Matrix', explanation: 'Incorrect.' },
          { id: 'D', text: 'Both representations require identical space complexity.', explanation: 'Incorrect.' }
        ],
        correctOptionId: 'B',
        topicTag: 'Graph Representations',
        difficulty: 'Intermediate'
      },
      {
        id: 'ds-q5',
        questionNumber: 5,
        prompt: 'Under which condition will Dijkstra\'s shortest path algorithm produce incorrect results?',
        options: [
          { id: 'A', text: 'When the graph contains undirected edges.', explanation: 'Incorrect. Dijkstra works seamlessly on undirected graphs by treating them as bidirectional.' },
          { id: 'B', text: 'When the graph contains negative edge weights.', explanation: 'Correct! Dijkstra assumes that adding edges can never decrease a path distance. Negative weights violate this greedy invariant.' },
          { id: 'C', text: 'When the graph has multiple disconnected components.', explanation: 'Incorrect. Disconnected vertices simply retain infinite distance.' },
          { id: 'D', text: 'When all edge weights are equal to 1.', explanation: 'Incorrect. Dijkstra works correctly on uniform weights (identical to BFS).' }
        ],
        correctOptionId: 'B',
        topicTag: 'Dijkstra Invariants',
        difficulty: 'Advanced'
      }
    ]
  },
  {
    id: 'session-cs-raft',
    title: 'Distributed Systems: Raft Consensus Protocol',
    subject: 'Distributed Systems',
    createdAt: '2026-09-10T14:30:00Z',
    updatedAt: '2026-09-10T14:35:00Z',
    status: 'completed',
    material: {
      id: 'mat-cs-1',
      title: 'Lecture 14 - Consensus, Leader Election, and Log Replication in Raft',
      subject: 'Distributed Systems',
      sourceType: 'file',
      fileName: 'Lecture_14_Raft_Consensus.pdf',
      fileSize: '3.2 MB',
      content: `In distributed systems, consensus is the fundamental problem of getting multiple machines to agree on a single value or state despite network partitions, delays, and node crashes. Ongaro and Ousterhout introduced Raft as an understandable consensus algorithm.

Raft decomposes consensus into three independent subproblems:
1. Leader Election: A single leader is elected among nodes via randomized election timeouts (typically 150-300ms) to prevent split votes. Nodes transition between three states: Follower, Candidate, and Leader. A candidate requires votes from a strict majority (e.g., 3 out of 5 nodes) to become leader.
2. Log Replication: The leader accepts log entries from clients, appends them to its local log, and propagates them to followers via AppendEntries RPCs. An entry is committed once replicated across a majority of nodes.
3. Safety: If any server has applied a particular log entry to its state machine, no other server may apply a different command for the same log index. This is enforced by the Leader Completeness property: a node only votes for a candidate whose log is at least as up-to-date as its own (measured by term and log index).`,
      wordCount: 248,
      readingTimeMinutes: 2,
      focusArea: 'exam_prep',
      createdAt: '2026-09-10T14:30:00Z'
    },
    notes: {
      id: 'notes-cs-1',
      title: 'Raft Consensus Protocol: High-Yield Revision Guide',
      subject: 'Distributed Systems',
      generatedDate: '2026-09-10T14:31:00Z',
      estimatedStudyTimeMinutes: 12,
      executiveSummary: 'Raft solves distributed state-machine consensus by electing a strong single leader responsible for log management. Consensus requires majority quorum (N/2 + 1) across 3 decoupled pillars: Leader Election, Log Replication, and Election Safety.',
      coreConcepts: [
        {
          id: 'c-1',
          title: 'Three Server States & State Transitions',
          importance: 'core',
          summary: 'At any given moment, each Raft node is either a Follower, Candidate, or Leader.',
          bulletPoints: [
            'Follower: Passive, responds to incoming RPCs; starts election if election timeout elapses.',
            'Candidate: Increments term, votes for self, sends RequestVote RPCs to all peers.',
            'Leader: Coordinates log replication, and dispatches periodic empty AppendEntries heartbeats.'
          ],
          keyTakeaway: 'Split votes are prevented via randomized election timeouts (150ms-300ms).'
        },
        {
          id: 'c-2',
          title: 'Quorum & Majority Commit Rule',
          importance: 'high-yield',
          summary: 'A cluster of N nodes can tolerate at most floor((N-1)/2) crash failures.',
          bulletPoints: [
            'For a 5-node cluster, a quorum requires >= 3 nodes (2 crash tolerance).',
            'Log entries are committed when written to non-volatile disk on a majority of nodes.',
            'Uncommitted entries can be overwritten, but committed entries are permanent.'
          ],
          keyTakeaway: 'Strict majority overlap guarantees at least one overlapping node between any two quorums.'
        }
      ],
      cheatSheet: [
        {
          id: 'cs-1',
          term: 'Quorum Formula',
          type: 'formula',
          definition: 'Minimum nodes required for agreement and leader election',
          formulaOrSyntax: 'Quorum = floor(N / 2) + 1  |  Fault Tolerance F = floor((N - 1) / 2)',
          contextOrUsage: 'For N=5: Quorum=3, Fault Tolerance=2.'
        }
      ],
      flashcards: [
        {
          id: 'fc-1',
          front: 'What mechanism prevents split-vote deadlocks during Raft leader election?',
          back: 'Randomized election timeouts (e.g., 150ms–300ms) stagger election attempts so one node initiates and gathers votes first.',
          category: 'Leader Election'
        }
      ],
      highYieldExamTips: [
        'Watch out: In Raft, log entries flow ONLY from leader to followers.',
        'A candidate only needs a strict majority (N/2 + 1), not consensus from all active nodes.'
      ]
    },
    quiz: [
      {
        id: 'q-1',
        questionNumber: 1,
        prompt: 'In a 5-node Raft cluster where 2 nodes have crashed, what happens when a client sends a write request?',
        options: [
          { id: 'A', text: 'The cluster halts write processing completely.', explanation: 'Incorrect.' },
          { id: 'B', text: 'The write succeeds because the remaining 3 nodes form a valid majority quorum (3/5).', explanation: 'Correct! For N=5, majority quorum is 3. Since 3 nodes are alive, operations proceed normally.' },
          { id: 'C', text: 'The write is buffered in RAM but cannot be committed.', explanation: 'Incorrect.' },
          { id: 'D', text: 'A split-brain occurs automatically.', explanation: 'Incorrect.' }
        ],
        correctOptionId: 'B',
        topicTag: 'Quorum & Availability',
        difficulty: 'Foundation'
      },
      {
        id: 'q-2',
        questionNumber: 2,
        prompt: 'Why are randomized election timeouts used during the Leader Election phase?',
        options: [
          { id: 'A', text: 'To encrypt vote messages with random keys.', explanation: 'Incorrect.' },
          { id: 'B', text: 'To break symmetry and prevent repeated split votes where no candidate achieves a majority.', explanation: 'Correct! Randomized timeouts stagger election triggers.' },
          { id: 'C', text: 'To allow followers to write directly to disk.', explanation: 'Incorrect.' },
          { id: 'D', text: 'To balance network traffic.', explanation: 'Incorrect.' }
        ],
        correctOptionId: 'B',
        topicTag: 'Leader Election',
        difficulty: 'Foundation'
      },
      {
        id: 'q-3',
        questionNumber: 3,
        prompt: 'Under what condition will a follower node REJECT a RequestVote RPC from a candidate?',
        options: [
          { id: 'A', text: 'If candidate term is higher.', explanation: 'Incorrect.' },
          { id: 'B', text: 'If the voter\'s local log is more up-to-date (higher term, or same term with longer index) than candidate\'s log.', explanation: 'Correct! Leader Completeness requires voters to reject candidates with older logs.' },
          { id: 'C', text: 'If the candidate has only 1 log entry.', explanation: 'Incorrect.' },
          { id: 'D', text: 'If election timer has not expired.', explanation: 'Incorrect.' }
        ],
        correctOptionId: 'B',
        topicTag: 'Election Safety',
        difficulty: 'Intermediate'
      },
      {
        id: 'q-4',
        questionNumber: 4,
        prompt: 'When is a log entry considered "committed" in Raft?',
        options: [
          { id: 'A', text: 'As soon as the leader receives client request.', explanation: 'Incorrect.' },
          { id: 'B', text: 'When 100% of nodes acknowledge.', explanation: 'Incorrect.' },
          { id: 'C', text: 'Once it has been replicated on a strict majority of servers by the leader of the current term.', explanation: 'Correct! Majority replication under current term confirms safety.' },
          { id: 'D', text: 'When heartbeat interval triggers.', explanation: 'Incorrect.' }
        ],
        correctOptionId: 'C',
        topicTag: 'Log Replication',
        difficulty: 'Intermediate'
      },
      {
        id: 'q-5',
        questionNumber: 5,
        prompt: 'A network partition divides a 5-node cluster into partition X (2 nodes) and partition Y (3 nodes). What will happen?',
        options: [
          { id: 'A', text: 'Both partitions continue committing writes.', explanation: 'Incorrect.' },
          { id: 'B', text: 'Partition Y can elect a leader and commit writes; Partition X cannot elect a leader or commit writes.', explanation: 'Correct! Partition Y has majority (3 >= 3), Partition X has minority (2 < 3).' },
          { id: 'C', text: 'The entire cluster halts.', explanation: 'Incorrect.' },
          { id: 'D', text: 'Partition X will corrupt Partition Y.', explanation: 'Incorrect.' }
        ],
        correctOptionId: 'B',
        topicTag: 'Network Partitions',
        difficulty: 'Advanced'
      }
    ]
  },
  {
    id: 'session-bio-respiration',
    title: 'Cellular Respiration & ATP Synthesis',
    subject: 'Molecular Biology',
    createdAt: '2026-09-11T09:15:00Z',
    updatedAt: '2026-09-11T09:20:00Z',
    status: 'ready',
    material: {
      id: 'mat-bio-1',
      title: 'Chapter 9: Glycolysis and Oxidative Phosphorylation',
      subject: 'Molecular Biology',
      sourceType: 'file',
      fileName: 'Bio101_Lecture09_Respiration.docx',
      fileSize: '2.1 MB',
      content: `Cellular respiration is the catabolic pathway by which organic molecules (primarily glucose) are oxidized to produce ATP. Net equation: C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + 30-32 ATP.
1. Glycolysis: In cytoplasm. 1 glucose -> 2 pyruvate + 2 net ATP + 2 NADH (anaerobic).
2. Pyruvate Oxidation: Pyruvate -> Acetyl-CoA + 1 NADH + CO2 in mitochondrial matrix.
3. Krebs Cycle: Generates 2 ATP/GTP, 6 NADH, 2 FADH2, 4 CO2 per glucose.
4. Oxidative Phosphorylation: Electron transport chain pumps protons into intermembrane space; ATP Synthase synthesizes ~26-28 ATP via chemiosmosis.`,
      wordCount: 150,
      readingTimeMinutes: 1,
      focusArea: 'comprehensive',
      createdAt: '2026-09-11T09:15:00Z'
    },
    notes: {
      id: 'notes-bio-1',
      title: 'Cellular Respiration & ATP Synthesis Summary',
      subject: 'Molecular Biology',
      generatedDate: '2026-09-11T09:16:00Z',
      estimatedStudyTimeMinutes: 10,
      executiveSummary: 'Cellular respiration oxidizes 1 glucose into ~30-32 ATP across 4 sequential stages. Glycolysis happens in cytoplasm (anaerobic); Krebs Cycle and Oxidative Phosphorylation occur within mitochondria where the proton gradient powers ATP Synthase.',
      coreConcepts: [
        {
          id: 'bio-c1',
          title: 'Substrate-Level vs. Oxidative Phosphorylation',
          importance: 'high-yield',
          summary: 'Substrate-level phosphorylation directly transfers phosphate (Glycolysis, Krebs). Oxidative phosphorylation uses the ETC proton gradient for ~90% of ATP synthesis.',
          bulletPoints: [
            '1 NADH generates ~2.5 ATP via Complex I.',
            '1 FADH2 enters at Complex II, yielding ~1.5 ATP.',
            'Oxygen is the terminal electron acceptor forming H2O.'
          ],
          keyTakeaway: 'Chemiosmosis across the inner mitochondrial membrane drives ATP Synthase.'
        }
      ],
      cheatSheet: [
        {
          id: 'bio-cs1',
          term: 'Respiration Equation',
          type: 'formula',
          definition: 'Overall cellular balance',
          formulaOrSyntax: 'C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + 30-32 ATP',
          contextOrUsage: 'Glucose is oxidized to CO2; O2 is reduced to H2O.'
        }
      ],
      flashcards: [
        {
          id: 'fc-bio-1',
          front: 'Where does Glycolysis occur, and does it require O2?',
          back: 'In the cytoplasm; completely anaerobic.',
          category: 'Localization'
        }
      ],
      highYieldExamTips: [
        'Glycolysis is in CYTOSOL; Krebs is in MATRIX; ETC is in INNER MEMBRANE.'
      ]
    },
    quiz: [
      {
        id: 'bio-q1',
        questionNumber: 1,
        prompt: 'Which stage of cellular respiration produces the greatest net quantity of ATP per glucose molecule?',
        options: [
          { id: 'A', text: 'Glycolysis', explanation: 'Yields only 2 ATP.' },
          { id: 'B', text: 'Pyruvate Oxidation', explanation: 'Produces 0 direct ATP.' },
          { id: 'C', text: 'Krebs Cycle', explanation: 'Produces 2 ATP/GTP.' },
          { id: 'D', text: 'Oxidative Phosphorylation', explanation: 'Correct! Produces ~26-28 ATP (~90% of total).' }
        ],
        correctOptionId: 'D',
        topicTag: 'ATP Yield',
        difficulty: 'Foundation'
      },
      {
        id: 'bio-q2',
        questionNumber: 2,
        prompt: 'If Complex IV is poisoned, what immediate effect occurs?',
        options: [
          { id: 'A', text: 'Oxygen consumption ceases and proton pumping stops.', explanation: 'Correct! Complex IV delivers electrons to O2.' },
          { id: 'B', text: 'Glycolysis rate drops to zero.', explanation: 'Incorrect.' },
          { id: 'C', text: 'ATP synthase spins in reverse.', explanation: 'Incorrect.' },
          { id: 'D', text: 'Glucose enters Krebs directly.', explanation: 'Incorrect.' }
        ],
        correctOptionId: 'A',
        topicTag: 'ETC Inhibitors',
        difficulty: 'Intermediate'
      },
      {
        id: 'bio-q3',
        questionNumber: 3,
        prompt: 'Why does 1 mole of FADH2 yield fewer ATPs than 1 mole of NADH?',
        options: [
          { id: 'A', text: 'Cannot enter mitochondria.', explanation: 'Incorrect.' },
          { id: 'B', text: 'FADH2 donates electrons at Complex II, skipping the proton-pumping Complex I.', explanation: 'Correct! Fewer protons are pumped.' },
          { id: 'C', text: 'Transfers electrons without cytochromes.', explanation: 'Incorrect.' },
          { id: 'D', text: 'Requires ATP activation.', explanation: 'Incorrect.' }
        ],
        correctOptionId: 'B',
        topicTag: 'Energetics',
        difficulty: 'Intermediate'
      },
      {
        id: 'bio-q4',
        questionNumber: 4,
        prompt: 'Where are protons accumulated to establish the electrochemical gradient?',
        options: [
          { id: 'A', text: 'Matrix', explanation: 'Incorrect.' },
          { id: 'B', text: 'Mitochondrial intermembrane space', explanation: 'Correct! Protons are pumped between the inner and outer membranes.' },
          { id: 'C', text: 'Cytosol', explanation: 'Incorrect.' },
          { id: 'D', text: 'Endoplasmic reticulum', explanation: 'Incorrect.' }
        ],
        correctOptionId: 'B',
        topicTag: 'Cell Anatomy',
        difficulty: 'Foundation'
      },
      {
        id: 'bio-q5',
        questionNumber: 5,
        prompt: 'During anaerobic exercise in muscle cells, pyruvate is reduced into:',
        options: [
          { id: 'A', text: 'Ethanol and CO2', explanation: 'Incorrect (yeast fermentation).' },
          { id: 'B', text: 'Lactate, regenerating NAD+ for glycolysis', explanation: 'Correct! Lactate dehydrogenase reduces pyruvate to lactate to regenerate NAD+.' },
          { id: 'C', text: 'Acetyl-CoA', explanation: 'Incorrect.' },
          { id: 'D', text: 'Oxaloacetate', explanation: 'Incorrect.' }
        ],
        correctOptionId: 'B',
        topicTag: 'Fermentation',
        difficulty: 'Advanced'
      }
    ]
  }
];
