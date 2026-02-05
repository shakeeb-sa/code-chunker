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

  if (settings.mode === 'lines') {
    const size = parseInt(settings.lineCount) || 1500;
    let currentLine = 0;

    while (currentLine < totalLines) {
      let endLine = Math.min(currentLine + size, totalLines);
      
      // --- SMART BREAK LOGIC ---
      // If we are NOT at the very end, try to find a better place to cut
      if (endLine < totalLines) {
        // Look backwards up to 10 lines for an empty line or a closing bracket
        for (let j = 0; j < 10; j++) {
          const target = endLine - j;
          if (lines[target].trim() === "" || lines[target].trim() === "}" || lines[target].trim() === ");") {
            endLine = target + 1; // Cut right after the clean break
            break;
          }
        }
      }

      rawChunks.push(lines.slice(currentLine, endLine).join('\n'));
      currentLine = endLine;
    }
  } else {
    // Equal Parts logic (already handles clean distribution)
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

  // 2. Add Context logic remains the same...
  if (settings.useContext) {
    return rawChunks.map((chunk, i) => {
      const total = rawChunks.length;
      const current = i + 1;
      let prefix = settings.customPrefix.replace('{i}', current).replace('{total}', total);
      let suffix = settings.customSuffix.replace('{i}', current).replace('{total}', total);
      return `${prefix}\n\n${chunk}\n\n${suffix}`;
    });
  }

  return rawChunks;
};