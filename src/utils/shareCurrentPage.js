export async function shareCurrentPage(title, showNotice) {
  const shareTitle = `${title} | GLINT RISE`;
  const url = window.location.href;

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
