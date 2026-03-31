import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BusinessData } from "../types"; 
import { TRANSLATIONS as UI_STRINGS } from "../constants";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
if (!apiKey) {
  console.error("Missing VITE_GEMINI_API_KEY in environment variables");
}

const ai = new GoogleGenAI({ apiKey });

const THEMES = [
  "Royal Gold: deep navy (#0f172a) full-page background, emerald-to-gold gradient hero, gold shimmer cards, serif headings",
  "Ocean Premium: midnight blue (#0c1445) full-page background, cyan-to-blue gradient hero, frosted glass cards, bold sans headings",
  "Modern Sunset: deep rose (#1a0a0f) full-page background, orange-to-pink gradient hero, warm glass cards, elegant rounded headings",
  "Midnight Sleek: pure black (#050505) full-page background, indigo-to-violet gradient hero, neon green accents, sharp tech look",
  "Nature Wellness: deep forest (#0a1a0f) full-page background, sage-to-emerald gradient hero, soft organic cards, calm rounded headings",
  "Bold Retail: deep crimson (#1a0505) full-page background, red-to-orange gradient hero, high-contrast white cards, heavy bold headings",
  "Festive Vibes: deep purple (#12004a) full-page background, fuchsia-to-violet gradient hero, gold shimmer cards, festive bold headings",
  "Earthy Tones: deep brown (#1a0f05) full-page background, amber-to-terracotta gradient hero, warm sand cards, rustic serif headings",
  "Royal Indigo: deep indigo (#07001a) full-page background, purple-to-pink gradient hero, glass cards with purple glow, elegant headings",
  "Tropical Luxury: deep teal (#001a1a) full-page background, teal-to-lime gradient hero, frosted cards, vibrant tropical accents"
];

const SYSTEM_PROMPT = `
You are Vyapara Mithra — a world-class UI/UX designer building ULTRA-PREMIUM mobile business websites for Indian entrepreneurs using Tailwind CSS inline classes only.

══════════════════════════════════════
CRITICAL: FULL PAGE BACKGROUND — NON-NEGOTIABLE
══════════════════════════════════════
The OUTERMOST wrapper div MUST have a DARK gradient background that covers the ENTIRE page:
  class="min-h-screen w-full bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] font-sans"
Adjust the gradient colors to match the theme. NEVER use bg-white or bg-gray-* as the page background.

══════════════════════════════════════
HERO SECTION — MUST BE SPECTACULAR
══════════════════════════════════════
- Full-width hero with bold gradient background (different from page bg)
- Business name as HUGE gradient text: class="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-emerald-400 break-words"
- Tagline in white/light color, max 10 words
- One large centered emoji (text-7xl)
- "Call Now" CTA button: class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black px-8 py-4 rounded-full shadow-lg shadow-emerald-500/30 text-lg break-words"

══════════════════════════════════════
CARDS & SECTIONS — GLASSMORPHISM
══════════════════════════════════════
ALL cards MUST use: class="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 break-words"
Section headings: class="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-white break-words"
Body text: class="text-white/80 text-base leading-relaxed break-words"

══════════════════════════════════════
BUTTONS — ALL MUST BE STYLED
══════════════════════════════════════
Call Now button: class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/30 text-xl break-words"
WhatsApp button: class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg text-xl break-words"
Map/Location button: class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/30 text-xl break-words"
NEVER leave any button or link without color/gradient styling.

══════════════════════════════════════
MAP SECTION — ALWAYS STYLED
══════════════════════════════════════
The map/location section MUST have a styled "Open In Maps" button like this:
<a href="{mapsUrl}" target="_blank" class="block w-full text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/30 text-xl break-words no-underline">
  📍 Open In Maps
</a>
NEVER render a plain unstyled link for the map.

══════════════════════════════════════
PRODUCT CARDS — VIBRANT
══════════════════════════════════════
Each product card: class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 flex flex-col items-center text-center gap-3 break-words"
Product emoji: class="text-5xl"
Product name: class="text-lg font-black text-white break-words"
Product description: class="text-white/70 text-sm break-words"

══════════════════════════════════════
STRICT RULES
══════════════════════════════════════
1. ALL text elements MUST have 'break-words whitespace-normal' — NO exceptions.
2. NEVER use bg-white, bg-gray-100, or light backgrounds for the page — dark themes ONLY.
3. NEVER output plain unstyled links — every <a> tag needs gradient/color classes.
4. Output ONLY the raw <div>...</div> structure. No markdown, no \`\`\`html fences.
5. Use Tailwind CSS utility classes only — no custom CSS, no <style> tags.
6. All sections use py-8 px-4 padding minimum.
7. Responsive text: headings text-3xl md:text-5xl, body text-base md:text-lg.
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
Build an ULTRA-PREMIUM dark-themed business website for:

Business Name: ${data.name || 'Apna Business'}
Business Type: ${data.description}
Phone: ${data.phone}
Address: ${cleanAddress || 'Local Area'}
Maps URL: ${mapsUrl}
Language: ${language}
Theme: ${randomTheme}
Style Seed: ${styleSeed}

REQUIRED SECTIONS (in this order):
1. HERO — Dark gradient background, huge gradient business name, tagline, emoji, Call Now button
2. ABOUT US — Glassmorphism card, persuasive 40-word story about the business
3. FEATURED ITEMS — 3 product/service cards relevant to "${data.description}" with emoji, name, short description
4. VISIT US — Address text + styled "📍 Open In Maps" button linking to: ${mapsUrl} + styled "📞 Call Now" button linking to: tel:${data.phone}

CRITICAL REMINDERS:
- Page background MUST be dark gradient (not white)
- Map button MUST be styled with blue gradient classes
- ALL buttons must have gradient + shadow classes
- ALL text must have break-words class
- Cards must use glassmorphism (bg-white/10 backdrop-blur-xl)
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: { 
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.85,
      },
      contents: prompt,
    });
    
    const html = sanitizeHtml(response.text || "");
    if (!html) throw new Error("AI generation returned nothing");
    return html;
  } catch (error) {
    console.error("Generation error:", error);
    const fallback = UI_STRINGS['en'];
    return `<div class="min-h-screen w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-8">
      <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center break-words max-w-sm">
        <div class="text-6xl mb-6">✨</div>
        <h2 class="text-2xl font-black text-white break-words">${fallback.mithra_break}</h2>
        <p class="text-white/70 mt-4 text-lg break-words">${fallback.retry_msg}</p>
      </div>
    </div>`;
  }
};

export const editWebsite = async (currentHtml: string, instruction: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: { 
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7
      },
      contents: `Current website HTML:\n${currentHtml}\n\nUser instruction: ${instruction}\n\nTask: Apply the requested change while keeping the dark premium theme, glassmorphism cards, gradient buttons, and ALL text with break-words class. Return ONLY the updated raw <div>...</div>.`,
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