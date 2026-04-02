// quick smoke test for all endpoints
// run with: node tests.js (while server is running)

const BASE = 'http://localhost:5000/api';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function log(label, result) {
  const icon = result.status < 400 ? '✅' : '❌';
  console.log(`\n${icon} [${result.status}] ${label}`);
  console.log(JSON.stringify(result.data, null, 2));
}

(async () => {
  console.log('=== FINANCE BACKEND API SMOKE TEST ===\n');

  // register a new user
  const reg = await request('POST', '/auth/register', {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'test123456',
  });
  log('Register new user', reg);

  // login as Admin
  const adminLogin = await request('POST', '/auth/login', {
    email: 'admin@finance.com',
    password: 'password123',
  });
  log('Login as ADMIN', adminLogin);
  const adminToken = adminLogin.data?.token;

  // login as Viewer
  const viewerLogin = await request('POST', '/auth/login', {
    email: 'viewer@finance.com',
    password: 'password123',
  });
  log('Login as VIEWER', viewerLogin);
  const viewerToken = viewerLogin.data?.token;

  // login as Analyst
  const analystLogin = await request('POST', '/auth/login', {
    email: 'analyst@finance.com',
    password: 'password123',
  });
  log('Login as ANALYST', analystLogin);
  const analystToken = analystLogin.data?.token;

  // rbac: Viewer tries to create transaction (should FAIL 403)
  const viewerCreate = await request('POST', '/transactions', {
    amount: 100, type: 'INCOME', category: 'Test',
  }, viewerToken);
  log('RBAC: Viewer tries to CREATE transaction (expect 403)', viewerCreate);

  // rbac: Viewer tries to GET transactions (should FAIL 403)
  const viewerGet = await request('GET', '/transactions', null, viewerToken);
  log('RBAC: Viewer tries to GET transactions (expect 403)', viewerGet);

  // admin creates a transaction
  const create = await request('POST', '/transactions', {
    amount: 750,
    type: 'EXPENSE',
    category: 'Marketing',
    date: '2026-03-15',
    notes: 'Google Ads campaign',
  }, adminToken);
  log('Admin creates transaction', create);
  const txnId = create.data?.data?.transaction?._id;

  // analyst reads transactions (should work)
  const analystRead = await request('GET', '/transactions?page=1&limit=5', null, analystToken);
  log('Analyst reads transactions (expect 200)', analystRead);

  // admin updates the transaction
  if (txnId) {
    const update = await request('PUT', `/transactions/${txnId}`, {
      amount: 800, notes: 'Updated - Google Ads Q1',
    }, adminToken);
    log('Admin updates transaction', update);
  }

  // admin soft-deletes the transaction
  if (txnId) {
    const del = await request('DELETE', `/transactions/${txnId}`, null, adminToken);
    log(`Admin soft-deletes transaction (expect 204)`, { status: del.status, data: del.data || 'No Content' });
  }

  // dashboard summary
  const summary = await request('GET', '/dashboard/summary', null, adminToken);
  log('Dashboard Summary', summary);

  // dashboard trends
  const trends = await request('GET', '/dashboard/trends', null, adminToken);
  log('Dashboard Trends', trends);

  // admin lists all users
  const users = await request('GET', '/users', null, adminToken);
  log('Admin lists all users', users);

  // validation: bad input
  const badInput = await request('POST', '/auth/register', {
    name: '',
    email: 'not-an-email',
    password: '12',
  });
  log('Validation: bad register input (expect 400)', badInput);

  // auth: no token
  const noAuth = await request('GET', '/transactions');
  log('No token on protected route (expect 401)', noAuth);

  console.log('\n=== ALL TESTS COMPLETE ===');
})();
