import {
  getAuthUserByIdentifier,
  getAuthUserByToken,
} from "./mock/mockWorkspaceUsersService";

const TOKEN_PREFIX = "mock-session-token";
const FIXED_PASSWORD = "glintrise-123";
const ARTIFICIAL_DELAY_MS = 10;

function delay() {
  return new Promise((resolve) => {
    setTimeout(resolve, ARTIFICIAL_DELAY_MS);
  });
}

function createSession(user) {
  return {
    token: `${TOKEN_PREFIX}:${user.identifier || user.role}`,
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

export async function login(identifier, password) {
  await delay();

  if (!isNonEmptyString(identifier) || !isNonEmptyString(password)) {
    return createError("VALIDATION_ERROR", "账号或密码格式不正确");
  }

  const result = await getAuthUserByIdentifier(identifier);
  if (!result?.user) {
    return result?.error
      ? result
      : createError("USER_NOT_FOUND", "账号不存在");
  }

  if (password !== FIXED_PASSWORD) {
    return createError("INVALID_CREDENTIALS", "账号或密码错误");
  }

  return {
    session: createSession(result.user),
  };
}

export async function getSession({ token } = {}) {
  await delay();

  const result = await getAuthUserByToken(token);
  if (!result?.user) {
    return createError("INVALID_SESSION", "登录状态已失效，请重新登录");
  }

  return {
    session: createSession(result.user),
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
