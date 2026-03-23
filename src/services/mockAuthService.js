const TOKEN_PREFIX = "mock-session-token";
const FIXED_PASSWORD = "glintrise-123";
const ARTIFICIAL_DELAY_MS = 10;

const USERS = {
  employee: {
    id: "user-employee",
    name: "内部员工",
    role: "employee",
  },
  director: {
    id: "user-director",
    name: "部门总监",
    role: "director",
  },
  developer: {
    id: "user-developer",
    name: "开发人员",
    role: "developer",
  },
};

function delay() {
  return new Promise((resolve) => {
    setTimeout(resolve, ARTIFICIAL_DELAY_MS);
  });
}

function createSession(user) {
  return {
    token: `${TOKEN_PREFIX}:${user.role}`,
    user,
  };
}

function createError(code, message) {
  return {
    error: {
      code,
      message,
    },
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getUser(identifier) {
  return USERS[identifier] ?? null;
}

function getUserFromToken(token) {
  if (!isNonEmptyString(token)) {
    return null;
  }

  if (!token.startsWith(`${TOKEN_PREFIX}:`)) {
    return null;
  }

  const role = token.slice(`${TOKEN_PREFIX}:`.length);
  return USERS[role] ?? null;
}

export async function login(identifier, password) {
  await delay();

  if (!isNonEmptyString(identifier) || !isNonEmptyString(password)) {
    return createError("VALIDATION_ERROR", "账号或密码格式不正确");
  }

  const user = getUser(identifier);

  if (!user) {
    return createError("USER_NOT_FOUND", "账号不存在");
  }

  if (password !== FIXED_PASSWORD) {
    return createError("INVALID_CREDENTIALS", "账号或密码错误");
  }

  return {
    session: createSession(user),
  };
}

export async function getSession({ token } = {}) {
  await delay();

  const user = getUserFromToken(token);

  if (!user) {
    return createError("INVALID_SESSION", "登录状态已失效，请重新登录");
  }

  return {
    session: createSession(user),
  };
}

export async function logout() {
  await delay();
  return { success: true };
}

export const mockAuthService = {
  login,
  getSession,
  logout,
};

export default mockAuthService;
