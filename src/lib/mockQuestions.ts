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
  ],
  physics: [
    {
      id: 'phys-1',
      category: 'physics',
      question: 'What is the SI unit of force?',
      options: ['Watt', 'Joule', 'Newton', 'Pascal'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'phys-2',
      category: 'physics',
      question: 'Which law states that for every action, there is an equal and opposite reaction?',
      options: ['Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Law of Conservation of Momentum'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'phys-3',
      category: 'physics',
      question: 'What is the speed of light in vacuum?',
      options: ['3 x 10^8 m/s', '3 x 10^6 m/s', '3 x 10^5 km/h', '3000 m/s'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'phys-4',
      category: 'physics',
      question: 'What is the unit of electrical resistance?',
      options: ['Ampere', 'Volt', 'Ohm', 'Watt'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'phys-5',
      category: 'physics',
      question: 'Who proposed the theory of relativity?',
      options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Nikola Tesla'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'phys-6',
      category: 'physics',
      question: 'What is the phenomenon of bending of light when it passes from one medium to another?',
      options: ['Reflection', 'Refraction', 'Diffraction', 'Dispersion'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'phys-7',
      category: 'physics',
      question: 'Which particle has a negative charge?',
      options: ['Proton', 'Neutron', 'Electron', 'Photon'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'phys-8',
      category: 'physics',
      question: 'What is the energy possessed by a body due to its motion?',
      options: ['Potential Energy', 'Kinetic Energy', 'Thermal Energy', 'Chemical Energy'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'phys-9',
      category: 'physics',
      question: 'What is the value of acceleration due to gravity on Earth?',
      options: ['9.8 m/s^2', '10.5 m/s^2', '8.9 m/s^2', '9.2 m/s^2'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'phys-10',
      category: 'physics',
      question: 'Which instrument is used to measure atmospheric pressure?',
      options: ['Thermometer', 'Barometer', 'Hygrometer', 'Anemometer'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'phys-11',
      category: 'physics',
      question: 'What is the frequency of AC mains in India?',
      options: ['50 Hz', '60 Hz', '100 Hz', '220 Hz'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'phys-12',
      category: 'physics',
      question: 'Which color has the longest wavelength in the visible spectrum?',
      options: ['Violet', 'Blue', 'Green', 'Red'],
      correctAnswer: 3,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'phys-13',
      category: 'physics',
      question: 'What is the escape velocity from Earth?',
      options: ['11.2 km/s', '9.8 km/s', '7.9 km/s', '15 km/s'],
      correctAnswer: 0,
      difficulty: 'hard',
      points: 15
    },
    {
      id: 'phys-14',
      category: 'physics',
      question: 'Which physical quantity is measured in Candelas?',
      options: ['Luminous Intensity', 'Magnetic Flux', 'Electric Current', 'Force'],
      correctAnswer: 0,
      difficulty: 'hard',
      points: 10
    },
    {
      id: 'phys-15',
      category: 'physics',
      question: 'What is the working principle of an optical fiber?',
      options: ['Refraction', 'Scattering', 'Total Internal Reflection', 'Interference'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 10
    }
  ],
  chemistry: [
    {
      id: 'chem-1',
      category: 'chemistry',
      question: 'What is the chemical symbol for Gold?',
      options: ['Ag', 'Au', 'Fe', 'Cu'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'chem-2',
      category: 'chemistry',
      question: 'Which gas is most abundant in the Earth\'s atmosphere?',
      options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'chem-3',
      category: 'chemistry',
      question: 'What is the pH of pure water?',
      options: ['5', '6', '7', '8'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'chem-4',
      category: 'chemistry',
      question: 'What is the chemical formula for table salt?',
      options: ['NaCl', 'KCl', 'NaOH', 'HCl'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'chem-5',
      category: 'chemistry',
      question: 'Which element is known as the "King of Chemicals"?',
      options: ['Hydrochloric Acid', 'Sulfuric Acid', 'Nitric Acid', 'Acetic Acid'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'chem-6',
      category: 'chemistry',
      question: 'What is the atomic number of Carbon?',
      options: ['6', '8', '12', '14'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'chem-7',
      category: 'chemistry',
      question: 'Which bond involves the sharing of electron pairs between atoms?',
      options: ['Ionic Bond', 'Covalent Bond', 'Hydrogen Bond', 'Metallic Bond'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'chem-8',
      category: 'chemistry',
      question: 'What is the main constituent of natural gas?',
      options: ['Ethane', 'Methane', 'Propane', 'Butane'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'chem-9',
      category: 'chemistry',
      question: 'Which acid is found in lemons?',
      options: ['Lactic Acid', 'Citric Acid', 'Acetic Acid', 'Tartaric Acid'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'chem-10',
      category: 'chemistry',
      question: 'What is the lightest element in the periodic table?',
      options: ['Helium', 'Lithium', 'Hydrogen', 'Beryllium'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'chem-11',
      category: 'chemistry',
      question: 'Which gas is known as laughing gas?',
      options: ['Nitrous Oxide', 'Nitric Oxide', 'Nitrogen Dioxide', 'Ammonia'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'chem-12',
      category: 'chemistry',
      question: 'What is the main component of glass?',
      options: ['Silica', 'Calcium Carbonate', 'Sodium Carbonate', 'Potassium Nitrate'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'chem-13',
      category: 'chemistry',
      question: 'Which metal is liquid at room temperature?',
      options: ['Mercury', 'Gallium', 'Bromine', 'Cesium'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'chem-14',
      category: 'chemistry',
      question: 'What is the chemical formula for Chalk?',
      options: ['CaCO3', 'CaO', 'Ca(OH)2', 'CaCl2'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'chem-15',
      category: 'chemistry',
      question: 'What is the heaviest naturally occurring element?',
      options: ['Uranium', 'Plutonium', 'Thorium', 'Radium'],
      correctAnswer: 0,
      difficulty: 'hard',
      points: 10
    }
  ],
  biology: [
    {
      id: 'bio-1',
      category: 'biology',
      question: 'What is the powerhouse of the cell?',
      options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Apparatus'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'bio-2',
      category: 'biology',
      question: 'Which molecule carries genetic information?',
      options: ['RNA', 'Protein', 'DNA', 'Lipid'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'bio-3',
      category: 'biology',
      question: 'What is the largest organ in the human body?',
      options: ['Heart', 'Liver', 'Brain', 'Skin'],
      correctAnswer: 3,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'bio-4',
      category: 'biology',
      question: 'Which blood type is the universal donor?',
      options: ['A+', 'B-', 'AB+', 'O-'],
      correctAnswer: 3,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'bio-5',
      category: 'biology',
      question: 'What is the process by which plants make their food?',
      options: ['Respiration', 'Digestion', 'Photosynthesis', 'Transpiration'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'bio-6',
      category: 'biology',
      question: 'Which part of the brain controls balance and coordination?',
      options: ['Cerebrum', 'Cerebellum', 'Medulla', 'Hypothalamus'],
      correctAnswer: 1,
      difficulty: 'hard',
      points: 15
    },
    {
      id: 'bio-7',
      category: 'biology',
      question: 'What is the basic unit of life?',
      options: ['Tissue', 'Organ', 'Cell', 'Organism'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'bio-8',
      category: 'biology',
      question: 'Which vitamin is produced when the skin is exposed to sunlight?',
      options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'],
      correctAnswer: 3,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'bio-9',
      category: 'biology',
      question: 'How many chambers does the human heart have?',
      options: ['2', '3', '4', '5'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'bio-10',
      category: 'biology',
      question: 'What is the study of fossils called?',
      options: ['Archaeology', 'Paleontology', 'Geology', 'Anthropology'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'bio-11',
      category: 'biology',
      question: 'What is the largest bone in the human body?',
      options: ['Femur', 'Tibia', 'Humerus', 'Fibula'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'bio-12',
      category: 'biology',
      question: 'Which part of the plant conducts water?',
      options: ['Phloem', 'Xylem', 'Stomata', 'Root Hairs'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'bio-13',
      category: 'biology',
      question: 'Who discovered Penicillin?',
      options: ['Louis Pasteur', 'Alexander Fleming', 'Edward Jenner', 'Robert Koch'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'bio-14',
      category: 'biology',
      question: 'What is the average lifespan of a Red Blood Cell?',
      options: ['120 days', '60 days', '90 days', '30 days'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'bio-15',
      category: 'biology',
      question: 'Which organ produces insulin?',
      options: ['Liver', 'Pancreas', 'Kidney', 'Stomach'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    }
  ],
  history: [
    {
      id: 'hist-1',
      category: 'history',
      question: 'Who was the first President of the United States?',
      options: ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'hist-2',
      category: 'history',
      question: 'In which year did World War II end?',
      options: ['1943', '1944', '1945', '1946'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'hist-3',
      category: 'history',
      question: 'Which ancient civilization built the pyramids?',
      options: ['Romans', 'Greeks', 'Egyptians', 'Persians'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'hist-4',
      category: 'history',
      question: 'Who discovered America?',
      options: ['Vasco da Gama', 'Christopher Columbus', 'Ferdinand Magellan', 'Marco Polo'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'hist-5',
      category: 'history',
      question: 'The French Revolution started in which year?',
      options: ['1789', '1776', '1812', '1799'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'hist-6',
      category: 'history',
      question: 'Who was known as the "Iron Lady"?',
      options: ['Indira Gandhi', 'Margaret Thatcher', 'Angela Merkel', 'Golda Meir'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'hist-7',
      category: 'history',
      question: 'Which empire was ruled by Genghis Khan?',
      options: ['Roman Empire', 'Ottoman Empire', 'Mongol Empire', 'British Empire'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'hist-8',
      category: 'history',
      question: 'Who painted the Mona Lisa?',
      options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'hist-9',
      category: 'history',
      question: 'What was the name of the ship that sank in 1912?',
      options: ['Lusitania', 'Titanic', 'Britannic', 'Olympic'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'hist-10',
      category: 'history',
      question: 'Who wrote the "I Have a Dream" speech?',
      options: ['Malcolm X', 'Martin Luther King Jr.', 'Nelson Mandela', 'Barack Obama'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'hist-11',
      category: 'history',
      question: 'Who was the first woman to fly solo across the Atlantic?',
      options: ['Amelia Earhart', 'Bessie Coleman', 'Harriet Quimby', 'Jacqueline Cochran'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'hist-12',
      category: 'history',
      question: 'In which year did the Berlin Wall fall?',
      options: ['1987', '1989', '1991', '1993'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'hist-13',
      category: 'history',
      question: 'Who was the first Emperor of Rome?',
      options: ['Julius Caesar', 'Augustus', 'Nero', 'Trajan'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'hist-14',
      category: 'history',
      question: 'Which war was fought between the North and South regions of the US?',
      options: ['Revolutionary War', 'Civil War', 'World War I', 'Vietnam War'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'hist-15',
      category: 'history',
      question: 'Who was the first human to travel into space?',
      options: ['Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'Alan Shepard'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5
    }
  ],
  geography: [
    {
      id: 'geo-1',
      category: 'geography',
      question: 'Which is the largest continent by area?',
      options: ['Africa', 'North America', 'Europe', 'Asia'],
      correctAnswer: 3,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'geo-2',
      category: 'geography',
      question: 'What is the capital of Japan?',
      options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'geo-3',
      category: 'geography',
      question: 'Which river is the longest in the world?',
      options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'geo-4',
      category: 'geography',
      question: 'Which country has the largest population?',
      options: ['India', 'China', 'USA', 'Indonesia'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'geo-5',
      category: 'geography',
      question: 'Mount Everest is located in which mountain range?',
      options: ['Andes', 'Rockies', 'Alps', 'Himalayas'],
      correctAnswer: 3,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'geo-6',
      category: 'geography',
      question: 'Which ocean is the largest?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correctAnswer: 3,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'geo-7',
      category: 'geography',
      question: 'What is the smallest country in the world?',
      options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'geo-8',
      category: 'geography',
      question: 'Which desert is the largest hot desert in the world?',
      options: ['Gobi', 'Kalahari', 'Sahara', 'Arabian'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'geo-9',
      category: 'geography',
      question: 'Which country is known as the Land of the Rising Sun?',
      options: ['China', 'Japan', 'Thailand', 'South Korea'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'geo-10',
      category: 'geography',
      question: 'What is the capital of Australia?',
      options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'geo-11',
      category: 'geography',
      question: 'Which country has the most islands?',
      options: ['Philippines', 'Indonesia', 'Sweden', 'Finland'],
      correctAnswer: 2,
      difficulty: 'hard',
      points: 10
    },
    {
      id: 'geo-12',
      category: 'geography',
      question: 'What is the longest river in Europe?',
      options: ['Danube', 'Volga', 'Rhine', 'Seine'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'geo-13',
      category: 'geography',
      question: 'Which continent is known as the "Dark Continent"?',
      options: ['Asia', 'South America', 'Africa', 'Australia'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'geo-14',
      category: 'geography',
      question: 'What is the capital of Canada?',
      options: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'geo-15',
      category: 'geography',
      question: 'Which two countries share the longest international border?',
      options: ['USA and Canada', 'Russia and China', 'Chile and Argentina', 'India and Pakistan'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 10
    }
  ],
  literature: [
    {
      id: 'lit-1',
      category: 'literature',
      question: 'Who wrote "Romeo and Juliet"?',
      options: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'lit-2',
      category: 'literature',
      question: 'What is the title of the first Harry Potter book?',
      options: ['Chamber of Secrets', 'Prisoner of Azkaban', 'Philosopher\'s Stone', 'Goblet of Fire'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'lit-3',
      category: 'literature',
      question: 'Who is the author of "1984"?',
      options: ['George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'F. Scott Fitzgerald'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 5
    },
    {
      id: 'lit-4',
      category: 'literature',
      question: 'What is the longest epic poem in the world?',
      options: ['The Iliad', 'The Odyssey', 'Mahabharata', 'Ramayana'],
      correctAnswer: 2,
      difficulty: 'hard',
      points: 15
    },
    {
      id: 'lit-5',
      category: 'literature',
      question: 'Who is the author of "The Great Gatsby"?',
      options: ['Ernest Hemingway', 'F. Scott Fitzgerald', 'John Steinbeck', 'William Faulkner'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'lit-6',
      category: 'literature',
      question: 'In "Moby Dick", what animal is Moby Dick?',
      options: ['Shark', 'Whale', 'Squid', 'Turtle'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'lit-7',
      category: 'literature',
      question: 'Who wrote "Pride and Prejudice"?',
      options: ['Charlotte Bronte', 'Emily Bronte', 'Jane Austen', 'Virginia Woolf'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'lit-8',
      category: 'literature',
      question: 'Which detective was created by Arthur Conan Doyle?',
      options: ['Hercule Poirot', 'Sherlock Holmes', 'Miss Marple', 'Sam Spade'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'lit-9',
      category: 'literature',
      question: 'Who wrote "The Hobbit"?',
      options: ['C.S. Lewis', 'J.K. Rowling', 'J.R.R. Tolkien', 'George R.R. Martin'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'lit-10',
      category: 'literature',
      question: 'What is the pen name of Samuel Langhorne Clemens?',
      options: ['O. Henry', 'Mark Twain', 'George Orwell', 'Lewis Carroll'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'lit-11',
      category: 'literature',
      question: 'Who wrote "The Catcher in the Rye"?',
      options: ['J.D. Salinger', 'Ernest Hemingway', 'F. Scott Fitzgerald', 'John Steinbeck'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'lit-12',
      category: 'literature',
      question: 'Who is the author of "The Chronicles of Narnia"?',
      options: ['J.R.R. Tolkien', 'C.S. Lewis', 'Roald Dahl', 'Enid Blyton'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'lit-13',
      category: 'literature',
      question: 'In which city is "Sherlock Holmes" based?',
      options: ['New York', 'Paris', 'London', 'Edinburgh'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'lit-14',
      category: 'literature',
      question: 'Who wrote "War and Peace"?',
      options: ['Fyodor Dostoevsky', 'Leo Tolstoy', 'Anton Chekhov', 'Vladimir Nabokov'],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'lit-15',
      category: 'literature',
      question: 'What is the name of the protagonist in "The Hunger Games"?',
      options: ['Katniss Everdeen', 'Hermione Granger', 'Bella Swan', 'Tris Prior'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    }
  ],
  general_knowledge: [
    {
      id: 'gk-1',
      category: 'general_knowledge',
      question: 'How many days are in a leap year?',
      options: ['364', '365', '366', '367'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'gk-2',
      category: 'general_knowledge',
      question: 'What is the chemical symbol for water?',
      options: ['H2O', 'CO2', 'O2', 'NaCl'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'gk-3',
      category: 'general_knowledge',
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'gk-4',
      category: 'general_knowledge',
      question: 'How many colors are there in a rainbow?',
      options: ['5', '6', '7', '8'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'gk-5',
      category: 'general_knowledge',
      question: 'What does CPU stand for?',
      options: ['Central Processing Unit', 'Central Program Unit', 'Computer Personal Unit', 'Central Processor Unit'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'gk-6',
      category: 'general_knowledge',
      question: 'Which is the fastest land animal?',
      options: ['Lion', 'Cheetah', 'Leopard', 'Tiger'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'gk-7',
      category: 'general_knowledge',
      question: 'What is the boiling point of water?',
      options: ['90°C', '100°C', '110°C', '120°C'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'gk-8',
      category: 'general_knowledge',
      question: 'Which is the largest ocean?',
      options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'gk-9',
      category: 'general_knowledge',
      question: 'Who is the founder of Microsoft?',
      options: ['Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Elon Musk'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'gk-10',
      category: 'general_knowledge',
      question: 'Which bird cannot fly?',
      options: ['Eagle', 'Ostrich', 'Parrot', 'Sparrow'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'gk-11',
      category: 'general_knowledge',
      question: 'Which country won the first FIFA World Cup?',
      options: ['Brazil', 'Argentina', 'Uruguay', 'Italy'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'gk-12',
      category: 'general_knowledge',
      question: 'What is the currency of the United Kingdom?',
      options: ['Euro', 'Dollar', 'Pound Sterling', 'Yen'],
      correctAnswer: 2,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'gk-13',
      category: 'general_knowledge',
      question: 'Who invented the telephone?',
      options: ['Thomas Edison', 'Alexander Graham Bell', 'Nikola Tesla', 'Guglielmo Marconi'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'gk-14',
      category: 'general_knowledge',
      question: 'What does the "www" stand for in a website browser?',
      options: ['World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'gk-15',
      category: 'general_knowledge',
      question: 'How many players are there in a cricket team?',
      options: ['9', '10', '11', '12'],
      correctAnswer: 2,
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
