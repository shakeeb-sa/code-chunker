// src/utils/chunker.js

export const estimateTokens = (text) => Math.ceil(text.length / 4);

export const getStats = (text) => {
  if (!text) return { lines: 0, chars: 0, words: 0, tokens: 0 };
  return {
    lines: text.split('\n').length,
    chars: text.length,
    words: text.trim().split(/\s+/).length,
    tokens: estimateTokens(text)
  };
};

export const splitText = (text, settings) => {
  if (!text) return [];
  
  const lines = text.split('\n');
  const totalLines = lines.length;
  let rawChunks = [];

  // 1. Logic to create raw chunks
  if (settings.mode === 'lines') {
    const size = parseInt(settings.lineCount) || 1500;
    for (let i = 0; i < totalLines; i += size) {
      rawChunks.push(lines.slice(i, i + size).join('\n'));
    }
  } else {
    const parts = parseInt(settings.partCount) || 5;
    const base = Math.floor(totalLines / parts);
    const rem = totalLines % parts;
    let pos = 0;
    for (let i = 0; i < parts; i++) {
      const size = base + (i < rem ? 1 : 0);
      if (size > 0) {
        rawChunks.push(lines.slice(pos, pos + size).join('\n'));
        pos += size;
      }
    }
  }

  // 2. Logic to Add Context (Prefix/Suffix)
  if (settings.useContext) {
    return rawChunks.map((chunk, i) => {
      const total = rawChunks.length;
      const current = i + 1;
      
      // Replace variables {i} and {total} in the user's template
      let prefix = settings.customPrefix
        .replace('{i}', current)
        .replace('{total}', total);
        
      let suffix = settings.customSuffix
        .replace('{i}', current)
        .replace('{total}', total);

      return `${prefix}\n\n${chunk}\n\n${suffix}`;
    });
  }

  return rawChunks;
};