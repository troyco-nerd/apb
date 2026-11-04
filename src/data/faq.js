// Extracts FAQ question/answer pairs from a blog post's Markdown so the post
// template can output FAQPage structured data (JSON-LD).
//
// It looks for an H2 FAQ section ("Frequently Asked Questions", "FAQs About…",
// "Common Questions About…"), then treats each H3 ending in "?" as a question
// and the text under it (until the next heading) as the answer. Because the
// data comes from the visible post content, the markup always matches the page.

const FAQ_HEADING = /^##\s+.*\b(frequently asked|faqs?|common questions)\b/i;

// Markdown -> plain text for answers.
function toPlainText(markdown) {
  return markdown
    .split('\n')
    .filter((line) => !/^\s*-\s+\[\*\*Share\*\*\]/.test(line)) // social share links
    .filter((line) => !/^\s*!\[/.test(line)) // images
    .join('\n')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // inline images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> anchor text
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(^|[^\w*])[*_]([^*_\n]+)[*_](?=[^\w*]|$)/g, '$1$2') // italics
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, '') // list markers
    .replace(/\\([\\`*_{}\[\]()#+\-.!])/g, '$1') // markdown escapes
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanHeading(text) {
  return toPlainText(text.replace(/^#+\s*/, ''));
}

export function extractFaq(markdown = '') {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => FAQ_HEADING.test(line));
  if (start === -1) return [];

  const faq = [];
  let question = null;
  let answerLines = [];

  const flush = () => {
    if (question) {
      const answer = toPlainText(answerLines.join('\n'));
      if (answer) faq.push({ question, answer });
    }
    question = null;
    answerLines = [];
  };

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s/.test(line)) break; // next H2 ends the FAQ section
    if (/^###\s/.test(line)) {
      flush();
      const heading = cleanHeading(line);
      question = heading.endsWith('?') ? heading : null;
      continue;
    }
    if (question) answerLines.push(line);
  }
  flush();
  return faq;
}
