const { GoogleGenAI } = require('@google/genai');
const { memoryOps, settingsOps } = require('./db');

function getApiKey(customKey = null) {
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  const dbKey = settingsOps.get('gemini_api_key');
  if (dbKey && dbKey.trim().length > 0) {
    return dbKey.trim();
  }
  return process.env.GEMINI_API_KEY || '';
}

function buildSystemInstruction(isDeepResearch = false) {
  const customPersona = settingsOps.get('system_persona');
  
  let basePersona = '';
  if (isDeepResearch) {
    basePersona = `You are Ajji's personal AI operating in DeepSeek Deep Research & Reasoning Mode (modeled directly on DeepSeek-R1 / DeepSeek Reasoner on deepseek.com).
Your purpose is to provide exhaustive, intellectually rigorous, multi-faceted research answers that mirror the exact depth, structure, and analytical standard of DeepSeek.

CRITICAL PROTOCOL FOR DEEP RESEARCH:
1. MANDATORY REASONING CHAIN (<think>...</think>):
You MUST ALWAYS begin your response with an extensive, highly analytical thought process enclosed in <think> and </think>.
Inside <think>:
- Deconstruct the user's question from first principles into core technical, empirical, or theoretical sub-questions.
- Hypothesize multiple angles, trade-offs, counter-perspectives, edge cases, and potential pitfalls.
- Systematically cross-examine claims, architectural designs, algorithms, or evidence.
- Outline the comprehensive structure of the research report before closing with </think>.

2. EXHAUSTIVE DEEPSEEK RESEARCH REPORT (After </think>):
Deliver an authoritative, comprehensive, publication-grade research report in clean Markdown:
- # Title & Executive Summary (High-density direct findings)
- ## 1. Theoretical Foundations & Core Architecture / Mechanisms
- ## 2. In-Depth Technical Breakdown & Empirical Analysis
- ## 3. Comparative Matrix & Trade-Offs (Include rich Markdown tables)
- ## 4. State-of-the-Art Implementations & Real-World Case Studies
- ## 5. Critical Challenges, Edge Cases & Practical Limitations
- ## 6. Strategic Takeaways & Actionable Conclusions

Maintain maximum intellectual rigor, precise terminology, verified details, and structured formatting just like DeepSeek.`;
  } else {
    basePersona = customPersona || 
      "You are Ajji's personal AI assistant. You are thoughtful, sharp, and helpful. You speak naturally, provide insightful answers, and format your responses cleanly in Markdown.";
  }

  const memories = memoryOps.list();
  let memoryBlock = '';
  if (memories.length > 0) {
    memoryBlock = `\n\n### Long-Term Memory (Facts about Ajji):
${memories.map(m => `- [${m.category}] ${m.content}`).join('\n')}
(Use these facts naturally when relevant. When Ajji shares new important preferences, facts, or instructions they want you to remember, you can output [MEMORY: short fact here] at the end of your response to permanently save it to long-term memory.)`;
  } else {
    memoryBlock = `\n\n(When Ajji shares personal preferences, facts, or explicit requests to remember something, you can append [MEMORY: short fact here] at the very end of your answer to save it to long-term memory.)`;
  }

  return `${basePersona}${memoryBlock}`;
}

async function streamChat({
  apiKey,
  model = 'gemini-3.1-flash-lite',
  history = [],
  newMessage,
  attachment = null,
  enableSearch = false,
  onChunk,
  onGrounding,
  onComplete,
  onError
}) {
  try {
    const key = getApiKey(apiKey);
    if (!key) {
      throw new Error('Gemini API Key is missing. Please enter your API key in Settings.');
    }

    const ai = new GoogleGenAI({ apiKey: key });

    // Format contents
    const contents = [];
    for (const msg of history) {
      const parts = [];
      if (msg.attachment_data && msg.attachment_type) {
        parts.push({
          inlineData: {
            mimeType: msg.attachment_type,
            data: msg.attachment_data
          }
        });
      }
      parts.push({ text: msg.content || '' });
      contents.push({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: parts
      });
    }

    // Add current user turn
    const currentParts = [];
    if (attachment && attachment.data && attachment.mimeType) {
      currentParts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.data
        }
      });
    }
    currentParts.push({ text: newMessage || '' });
    contents.push({
      role: 'user',
      parts: currentParts
    });

    const candidateModels = Array.from(new Set([model, 'gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash'])).filter(Boolean);
    let fullText = '';
    let groundingData = null;

    // Helper to attempt streaming with or without search tools
    async function executeStream(withSearch) {
      const config = {
        systemInstruction: buildSystemInstruction(enableSearch),
        temperature: enableSearch ? 0.75 : 0.7
      };
      if (withSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      let lastError = null;
      for (const m of candidateModels) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: m,
            contents: contents,
            config: config
          });

          for await (const chunk of responseStream) {
            const delta = chunk.text || '';
            if (delta) {
              fullText += delta;
              if (onChunk) onChunk(delta);
            }

            const candidate = chunk.candidates?.[0];
            if (candidate?.groundingMetadata) {
              const gm = candidate.groundingMetadata;
              groundingData = {
                webSearchQueries: gm.webSearchQueries || [],
                groundingChunks: (gm.groundingChunks || []).map(c => ({
                  title: c.web?.title || 'Source',
                  url: c.web?.uri || '#'
                })).filter(c => c.url && c.url !== '#')
              };
              if (onGrounding) onGrounding(groundingData);
            }
          }
          return; // Stream completed successfully
        } catch (modelErr) {
          lastError = modelErr;
          console.warn(`Model ${m} stream attempt error (${modelErr.message}). Trying next candidate...`);
        }
      }

      if (lastError) throw lastError;
    }

    try {
      // First attempt with requested search preference
      await executeStream(enableSearch);
    } catch (streamErr) {
      // If failed while search was enabled (often 429 quota on free search grounding), fallback to without search
      if (enableSearch) {
        console.warn('Google Search Grounding failed (likely free tier quota limit). Retrying without search tool...');
        fullText = ''; // reset accumulated text if any
        await executeStream(false);
      } else {
        throw streamErr;
      }
    }

    // Check for [MEMORY: ...] tag
    const memoryRegex = /\[MEMORY:\s*([^\]]+)\]/gi;
    let memoryMatch;
    let cleanedText = fullText;
    while ((memoryMatch = memoryRegex.exec(fullText)) !== null) {
      const fact = memoryMatch[1].trim();
      if (fact) {
        memoryOps.add(fact, 'auto');
      }
    }
    cleanedText = cleanedText.replace(memoryRegex, '').trim();

    if (onComplete) {
      onComplete({
        fullText: cleanedText,
        groundingData: groundingData
      });
    }
  } catch (err) {
    if (onError) onError(err);
  }
}

async function generateTitle(apiKey, firstMessage, firstReply) {
  try {
    const key = getApiKey(apiKey);
    if (!key) return null;

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Generate a very short, concise 3-5 word title for a conversation that starts with:
User: "${firstMessage.slice(0, 200)}"
Assistant: "${firstReply.slice(0, 200)}"

Return ONLY the plain title without quotes or punctuation.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text ? response.text.trim().replace(/^["']|["']$/g, '') : null;
  } catch (e) {
    return null;
  }
}

module.exports = {
  getApiKey,
  buildSystemInstruction,
  streamChat,
  generateTitle
};
