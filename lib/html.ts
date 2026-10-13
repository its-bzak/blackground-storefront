// True when merchant-written HTML has something to show: text, or media on its
// own. Empty paragraphs and line breaks don't count.
export function hasContent(html: string | null | undefined): boolean {
  if (!html) return false;
  if (/<(img|iframe|video)\b/i.test(html)) return true;
  return (
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim().length > 0
  );
}
