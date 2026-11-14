import bcrypt from 'bcryptjs';
import { User, memoryUsers } from '../models/User.js';
import { Quiz, memoryQuizzes } from '../models/Quiz.js';
import { Question, memoryQuestions } from '../models/Question.js';
import { Attempt, memoryAttempts } from '../models/Attempt.js';
import { getDbStatus } from '../config/db.js';

export const initialQuizzes = [
  {
    id: 'quiz_java_01',
    title: 'Java Core Fundamentals',
    description: 'Test your understanding of OOP principles, JVM architecture, threading, and Java Collections framework.',
    category: 'Java',
    difficulty: 'Medium',
    timeLimit: 10,
    questions: [
      {
        text: 'Which feature of Java ensures "Write Once, Run Anywhere" (WORA)?',
        options: ['Just-In-Time (JIT) Compiler', 'Java Virtual Machine (JVM) & Bytecode', 'Java Development Kit (JDK)', 'Garbage Collector'],
        correctIndex: 1,
        explanation: 'Java source code compiles into platform-independent bytecode (.class files), which any JVM implementation can execute on any operating system.'
      },
      {
        text: 'Which of the following collection classes is synchronized and thread-safe in Java?',
        options: ['ArrayList', 'HashMap', 'Vector', 'LinkedList'],
        correctIndex: 2,
        explanation: 'Vector and Hashtable are legacy synchronized collections in java.util, whereas ArrayList and HashMap are unsynchronized for higher single-thread throughput.'
      },
      {
        text: 'What happens when an exception is thrown in a try block and caught in a catch block that returns a value, with a finally block that also returns a value?',
        options: ['The value from the catch block is returned', 'The value from the finally block overrides and is returned', 'A compilation error occurs', 'An IllegalStateException is thrown at runtime'],
        correctIndex: 1,
        explanation: 'In Java, if a finally block executes a return statement, it overrides any previous return statement or unhandled exception from the try/catch blocks.'
      },
      {
        text: 'Which operator is used to compare whether two object references point to the same memory location?',
        options: ['equals()', '==', 'compareTo()', 'instanceof'],
        correctIndex: 1,
        explanation: 'The == operator tests for reference identity (whether both refer to the exact same object in heap), while .equals() tests value equivalence.'
      },
      {
        text: 'What is the default value of a boolean variable declared as a class field in Java?',
        options: ['true', 'false', 'null', '0'],
        correctIndex: 1,
        explanation: 'Primitive boolean instance variables default to false in Java. Object references default to null.'
      }
    ]
  },
  {
    id: 'quiz_js_01',
    title: 'JavaScript Deep Dive & ES6+',
    description: 'Master closures, prototypal inheritance, promises, event loop microtasks, and modern ECMAScript idioms.',
    category: 'JavaScript',
    difficulty: 'Medium',
    timeLimit: 8,
    questions: [
      {
        text: 'What is the output order of: console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);?',
        options: ['1, 4, 3, 2', '1, 2, 3, 4', '1, 4, 2, 3', '1, 3, 4, 2'],
        correctIndex: 0,
        explanation: 'Synchronous code runs first (1, 4). Then microtasks in the Promise job queue run before macrotasks (3). Finally the timer macrotask callback runs (2).'
      },
      {
        text: 'What is a JavaScript closure?',
        options: [
          'A method that closes a database or file stream',
          'A function bundled together with references to its surrounding lexical state (lexical environment)',
          'An anonymous function that runs immediately upon declaration',
          'A strict mode construct that prevents memory leaks'
        ],
        correctIndex: 1,
        explanation: 'A closure gives a function access to its outer scope variables even after the outer function has finished executing and returned.'
      },
      {
        text: 'What will typeof NaN return in JavaScript?',
        options: ['"nan"', '"undefined"', '"number"', '"object"'],
        correctIndex: 2,
        explanation: 'In JavaScript (per IEEE-754 standards), NaN stands for "Not-a-Number", but its data type is officially "number".'
      },
      {
        text: 'Which array method returns a new array with all elements that pass the test implemented by the provided callback?',
        options: ['map()', 'filter()', 'forEach()', 'reduce()'],
        correctIndex: 1,
        explanation: 'Array.prototype.filter() creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that pass the test implemented by the provided function.'
      },
      {
        text: 'What is the primary difference between let and var?',
        options: [
          'let is block-scoped and cannot be redeclared in the same scope, whereas var is function-scoped',
          'var creates constants while let allows mutation',
          'let hoists to global window object, while var does not',
          'There is no difference in modern browsers'
        ],
        correctIndex: 0,
        explanation: 'Variables declared with let and const are scoped to the nearest enclosing block {} and are not initialized before their declaration (Temporal Dead Zone).'
      }
    ]
  },
  {
    id: 'quiz_react_01',
    title: 'React.js Component Architecture',
    description: 'Evaluate your knowledge of React hooks, component lifecycle, Virtual DOM reconciliation, and context state management.',
    category: 'React',
    difficulty: 'Hard',
    timeLimit: 10,
    questions: [
      {
        text: 'Why should you avoid using array indices as the key prop when rendering dynamic lists in React?',
        options: [
          'React throws a compilation error if an index is used',
          'It can negatively impact performance and cause state bugs if items are reordered, inserted, or deleted',
          'Indices cannot be converted to strings by the reconciler',
          'It disables memoization in React.memo'
        ],
        correctIndex: 1,
        explanation: 'Keys help React identify which items have changed, are added, or are removed. Using array indices can lead to UI bugs and component state mixups when items are filtered, inserted, or sorted.'
      },
      {
        text: 'When does the cleanup function returned by useEffect execute?',
        options: [
          'Only when the browser window closes',
          'Before the component re-runs the effect on dependency change and when the component unmounts',
          'Immediately before the JSX renders',
          'Only on the very first mount of the component'
        ],
        correctIndex: 1,
        explanation: 'React performs cleanup when the component unmounts and before running the effect next time if dependencies have changed.'
      },
      {
        text: 'What hook should be used to cache the result of an expensive calculation between re-renders?',
        options: ['useCallback', 'useMemo', 'useRef', 'useEffect'],
        correctIndex: 1,
        explanation: 'useMemo caches a calculated value between re-renders, while useCallback caches a function definition.'
      },
      {
        text: 'What is the Virtual DOM in React?',
        options: [
          'A direct mirror copy of the browser DOM kept on the Node.js server',
          'A lightweight in-memory JavaScript representation of the real DOM used for diffing',
          'A WebAssembly engine that replaces HTML rendering',
          'A security sandbox that isolates third-party React components'
        ],
        correctIndex: 1,
        explanation: 'The Virtual DOM is a lightweight tree of JavaScript objects. React computes diffs (reconciliation) between Virtual DOM trees to batch and minimize costly real DOM mutations.'
      },
      {
        text: 'How does React Context transmit data to deeply nested components?',
        options: [
          'By dispatching window CustomEvents',
          'Through a Provider component that supplies a value consumed via useContext without prop drilling',
          'By mutating global window state',
          'Through HTML5 localStorage synchronization'
        ],
        correctIndex: 1,
        explanation: 'React Context allows components to share data without having to explicitly pass props through every level of the component hierarchy.'
      }
    ]
  },
  {
    id: 'quiz_html_01',
    title: 'HTML5 Semantic Web & Accessibility',
    description: 'Assess modern HTML5 semantics, accessible ARIA attributes, forms, and progressive document structure.',
    category: 'HTML',
    difficulty: 'Easy',
    timeLimit: 5,
    questions: [
      {
        text: 'Which HTML5 element represents self-contained content that could be independently distributable or reusable (e.g., a blog post or news story)?',
        options: ['<section>', '<article>', '<aside>', '<main>'],
        correctIndex: 1,
        explanation: 'The <article> element specifies independent, self-contained content such as blog entries, forum posts, news stories, or product reviews.'
      },
      {
        text: 'What is the purpose of the alt attribute on the <img> tag?',
        options: [
          'It provides a tooltip on mouse hover only',
          'It provides alternative text for screen readers and when images fail to load',
          'It specifies the alignment of the image on the page',
          'It defines the high-resolution source for retina screens'
        ],
        correctIndex: 1,
        explanation: 'The alt attribute improves accessibility by describing the image to vision-impaired users using screen readers and displays fallback text if image fetching fails.'
      },
      {
        text: 'Which attribute connects an HTML <label> to an <input> element?',
        options: ['name', 'for (htmlFor in JSX)', 'rel', 'aria-describedby'],
        correctIndex: 1,
        explanation: 'The for attribute in HTML (htmlFor in JSX) references the id of the target input, ensuring clicking the label focuses or toggles the input control.'
      },
      {
        text: 'What does the <!DOCTYPE html> declaration do in an HTML document?',
        options: [
          'It links the external stylesheet',
          'It instructs the browser to render the page in standard HTML5 mode rather than quirks mode',
          'It compiles JavaScript into machine code',
          'It specifies the document language'
        ],
        correctIndex: 1,
        explanation: '<!DOCTYPE html> ensures the browser treats the document according to current HTML standards and prevents old quirks mode rendering.'
      },
      {
        text: 'Which input type is specifically designed for entering email addresses with built-in client validation?',
        options: ['<input type="text">', '<input type="url">', '<input type="email">', '<input type="search">'],
        correctIndex: 2,
        explanation: '<input type="email"> automatically provides basic regex format validation and shows an email-optimized keyboard on mobile devices.'
      }
    ]
  },
  {
    id: 'quiz_css_01',
    title: 'CSS3 Flexbox, Grid & Modern Styling',
    description: 'Test your mastery of CSS layouts, specificity rules, CSS Grid, Flexbox alignment, and responsive design.',
    category: 'CSS',
    difficulty: 'Medium',
    timeLimit: 8,
    questions: [
      {
        text: 'In CSS Flexbox, which property aligns items along the cross-axis?',
        options: ['justify-content', 'align-items', 'flex-direction', 'align-content'],
        correctIndex: 1,
        explanation: 'justify-content aligns items along the main-axis, while align-items controls alignment across the cross-axis (e.g. vertical if flex-direction is row).'
      },
      {
        text: 'What is the default box-sizing value in standard CSS, and what does border-box change?',
        options: [
          'Default is content-box; border-box includes padding and border in the specified width and height',
          'Default is border-box; content-box excludes margins',
          'Default is padding-box; border-box removes borders completely',
          'There is no difference in modern browsers'
        ],
        correctIndex: 0,
        explanation: 'By default, CSS elements use content-box where padding and borders are added on top of width. Setting box-sizing: border-box includes padding and borders inside the declared width.'
      },
      {
        text: 'Which selector has the highest CSS specificity weight?',
        options: [
          'div.header.active (Two classes and one element)',
          '#main-nav (One ID selector)',
          'ul li a:hover (Three elements and one pseudo-class)',
          '* (Universal selector)'
        ],
        correctIndex: 1,
        explanation: 'An ID selector (#) has specificity (1, 0, 0), which overrides any number of classes, attributes, or element selectors.'
      },
      {
        text: 'In CSS Grid, what does grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) achieve?',
        options: [
          'A fixed 4-column layout that breaks on mobile',
          'A fully responsive grid where columns automatically wrap without needing media queries',
          'A column that stretches indefinitely past the viewport',
          'An invalid CSS declaration'
        ],
        correctIndex: 1,
        explanation: 'This modern CSS Grid pattern creates responsive wrapping columns that are at least 250px wide and share the remaining space equally, without media query breakpoints.'
      },
      {
        text: 'What is the purpose of the z-index property in CSS?',
        options: [
          'To zoom in on text',
          'To specify the stack order of positioned elements along the z-axis',
          'To set the zero-point margin of containers',
          'To define 3D rotation speed'
        ],
        correctIndex: 1,
        explanation: 'z-index sets the vertical stack order of overlapping positioned elements (relative, absolute, fixed, sticky) or flex/grid items.'
      }
    ]
  },
  {
    id: 'quiz_gk_01',
    title: 'General Knowledge & Computing History',
    description: 'Explore milestones in computer science, internet protocols, web history, and foundational technology trivia.',
    category: 'General Knowledge',
    difficulty: 'Easy',
    timeLimit: 6,
    questions: [
      {
        text: 'Who is recognized as the inventor of the World Wide Web at CERN in 1989?',
        options: ['Alan Turing', 'Tim Berners-Lee', 'Vint Cerf', 'Grace Hopper'],
        correctIndex: 1,
        explanation: 'Sir Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN, designing HTML, HTTP, and the first web browser.'
      },
      {
        text: 'What does the "HTTPS" acronym stand for in computer networking?',
        options: [
          'HyperText Transfer Protocol Secure',
          'High Transfer Tech Protocol System',
          'HyperText Tracking Program Security',
          'Host Terminal Telecommunications Private Server'
        ],
        correctIndex: 0,
        explanation: 'HTTPS stands for HyperText Transfer Protocol Secure. It encrypts standard HTTP communication using Transport Layer Security (TLS/SSL).'
      },
      {
        text: 'Which pioneer created the JavaScript programming language in just 10 days in May 1995 at Netscape?',
        options: ['Brendan Eich', 'James Gosling', 'Bjarne Stroustrup', 'Guido van Rossum'],
        correctIndex: 0,
        explanation: 'Brendan Eich developed JavaScript (originally codenamed Mocha, then LiveScript) at Netscape in May 1995.'
      },
      {
        text: 'What is the binary representation of decimal number 13?',
        options: ['1101', '1011', '1110', '1001'],
        correctIndex: 0,
        explanation: '13 in binary is 8 + 4 + 0 + 1 = 1101 in base 2.'
      },
      {
        text: 'What default port does an unencrypted HTTP web server listen on?',
        options: ['21', '22', '80', '443'],
        correctIndex: 2,
        explanation: 'Standard HTTP communicates over port 80, whereas encrypted HTTPS operates on port 443.'
      }
    ]
  }
];

// Pre-hashed bcrypt hashes for 'Admin@123' and 'Learner@123' (10 rounds)
const ADMIN_HASH = '$2a$10$wK1F5jC1Z1w0/8/N9k9EheFm81yKjKk2vQnL0zW9O9mB7o1sJ5A5S';
const LEARNER_HASH = '$2a$10$wK1F5jC1Z1w0/8/N9k9EheFm81yKjKk2vQnL0zW9O9mB7o1sJ5A5S';

export const initMemoryData = () => {
  if (memoryUsers.length === 0) {
    const saltSync = bcrypt.genSaltSync(10);
    const adminHashedPassword = bcrypt.hashSync('Admin@123', saltSync);
    const learnerHashedPassword = bcrypt.hashSync('Learner@123', saltSync);

    const adminUserObj = {
      _id: '65f000000000000000000001',
      name: 'Admin Master',
      email: 'admin@quizmaster.com',
      password: adminHashedPassword,
      role: 'admin',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date(),
    };

    const learnerUserObj = {
      _id: '65f000000000000000000002',
      name: 'Muskan Learner',
      email: 'learner@quizmaster.com',
      password: learnerHashedPassword,
      role: 'user',
      createdAt: new Date('2026-01-10T00:00:00Z'),
      updatedAt: new Date(),
    };

    memoryUsers.push(adminUserObj, learnerUserObj);

    if (memoryQuizzes.length === 0) {
      initialQuizzes.forEach((quizDef, qIndex) => {
        const quizId = `65f10000000000000000000${qIndex + 1}`;
        const quizObj = {
          _id: quizId,
          title: quizDef.title,
          description: quizDef.description,
          category: quizDef.category,
          difficulty: quizDef.difficulty,
          timeLimit: quizDef.timeLimit,
          createdBy: adminUserObj._id,
          createdAt: new Date('2026-02-01T00:00:00Z'),
          updatedAt: new Date(),
        };
        memoryQuizzes.push(quizObj);

        quizDef.questions.forEach((qItem, qSubIndex) => {
          const questionId = `65f200000000000000000${qIndex}${qSubIndex}`;
          memoryQuestions.push({
            _id: questionId,
            quizId: quizId,
            text: qItem.text,
            options: qItem.options,
            correctIndex: qItem.correctIndex,
            explanation: qItem.explanation,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
      });

      const sampleQuiz = memoryQuizzes[0];
      const sampleQuestions = memoryQuestions.filter((q) => q.quizId === sampleQuiz._id);
      if (sampleQuestions.length > 0) {
        memoryAttempts.push({
          _id: '65f300000000000000000001',
          userId: learnerUserObj._id,
          quizId: sampleQuiz._id,
          answers: sampleQuestions.map((q, idx) => ({
            questionId: q._id,
            selectedIndex: idx === 1 ? 0 : q.correctIndex,
          })),
          score: 4,
          total: 5,
          percentage: 80,
          timeTaken: 245,
          startedAt: new Date(Date.now() - 3600000 * 2),
          submittedAt: new Date(Date.now() - 3600000 * 2 + 245000),
          createdAt: new Date(Date.now() - 3600000 * 2),
        });

        const sampleQuiz2 = memoryQuizzes[1];
        const sampleQuestions2 = memoryQuestions.filter((q) => q.quizId === sampleQuiz2._id);
        if (sampleQuestions2.length > 0) {
          memoryAttempts.push({
            _id: '65f300000000000000000002',
            userId: learnerUserObj._id,
            quizId: sampleQuiz2._id,
            answers: sampleQuestions2.map((q) => ({
              questionId: q._id,
              selectedIndex: q.correctIndex,
            })),
            score: 5,
            total: 5,
            percentage: 100,
            timeTaken: 190,
            startedAt: new Date(Date.now() - 86400000),
            submittedAt: new Date(Date.now() - 86400000 + 190000),
            createdAt: new Date(Date.now() - 86400000),
          });
        }
      }
    }
  }
};

// Seed immediately on import
initMemoryData();

export const seedInitialData = async () => {
  initMemoryData();
  const dbStatus = getDbStatus();

  try {
    // If real MongoDB is connected, populate database collections if empty
    if (dbStatus.connected) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 Seeding MongoDB database with initial users and quizzes...');
        const createdAdmin = await User.create({
          name: 'Admin Master',
          email: 'admin@quizmaster.com',
          password: 'Admin@123',
          role: 'admin',
        });

        const createdLearner = await User.create({
          name: 'Muskan Learner',
          email: 'learner@quizmaster.com',
          password: 'Learner@123',
          role: 'user',
        });

        for (const quizDef of initialQuizzes) {
          const quiz = await Quiz.create({
            title: quizDef.title,
            description: quizDef.description,
            category: quizDef.category,
            difficulty: quizDef.difficulty,
            timeLimit: quizDef.timeLimit,
            createdBy: createdAdmin._id,
          });

          const questionsToInsert = quizDef.questions.map((q) => ({
            quizId: quiz._id,
            text: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          }));

          await Question.insertMany(questionsToInsert);
        }
        console.log('✅ MongoDB successfully seeded!');
      }
    }
  } catch (err) {
    console.error('Error during database seed initialization:', err.message);
  }
};
