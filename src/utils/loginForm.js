const FIXED_PASSWORD = "glintrise-123";

export const loginProfiles = [
  {
    role: "employee",
    label: "内部员工",
    description: "进入员工工作台落点",
    identifier: "employee",
    password: FIXED_PASSWORD,
  },
  {
    role: "director",
    label: "部门总监",
    description: "进入总监工作台落点",
    identifier: "director",
    password: FIXED_PASSWORD,
  },
  {
    role: "developer",
    label: "开发维护",
    description: "进入内容维护后台",
    identifier: "developer",
    password: FIXED_PASSWORD,
  },
];

export function getMockLoginProfile(role) {
  return loginProfiles.find((profile) => profile.role === role);
}

export function validateLoginForm({ identifier, password }) {
  const errors = {};

  if (typeof identifier !== "string" || identifier.trim().length === 0) {
    errors.identifier = "请输入账号";
  }

  if (typeof password !== "string" || password.trim().length === 0) {
    errors.password = "请输入密码";
  }

  return errors;
}

export function normalizeLoginPayload({ identifier, password }) {
  return {
    identifier: typeof identifier === "string" ? identifier.trim() : "",
    password: typeof password === "string" ? password.trim() : "",
  };
}
