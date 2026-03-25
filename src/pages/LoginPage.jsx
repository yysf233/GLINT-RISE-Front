import React from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { useAuth } from "../context/useAuth";
import { resolvePostLoginRoute } from "../utils/authRoutes";
import { getMockLoginProfile, loginProfiles, normalizeLoginPayload, validateLoginForm } from "../utils/loginForm";

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isBootstrapping, login, user } = useAuth();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [submitError, setSubmitError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const postLoginRoute = user ? resolvePostLoginRoute(user.role, location.state?.from) : undefined;

  if (isBootstrapping) {
    return null;
  }

  if (isAuthenticated && postLoginRoute) {
    return <Navigate to={postLoginRoute} replace />;
  }

  const handleIdentifierChange = (event) => {
    setIdentifier(event.target.value);
    setErrors((currentErrors) => ({ ...currentErrors, identifier: undefined }));
    setSubmitError("");
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setErrors((currentErrors) => ({ ...currentErrors, password: undefined }));
    setSubmitError("");
  };

  const handleQuickFill = (role) => {
    const profile = getMockLoginProfile(role);

    if (!profile) {
      return;
    }

    setIdentifier(profile.identifier);
    setPassword(profile.password);
    setErrors({});
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalizedPayload = normalizeLoginPayload({ identifier, password });
    const nextErrors = validateLoginForm(normalizedPayload);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(normalizedPayload.identifier, normalizedPayload.password);

      if (result?.session) {
        navigate(resolvePostLoginRoute(result.session.user.role, location.state?.from), { replace: true });
        return;
      }

      setSubmitError(result?.error?.message ?? "登录失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-4xl pt-4 text-white" data-login-layout="prototype-dark">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-10 inline-flex items-center gap-2 text-sm tracking-[0.22em] text-white/62 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          返回入口
        </button>

        <div className="rounded-[30px] border border-white/6 bg-[#1c1b1b] p-8 md:p-12" style={{ boxShadow: "0 28px 72px rgba(0, 0, 0, 0.28)" }}>
          <div className="mb-4 text-xs tracking-[0.3em] text-[#bac3ff]">登录入口</div>
          <h1
            className="text-white"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.8rem, 8vw, 4rem)",
              fontWeight: 800,
              letterSpacing: "-0.05em",
            }}
          >
            账号登录
          </h1>
          <p className="mt-4 max-w-2xl text-white/66">
            当前为前端 mock 认证。提交成功后会按角色进入对应工作台；如果你是从受保护页面跳转过来的，系统会优先返回角色有权限访问的原目标页。
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {loginProfiles.map((profile) => (
              <button
                key={profile.role}
                type="button"
                onClick={() => handleQuickFill(profile.role)}
                className="rounded-[24px] border border-white/6 bg-[#101114] px-4 py-4 text-left transition hover:-translate-y-1 hover:border-white/14"
              >
                <div className="text-xs tracking-[0.26em] text-[#bac3ff]">{profile.role}</div>
                <div className="mt-3 text-lg font-semibold text-white">{profile.label}</div>
                <p className="mt-2 text-sm leading-6 text-white/62">{profile.description}</p>
                <div className="mt-3 text-xs tracking-[0.18em] text-white/34">账号：{profile.identifier}</div>
              </button>
            ))}
          </div>

          <form className="mt-10 grid gap-4" onSubmit={handleSubmit}>
            <div>
              <input
                className="w-full rounded-[24px] border border-white/8 bg-[#101114] px-5 py-4 text-white outline-none placeholder:text-white/34"
                placeholder="邮箱 / 用户名"
                aria-label="邮箱或用户名"
                value={identifier}
                onChange={handleIdentifierChange}
                autoComplete="username"
              />
              {errors.identifier ? (
                <p className="mt-2 text-sm text-[#bac3ff]" role="alert">
                  {errors.identifier}
                </p>
              ) : null}
            </div>

            <div>
              <input
                className="w-full rounded-[24px] border border-white/8 bg-[#101114] px-5 py-4 text-white outline-none placeholder:text-white/34"
                placeholder="密码"
                type="password"
                aria-label="密码"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
              />
              {errors.password ? (
                <p className="mt-2 text-sm text-[#bac3ff]" role="alert">
                  {errors.password}
                </p>
              ) : null}
            </div>

            <div className="flex items-start gap-3 rounded-[24px] border border-white/6 bg-[#101114] px-4 py-4 text-sm leading-6 text-white/62">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#bac3ff]" />
              <div>
                固定测试密码：
                <span className="font-semibold text-white"> glintrise-123</span>
                。点击上方角色卡片会自动填充账号和密码，但不会自动提交。
              </div>
            </div>

            {submitError ? (
              <p className="text-sm text-[#bac3ff]" role="alert">
                {submitError}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                className="rounded-full bg-[#4453a7] px-8 py-3 font-bold tracking-[0.22em] text-white transition hover:bg-[#5262c2]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "登录中" : "登录"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-full border border-white/10 bg-white/4 px-8 py-3 tracking-[0.22em] text-white/78 transition hover:bg-white/10 hover:text-white"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </section>
    </PageShell>
  );
}

export default LoginPage;
