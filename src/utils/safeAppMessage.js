export function showAppMessage(app, type, content) {
  const api = app?.message;

  if (!api || !content) {
    return;
  }

  if (typeof api[type] === "function") {
    api[type](content);
    return;
  }

  if (typeof api.open === "function") {
    api.open({
      type,
      content,
    });
  }
}
