import { getAbsoluteHashUrl } from "./shareRoutes";

export async function shareCurrentPage(title, showNotice, route) {
  const shareTitle = `${title} | GLINT RISE`;
  const url = route ? getAbsoluteHashUrl(route) : window.location.href;

  try {
    if (navigator.share) {
      await navigator.share({
        title: shareTitle,
        text: shareTitle,
        url,
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }

    showNotice(`已分享：${title}`);
  } catch {
    showNotice(`已取消分享：${title}`);
  }
}
