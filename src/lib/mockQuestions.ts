// Computer Science Quiz Questions - 15 questions per category
// Categories: Data Structures & Algorithms, Database, Operating Systems, Networks

import { QuizQuestion } from '@/lib/types';

export const mockQuizQuestions: Record<string, QuizQuestion[]> = {
  ds_algo: [
    // Arrays & Strings
    {
      id: 'ds-1',
      category: 'ds_algo',
      question: 'What is the time complexity of accessing an element in an array by index?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5,
      hint: 'Arrays use contiguous memory, allowing direct access via an offset.'
    },
    {
      id: 'ds-2',
      category: 'ds_algo',
      question: 'Which data structure uses LIFO (Last In First Out) principle?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5,
      hint: 'Think about a stack of trays in a cafeteria.'
    },
    {
      id: 'ds-3',
      category: 'ds_algo',
      question: 'What is the worst-case time complexity of QuickSort?',
      options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'ds-4',
      category: 'ds_algo',
      question: 'Which tree traversal visits the root node first?',
      options: ['Inorder', 'Preorder', 'Postorder', 'Level-order'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'ds-5',
      category: 'ds_algo',
      question: 'What is the space complexity of Merge Sort?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'ds-6',
      category: 'ds_algo',
      question: 'In a max heap, where is the largest element?',
      options: ['At a leaf node', 'At the root', 'In the middle', 'Randomly placed'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'ds-7',
      category: 'ds_algo',
      question: 'Which sorting algorithm has best average time complexity?',
      options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'ds-8',
      category: 'ds_algo',
      question: 'What is the time complexity of searching in a balanced BST?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'ds-9',
      category: 'ds_algo',
      question: 'Which data structure is used for BFS (Breadth-First Search)?',
      options: ['Stack', 'Queue', 'Heap', 'Array'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'ds-10',
      category: 'ds_algo',
      question: 'What is the best case time complexity of linear search?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'ds-11',
      category: 'ds_algo',
      question: 'Which of these is NOT a stable sorting algorithm?',
      options: ['Merge Sort', 'Insertion Sort', 'Quick Sort', 'Bubble Sort'],
      correctAnswer: 2,
      difficulty: 'hard',
      points: 5
    },
    {
      id: 'ds-12',
      category: 'ds_algo',
      question: 'What is a hash collision?',
      options: [
        'When two different keys map to the same hash value',
        'When hash function returns null',
        'When hash table is full',
        'When key is not found'
      ],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'ds-13',
      category: 'ds_algo',
      question: 'In dynamic programming, what does memoization mean?',
      options: [
        'Memorizing the algorithm',
        'Storing results of expensive function calls',
        'Writing down the problem',
        'Creating a state diagram'
      ],
      correctAnswer: 1,
      difficulty: 'hard',
      points: 5
    },
    {
      id: 'ds-14',
      category: 'ds_algo',
      question: 'What is the maximum number of nodes in a binary tree of height h?',
      options: ['2^h', '2^h - 1', '2^(h+1) - 1', 'h²'],
      correctAnswer: 2,
      difficulty: 'hard',
      points: 5
    },
    {
      id: 'ds-15',
      category: 'ds_algo',
      question: 'Which graph algorithm finds the shortest path in weighted graphs?',
      options: ['DFS', 'BFS', 'Dijkstra\'s Algorithm', 'Kruskal\'s Algorithm'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5
    }
  ],

  database: [
    {
      id: 'db-1',
      category: 'database',
      question: 'What does ACID stand for in database transactions?',
      options: [
        'Atomicity, Consistency, Isolation, Durability',
        'Accuracy, Completeness, Integrity, Duration',
        'Association, Consistency, Isolation, Data',
        'Atomicity, Completeness, Integrity, Durability'
      ],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 5,
      hint: 'A is for Atomicity, ensuring all or nothing execution.'
    },
    {
      id: 'db-2',
      category: 'database',
      question: 'Which normal form eliminates transitive dependencies?',
      options: ['1NF', '2NF', '3NF', 'BCNF'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5,
      hint: 'It follows 2NF and removes functional dependencies between non-key columns.'
    },
    {
      id: 'db-3',
      category: 'database',
      question: 'What type of JOIN returns all rows when there is a match in either table?',
      options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
      correctAnswer: 3,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'db-4',
      category: 'database',
      question: 'What is a primary key?',
      options: [
        'A key that can be null',
        'A unique identifier for a record',
        'A foreign key reference',
        'A composite key'
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'db-5',
      category: 'database',
      question: 'Which SQL clause is used to filter grouped results?',
      options: ['WHERE', 'FILTER', 'HAVING', 'GROUP BY'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'db-6',
      category: 'database',
      question: 'What is denormalization?',
      options: [
        'Removing normalization rules',
        'Adding redundant data to improve read performance',
        'Deleting unused tables',
        'Creating backups'
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'db-7',
      category: 'database',
      question: 'Which constraint ensures column values are unique?',
      options: ['PRIMARY KEY', 'UNIQUE', 'CHECK', 'FOREIGN KEY'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'db-8',
      category: 'database',
      question: 'What is the purpose of an INDEX in a database?',
      options: [
        'To store data',
        'To speed up data retrieval',
        'To create relationships',
        'To backup data'
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'db-9',
      category: 'database',
      question: 'What does SQL stand for?',
      options: [
        'Standard Query Language',
        'Structured Query Language',
        'Simple Question Language',
        'Sequential Query Language'
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'db-10',
      category: 'database',
      question: 'Which command is used to remove a table from database?',
      options: ['DELETE', 'REMOVE', 'DROP', 'TRUNCATE'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'db-11',
      category: 'database',
      question: 'What is a foreign key?',
      options: [
        'A key from another database',
        'A reference to a primary key in another table',
        'An encrypted key',
        'A backup key'
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'db-12',
      category: 'database',
      question: 'Which isolation level prevents dirty reads?',
      options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
      correctAnswer: 1,
      difficulty: 'hard',
      points: 5
    },
    {
      id: 'db-13',
      category: 'database',
      question: 'What is a database view?',
      options: [
        'A physical table',
        'A virtual table based on a query',
        'A backup copy',
        'An index'
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'db-14',
      category: 'database',
      question: 'Which type of database uses collections and documents?',
      options: ['Relational', 'NoSQL (MongoDB)', 'Graph', 'Hierarchical'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'db-15',
      category: 'database',
      question: 'What does TRUNCATE TABLE do?',
      options: [
        'Deletes specific rows',
        'Removes all rows but keeps structure',
        'Drops the table',
        'Adds a column'
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    }
  ],

  os: [
    {
      id: 'os-1',
      category: 'os',
      question: 'Which scheduling algorithm can cause starvation?',
      options: ['FCFS', 'Round Robin', 'Priority Scheduling', 'SJF'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5,
      hint: 'Low-priority processes may wait indefinitely if higher-priority ones keep arriving.'
    },
    {
      id: 'os-2',
      category: 'os',
      question: 'Which memory allocation technique causes external fragmentation?',
      options: ['Paging', 'Segmentation', 'Both', 'Neither'],
      correctAnswer: 1,
      difficulty: 'hard',
      points: 5,
      hint: 'It occurs when variable-sized partitions are allocated, leaving small unusable gaps between them.'
    },
    {
      id: 'os-3',
      category: 'os',
      question: 'What is a deadlock?',
      options: [
        'A crashed process',
        'Two or more processes waiting for each other indefinitely',
        'A terminated thread',
        'A locked file'
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'os-4',
      category: 'os',
      question: 'Which state comes after "Ready" in the process lifecycle?',
      options: ['New', 'Running', 'Waiting', 'Terminated'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'os-5',
      category: 'os',
      question: 'What is thrashing in virtual memory?',
      options: [
        'Excessive page swapping',
        'Memory corruption',
        'CPU overheating',
        'Disk failure'
      ],
      correctAnswer: 0,
      difficulty: 'hard',
      points: 5
    },
    {
      id: 'os-6',
      category: 'os',
      question: 'What does a semaphore do?',
      options: [
        'Allocates memory',
        'Controls access to shared resources',
        'Schedules processes',
        'Manages files'
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'os-7',
      category: 'os',
      question: 'Which of these is a preemptive scheduling algorithm?',
      options: ['FCFS', 'SJF', 'Round Robin', 'Priority (non-preemptive)'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'os-8',
      category: 'os',
      question: 'What is the main advantage of multithreading?',
      options: [
        'Increased power consumption',
        'Better resource utilization',
        'Simplified code',
        'Reduced memory usage'
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'os-9',
      category: 'os',
      question: 'What does the "fork()" system call do?',
      options: [
        'Terminates a process',
        'Creates a new process',
        'Allocates memory',
        'Opens a file'
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'os-10',
      category: 'os',
      question: 'What is a context switch?',
      options: [
        'Switching between user and kernel mode',
        'Saving and loading process state',
        'Changing memory address',
        'Updating file permissions'
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'os-11',
      category: 'os',
      question: 'Which page replacement algorithm may suffer from Belady\'s anomaly?',
      options: ['LRU', 'FIFO', 'Optimal', 'LFU'],
      correctAnswer: 1,
      difficulty: 'hard',
      points: 5
    },
    {
      id: 'os-12',
      category: 'os',
      question: 'What is a critical section?',
      options: [
        'Important code',
        'Code that accesses shared resources',
        'Error handling code',
        'Main function'
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'os-13',
      category: 'os',
      question: 'Which memory management technique divides memory into fixed-size blocks?',
      options: ['Segmentation', 'Paging', 'Dynamic allocation', 'Heap allocation'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'os-14',
      category: 'os',
      question: 'What is a mutex?',
      options: [
        'A type of memory',
        'A mutual exclusion lock',
        'A scheduling algorithm',
        'A file system'
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'os-15',
      category: 'os',
      question: 'What happens during a page fault?',
      options: [
        'System crashes',
        'Required page is not in memory',
        'Disk fails',
        'CPU overheats'
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    }
  ],

  networks: [
    {
      id: 'net-1',
      category: 'networks',
      question: 'Which layer of the OSI model handles routing?',
      options: ['Physical', 'Data Link', 'Network', 'Transport'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5,
      hint: 'This layer is responsible for packet forwarding and path determination.'
    },
    {
      id: 'net-2',
      category: 'networks',
      question: 'What is the default port for HTTPS?',
      options: ['80', '443', '8080', '22'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5,
      hint: 'It is the secure version of port 80.'
    },
    {
      id: 'net-3',
      category: 'networks',
      question: 'Which protocol is connectionless?',
      options: ['TCP', 'UDP', 'HTTP', 'FTP'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'net-4',
      category: 'networks',
      question: 'What does DNS stand for?',
      options: [
        'Dynamic Network System',
        'Domain Name System',
        'Data Network Service',
        'Digital Name Server'
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'net-5',
      category: 'networks',
      question: 'Which topology has a single point of failure at the central hub?',
      options: ['Bus', 'Ring', 'Star', 'Mesh'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'net-6',
      category: 'networks',
      question: 'What is the purpose of ARP protocol?',
      options: [
        'Assigns IP addresses',
        'Maps IP address to MAC address',
        'Routes packets',
        'Encrypts data'
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'net-7',
      category: 'networks',
      question: 'Which HTTP method is used to update a resource?',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'net-8',
      category: 'networks',
      question: 'What does NAT stand for?',
      options: [
        'Network Address Translation',
        'Node Access Technology',
        'Network Application Transfer',
        'New Access Terminal'
      ],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'net-9',
      category: 'networks',
      question: 'Which layer adds error checking to frames?',
      options: ['Physical', 'Data Link', 'Network', 'Transport'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'net-10',
      category: 'networks',
      question: 'What is the subnet mask for a /24 network?',
      options: ['255.255.0.0', '255.255.255.0', '255.0.0.0', '255.255.255.255'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'net-11',
      category: 'networks',
      question: 'Which protocol is used for secure file transfer?',
      options: ['FTP', 'HTTP', 'SFTP', 'SMTP'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'net-12',
      category: 'networks',
      question: 'What is a MAC address?',
      options: [
        'A logical address',
        'A physical hardware address',
        'An IP address',
        'A port number'
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'net-13',
      category: 'networks',
      question: 'Which routing protocol uses distance vector algorithm?',
      options: ['OSPF', 'RIP', 'BGP', 'EIGRP'],
      correctAnswer: 1,
      difficulty: 'hard',
      points: 5
    },
    {
      id: 'net-14',
      category: 'networks',
      question: 'What is the maximum size of a TCP packet?',
      options: ['64 KB', '1500 bytes', '65535 bytes', '1 MB'],
      correctAnswer: 2,
      difficulty: 'hard',
      points: 5
    },
    {
      id: 'net-15',
      category: 'networks',
      question: 'Which protocol provides email delivery?',
      options: ['HTTP', 'FTP', 'SMTP', 'SNMP'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    }
  ],

  math: [
    {
      id: 'math-1',
      category: 'math',
      question: 'What is the derivative of x²?',
      options: ['x', '2x', '2', 'x²'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'math-2',
      category: 'math',
      question: 'What is the value of Pi to two decimal places?',
      options: ['3.14', '3.12', '3.16', '3.18'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'math-3',
      category: 'math',
      question: 'Solve for x: 2x + 5 = 15',
      options: ['5', '10', '2.5', '7.5'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'math-4',
      category: 'math',
      question: 'What is the area of a circle with radius r?',
      options: ['2πr', 'πr²', '2πr²', 'πd'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'math-5',
      category: 'math',
      question: 'What is the square root of 144?',
      options: ['10', '11', '12', '14'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'math-6',
      category: 'math',
      question: 'What is sin(90°)?',
      options: ['0', '1', '-1', '0.5'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'math-7',
      category: 'math',
      question: 'If a triangle has sides 3, 4, and 5, is it a right-angled triangle?',
      options: ['Yes', 'No', 'Maybe', 'Depends on angles'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'math-8',
      category: 'math',
      question: 'What is the sum of angles in a triangle?',
      options: ['180°', '360°', '90°', '270°'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    }
  ],

  aptitude: [
    {
      id: 'apt-1',
      category: 'aptitude',
      question: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
      options: ['(1/3)', '(1/8)', '(2/8)', '(1/16)'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'apt-2',
      category: 'aptitude',
      question: 'Which word does NOT belong with the others?',
      options: ['Index', 'Glossary', 'Chapter', 'Book'],
      correctAnswer: 3,
      difficulty: 'easy',
      points: 5,
      hint: 'Book is the whole, others are parts.'
    },
    {
      id: 'apt-3',
      category: 'aptitude',
      question: 'CUP : LIP :: BIRD : ?',
      options: ['GRASS', 'FOREST', 'BEAK', 'BUSH'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'apt-4',
      category: 'aptitude',
      question: 'Pointing to a photograph of a boy Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
      options: ['Brother', 'Uncle', 'Cousin', 'Father'],
      correctAnswer: 3,
      difficulty: 'hard',
      points: 5
    },
    {
      id: 'apt-5',
      category: 'aptitude',
      question: 'If A = 1, B = 2, C = 3, what is the value of BED?',
      options: ['7', '8', '9', '10'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'apt-6',
      category: 'aptitude',
      question: 'A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?',
      options: ['120 metres', '180 metres', '324 metres', '150 metres'],
      correctAnswer: 3,
      difficulty: 'hard',
      points: 5
    },
    {
      id: 'apt-7',
      category: 'aptitude',
      question: 'Find the odd one out.',
      options: ['Sphere', 'Circle', 'Triangle', 'Square'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 5,
      hint: 'Sphere is 3D, others are 2D.'
    }
  ],

  grammar: [
    {
      id: 'eng-1',
      category: 'grammar',
      question: 'Identify the synonym of "Happy".',
      options: ['Sad', 'Joyful', 'Angry', 'Tired'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'eng-2',
      category: 'grammar',
      question: 'Which sentence is grammatically correct?',
      options: ['She don\'t know.', 'She doesn\'t know.', 'She not know.', 'She no know.'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'eng-3',
      category: 'grammar',
      question: 'Choose the correct preposition: "The book is ___ the table."',
      options: ['in', 'at', 'on', 'to'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'eng-4',
      category: 'grammar',
      question: 'What is the past tense of "Go"?',
      options: ['Goed', 'Gone', 'Went', 'Going'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'eng-5',
      category: 'grammar',
      question: 'Identify the adjective: "The red car is fast."',
      options: ['The', 'Red', 'Car', 'Is'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'eng-6',
      category: 'grammar',
      question: 'Choose the correct article: "___ apple a day keeps the doctor away."',
      options: ['A', 'An', 'The', 'No article'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'eng-7',
      category: 'grammar',
      question: 'What is the antonym of "Brave"?',
      options: ['Cowardly', 'Strong', 'Bold', 'Courageous'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 5
    }
  ],

  programming: [
    {
      id: 'prog-1',
      category: 'programming',
      question: 'Which of these is a valid variable declaration in JavaScript?',
      options: ['var x = 5;', 'int x = 5;', 'variable x = 5;', 'dim x = 5;'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'prog-2',
      category: 'programming',
      question: 'What does HTML stand for?',
      options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Mode Language', 'Home Tool Markup Language'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'prog-3',
      category: 'programming',
      question: 'Which loop is guaranteed to execute at least once?',
      options: ['for', 'while', 'do-while', 'foreach'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'prog-4',
      category: 'programming',
      question: 'What is the index of the first element in an array?',
      options: ['1', '0', '-1', 'Depends on language'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'prog-5',
      category: 'programming',
      question: 'Which symbol is used for single-line comments in C++?',
      options: ['//', '/*', '#', '--'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'prog-6',
      category: 'programming',
      question: 'What is the result of 1 + "1" in JavaScript?',
      options: ['2', '"11"', 'Error', 'NaN'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'prog-7',
      category: 'programming',
      question: 'Which data structure follows FIFO?',
      options: ['Stack', 'Queue', 'Tree', 'Graph'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    }
  ]
};

export function getMockQuestions(category: string): QuizQuestion[] {
  const questions = mockQuizQuestions[category] || [];
  // Return all 15 questions in random order
  return [...questions].sort(() => Math.random() - 0.5);
}
