import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import axios from 'axios';
import { test } from 'node:test';

// Load the actual TypeScript services without a browser or a live backend.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && context.parentURL?.includes('/src/') && !specifier.endsWith('.ts')) {
      return next(`${specifier}.ts`, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith('.ts') && (url.includes('/src/') || url.includes('/config/'))) {
      return { format: 'module', shortCircuit: true, source: ts.transpileModule(
        readFileSync(new URL(url), 'utf8').replaceAll('import.meta.env', '({ DEV: true })'),
        { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
      ).outputText };
    }
    return next(url, context);
  },
});
const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key),
};
globalThis.window = { localStorage: globalThis.localStorage };
const { default: api, API_BASE_URL } = await import('../src/services/api.ts');
const { useAuthStore } = await import('../src/store/authStore.ts');
const { getAuthUser } = await import('../src/services/auth.api.ts');
const ok = (config, data = {}) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
const fail = (config, status) => Promise.reject(new axios.AxiosError('Rejected', 'ERR_BAD_RESPONSE', config, null, { ...ok(config), status }));
const seed = () => {
  storage.clear();
  useAuthStore.setState({ isAuthenticated: true, accessToken: 'expired', refreshToken: 'refresh' });
};

test('development uses the same-origin proxy', () => assert.equal(API_BASE_URL, '/v1'));
test('profile extraction accepts direct and nested profiles and rejects missing users', () => {
  const user = { _id: '1', email: 'admin@example.com' };
  for (const data of [user, { user }, { data: user }, { data: { user } }]) assert.equal(getAuthUser(data), user);
  assert.equal(getAuthUser({ success: true }), null);
});
test('login does not send a stale bearer token', async () => {
  seed();
  api.defaults.adapter = async config => {
    assert.equal(config.headers.Authorization, undefined);
    return ok(config);
  };
  await api.post('/auth/login', {});
});
for (const cookieOnly of [true, false]) {
  test(`concurrent 401s share one refresh and retry once (${cookieOnly ? 'cookie' : 'bearer'})`, async () => {
    seed();
    let refreshes = 0;
    axios.defaults.adapter = async config => {
      refreshes++;
      await new Promise(resolve => setTimeout(resolve, 10));
      return ok(config, cookieOnly ? { success: true } : { data: { accessToken: 'new-token' } });
    };
    api.defaults.adapter = async config => {
      if (!config._retry) return fail(config, 401);
      assert.equal(config.headers.Authorization, cookieOnly ? undefined : 'Bearer new-token');
      return ok(config);
    };
    await Promise.all([api.get('/product'), api.get('/machinery')]);
    assert.equal(refreshes, 1);
    assert.equal(useAuthStore.getState().isAuthenticated, true);
  });
}
test('repeated 401 ends the session without another refresh loop', async () => {
  seed();
  let refreshes = 0;
  axios.defaults.adapter = async config => { refreshes++; await new Promise(resolve => setTimeout(resolve, 10)); return ok(config); };
  api.defaults.adapter = config => fail(config, 401);
  const results = await Promise.allSettled([api.get('/product'), api.get('/machinery')]);
  assert.ok(results.every(result => result.status === 'rejected'));
  assert.equal(refreshes, 1);
  assert.equal(useAuthStore.getState().isAuthenticated, false);
});
for (const status of [401, 403, 503]) {
  test(`refresh failure ${status} ${status === 503 ? 'preserves' : 'clears'} the session`, async () => {
    seed();
    axios.defaults.adapter = config => fail(config, status);
    api.defaults.adapter = config => fail(config, 401);
    await assert.rejects(api.get('/product'));
    assert.equal(useAuthStore.getState().isAuthenticated, status === 503);
  });
}

const { rewriteDevAuthCookie } = await import('../config/proxyCookies.ts');
test('development auth cookies use Lax while retaining credentials and attributes', () => {
  for (const name of ['access_token', 'refresh_token']) {
    const cookie = `${name}=test-value; Path=/; HttpOnly; SameSite=None; Max-Age=86400`;
    assert.equal(rewriteDevAuthCookie(cookie), cookie.replace('SameSite=None', 'SameSite=Lax'));
  }
});
test('proxy preserves tunnel cookies and existing secure cookie attributes', () => {
  const tunnel = '.Tunnels.Relay.WebForwarding.Cookies=test; Secure; SameSite=None; Partitioned';
  assert.equal(rewriteDevAuthCookie(tunnel), tunnel);
  const secure = 'access_token=test; Secure; HttpOnly; SameSite=None';
  assert.equal(rewriteDevAuthCookie(secure), secure.replace('SameSite=None', 'SameSite=Lax'));
  const lax = 'refresh_token=test; HttpOnly; SameSite=Lax';
  assert.equal(rewriteDevAuthCookie(lax), lax);
});
