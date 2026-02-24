import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BusinessData } from "../types"; 
import { TRANSLATIONS as UI_STRINGS } from "../constants";

// Vite exposes env variables with VITE_ prefix
const apiKey = import.meta.env.VITE_API_KEY;
if (!apiKey) {
  console.error("Missing VITE_API_KEY in environment variables");
}

const ai = new GoogleGenAI({ apiKey });

const THEMES = [
  "Royal Gold (emerald & gold gradients, serif headers, luxurious glass cards, deep navy background)",
  "Ocean Premium (navy to cyan gradients, modern sans-serif, frosted glass, light blue accents)",
  "Modern Sunset (orange to rose gradients, soft blurs, elegant fonts, warm cream background)",
  "Midnight Sleek (black to indigo gradients, neon green accents, sharp high-tech look)",
  "Nature Wellness (sage to olive gradients, organic shapes, calming beige background)",
  "Bold Retail (bright red to orange gradients, heavy black fonts, high-contrast cards)",
  "Soft Pastel (pink to lavender gradients, rounded corners, friendly playful fonts)",
  "Minimal Mono (monochrome gray scale with a single teal accent, clean lines)",
  "Festive Vibes (purple to fuchsia gradients, festive emojis, vibrant yellow accents)",
  "Earthy Tones (brown to terracotta gradients, rustic textures, warm sand background)"
];

const SYSTEM_PROMPT = `
You are Vyapara Mithra, a world-class UI/UX Designer and Conversion Copywriter. 
Your goal is to build an "Ultra-Premium" business website for Indian entrepreneurs.

**Design Philosophy**: Every website must feel unique and tailored to the business type. Vary the overall color scheme, layout arrangement, and visual flair for each request. Do not repeat the same background colors or section ordering.

DESIGN RULES (STRICT):
1. GRADIENT TEXT: Use 'bg-clip-text text-transparent bg-gradient-to-r from-...' for all Shop Names and Titles.
2. GLASSMORPHISM & WRAPPING: Use 'bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-[2.5rem] overflow-hidden max-w-full' for cards.
3. TEXT OVERFLOW PROTECTION: Every single text tag (h1, h2, p, span, button) MUST have 'break-words whitespace-normal' classes. Never use 'whitespace-nowrap'.
4. RESPONSIVE FONTS: Use responsive sizes. Titles should be 'text-3xl md:text-5xl' (NOT fixed text-7xl). Paragraphs should be 'text-base md:text-lg'.
5. NO GAPS: Use 'py-6' for section padding. Do NOT use top/bottom margins (mt- or mb-) on main section containers.
6. EMOJI ICONOGRAPHY: Start sections with ONE 'text-6xl md:text-7xl' hero emoji centered.
7. PRODUCT GRID: Use 'grid grid-cols-1 md:grid-cols-2 gap-4' and ensure cards don't overflow parent containers.

WORD LIMITS:
- Hero: 40 words.
- About: 50 words.
- Products: 15 words per card.
- Contact: 15 words.

STRICT CONSTRAINTS:
- Use Tailwind CSS.
- Output ONLY raw <div> structure. No markdown.
- Ensure all content fits within a mobile screen width.
`;

const sanitizeHtml = (raw: string): string => {
  let clean = raw.trim();
  clean = clean.replace(/```html/gi, '').replace(/```/g, '').trim();
  const divMatch = clean.match(/<div[\s\S]*<\/div>/i);
  if (divMatch) return divMatch[0];
  return clean;
};

export const generateWebsite = async (data: BusinessData, language: string): Promise<string> => {
  const cleanAddress = (data.address || '').replace(/\(Location detected\)/g, '').trim();
  
  const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
  const styleSeed = Math.floor(Math.random() * 100) + 1;

  let mapsUrl = '';
  if (data.lat && data.lng) {
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${data.lat.toFixed(7)},${data.lng.toFixed(7)}`;
  } else if (cleanAddress) {
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress)}`;
  }

  const prompt = `
    Build a Premium Website for:
    Name: ${data.name || 'Apna Business'}
    Work: ${data.description}
    Phone: ${data.phone}
    Location: ${data.address || 'Local Area'}
    Map: ${mapsUrl}
    Language: ${language}
    
    Style Instructions:
    - Theme: ${randomTheme}
    - Style Seed: ${styleSeed} (use this number to influence color choices and layout variations – different seeds should produce different designs)
    
    REQUIRED SECTIONS:
    1. Hero: Gradient name, tagline, big icon. (Use break-words)
    2. About Us: Persuasive quality story. (Use break-words)
    3. Featured Products: 3 specific items relevant to ${data.description}. (Use break-words)
    4. Visit Us: Address and "Call Now" button. (Use break-words)

    SPACING RULE: py-6 for sections. Ensure text stays INSIDE borders using break-words.
  `;

  try {
    console.log("Generating website with prompt:", prompt); // Debug log
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // revert to the working model
      config: { 
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.9,
      },
      contents: prompt,
    });
    
    const html = sanitizeHtml(response.text || "");
    if (!html) throw new Error("AI generation returned nothing");
    return html;
  } catch (error) {
    console.error("Generation error:", error); // Now you'll see the real error in console
    const fallback = UI_STRINGS['en'];
    return `<div class="p-8 text-center bg-white rounded-[3rem] shadow-2xl border-4 border-slate-100 mx-6 my-10 break-words">
      <div class="text-6xl mb-6">✨</div>
      <h2 class="text-2xl font-black text-slate-800">${fallback.mithra_break}</h2>
      <p class="text-slate-500 mt-4 text-lg font-bold">${fallback.retry_msg}</p>
    </div>`;
  }
};

export const editWebsite = async (currentHtml: string, instruction: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: { 
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7
      },
      contents: `Current UI: ${currentHtml}\n\nChange: ${instruction}\n\nTask: Maintain premium aesthetic, TIGHT vertical spacing (py-6), and ensure ALL text has 'break-words'.`,
    });
    return sanitizeHtml(response.text || currentHtml);
  } catch (error) {
    console.error("Edit failed:", error);
    return currentHtml;
  }
};

export const getAddressFromCoords = async (lat: number, lng: number, language: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `I need the PINPOINT EXACT STOREFRONT address for coordinates: ${lat}, ${lng}. 
      IGNORE generic locality-only results. Find the EXACT building name, shop number (if visible), floor, and precise street. 
      CRITICAL: Identify the absolute NEAREST landmark (e.g., 'Directly opposite XYZ Medical', 'Adjacent to ABC Temple'). 
      This is for a business storefront, so accuracy within 5-10 meters is required.
      Language: ${language}. 
      Return ONLY the final precise physical address string. No conversational text.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });

    const result = response.text?.trim();
    return result || `Pinpoint Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    return `Verified Store Spot`;
  }
};