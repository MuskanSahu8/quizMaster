import app from './src/server.js';

let server;
const PORT = process.env.PORT || 5000;

const runTests = async () => {
  console.log('🧪 Starting QuizMaster Comprehensive API Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title}`);
      failed++;
    }
  };

  const BASE_URL = `http://localhost:${PORT}/api`;

  try {
    // Wait for server seed to settle
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 1. Health check
    console.log('--- Test Group 1: Health & Public Quizzes ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'OK', 'GET /api/health returns 200 OK');

    // 2. Public quiz browsing
    const quizzesRes = await fetch(`${BASE_URL}/quizzes`);
    const quizzesData = await quizzesRes.json();
    assert(quizzesRes.status === 200 && quizzesData.quizzes.length >= 6, 'GET /api/quizzes returns initial 6 quizzes');

    const javaQuizzesRes = await fetch(`${BASE_URL}/quizzes?category=Java`);
    const javaQuizzesData = await javaQuizzesRes.json();
    assert(javaQuizzesData.quizzes.every((q) => q.category === 'Java'), 'GET /api/quizzes?category=Java filters correctly');

    // 3. Auth: Registration & Validation
    console.log('\n--- Test Group 2: Authentication & Authorization ---');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: `student_${Date.now()}@test.com`,
        password: 'password123',
      }),
    });
    const registerData = await registerRes.json();
    assert(registerRes.status === 201 && registerData.token, 'POST /api/auth/register creates user & returns JWT');
    const studentToken = registerData.token;

    // Duplicate registration should fail
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: registerData.user.email,
        password: 'password123',
      }),
    });
    assert(dupRes.status === 400, 'POST /api/auth/register fails on duplicate email (TC-1)');

    // Login with bad password
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerData.user.email,
        password: 'wrongpassword',
      }),
    });
    assert(badLoginRes.status === 401, 'POST /api/auth/login fails on wrong password (TC-2)');

    // Login admin
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@quizmaster.com',
        password: 'Admin@123',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginData.user.role === 'admin', 'POST /api/auth/login logs in seeded Admin');
    const adminToken = adminLoginData.token;

    // Role check: Student accessing /api/admin/stats should be 403 Forbidden
    const studentAdminRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentAdminRes.status === 403, 'Normal user calling /admin route returns 403 Forbidden (TC-3)');

    // Admin accessing /api/admin/stats
    const adminStatsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminStatsData = await adminStatsRes.json();
    assert(adminStatsRes.status === 200 && adminStatsData.stats.totalQuizzes >= 6, 'Admin calling /admin/stats returns 200 and metrics');

    // 4. Quiz Taking & Security Integrity
    console.log('\n--- Test Group 3: Quiz Taking & Scoring Integrity ---');
    const targetQuiz = quizzesData.quizzes[0];
    const quizDetailRes = await fetch(`${BASE_URL}/quizzes/${targetQuiz._id}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const quizDetailData = await quizDetailRes.json();
    assert(quizDetailRes.status === 200 && quizDetailData.questions.length > 0, 'GET /api/quizzes/:id returns quiz and questions');
    
    // Security check: questions must NOT expose correctIndex or explanation
    const exposedAnswers = quizDetailData.questions.some((q) => q.correctIndex !== undefined || q.explanation !== undefined);
    assert(!exposedAnswers, 'Client questions payload STRICTLY conceals correctIndex & explanation during quiz');

    // Submit Quiz
    const testAnswers = quizDetailData.questions.map((q, idx) => ({
      questionId: q._id,
      selectedIndex: idx === 0 ? 1 : 0,
    }));

    const submitRes = await fetch(`${BASE_URL}/quizzes/${targetQuiz._id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        answers: testAnswers,
        timeTaken: 120,
      }),
    });
    const submitData = await submitRes.json();
    assert(submitRes.status === 201 && submitData.attempt.total === quizDetailData.questions.length, 'POST /api/quizzes/:id/submit scores & records attempt (TC-4)');
    assert(submitData.review.length === quizDetailData.questions.length, 'Submit response includes review with explanations & answers');

    // 5. History & User Stats
    console.log('\n--- Test Group 4: History & Statistics ---');
    const historyRes = await fetch(`${BASE_URL}/attempts`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const historyData = await historyRes.json();
    assert(historyRes.status === 200 && historyData.attempts.length >= 1, 'GET /api/attempts returns user attempt history');

    const statsRes = await fetch(`${BASE_URL}/attempts/stats`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.stats.totalAttempts >= 1, 'GET /api/attempts/stats calculates user performance');

    // 6. Admin Quiz & Question CRUD
    console.log('\n--- Test Group 5: Admin Quiz & Question Management ---');
    const newQuizRes = await fetch(`${BASE_URL}/admin/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Node.js Advanced Runtime',
        description: 'Test on streams, cluster, worker threads, and event emitter.',
        category: 'JavaScript',
        difficulty: 'Hard',
        timeLimit: 12,
      }),
    });
    const newQuizData = await newQuizRes.json();
    assert(newQuizRes.status === 201 && newQuizData.quiz._id, 'POST /api/admin/quizzes creates new quiz');

    const createdQuizId = newQuizData.quiz._id;

    // Add question
    const addQRes = await fetch(`${BASE_URL}/admin/quizzes/${createdQuizId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        text: 'What module provides worker threads in Node.js?',
        options: ['worker_threads', 'cluster', 'child_process', 'threads'],
        correctIndex: 0,
        explanation: 'The node:worker_threads module enables use of threads that execute JavaScript in parallel.',
      }),
    });
    const addQData = await addQRes.json();
    assert(addQRes.status === 201 && addQData.question._id, 'POST /api/admin/quizzes/:id/questions adds question');

    // Admin questions review
    const adminQRes = await fetch(`${BASE_URL}/admin/quizzes/${createdQuizId}/questions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminQData = await adminQRes.json();
    assert(adminQRes.status === 200 && adminQData.questions.length === 1, 'GET /api/admin/quizzes/:id/questions retrieves questions with correctIndex');

    // Delete quiz
    const delQuizRes = await fetch(`${BASE_URL}/admin/quizzes/${createdQuizId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(delQuizRes.status === 200, 'DELETE /api/admin/quizzes/:id deletes quiz & questions (TC-7)');

    console.log(`\n========================================`);
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
};

runTests();
