export function isProbablyHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function forceAnchorTargets(value: string) {
  return value.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
    const hasTarget = /\btarget\s*=\s*['"][^'"]*['"]/i.test(attrs);
    const hasRel = /\brel\s*=\s*['"][^'"]*['"]/i.test(attrs);
    const targetAttr = hasTarget ? "" : " target=\"_blank\"";
    const relAttr = hasRel ? "" : " rel=\"noreferrer\"";
    return `<a${attrs}${targetAttr}${relAttr}>`;
  });
}
