// Configure your AI endpoints and keys here.
// Replace placeholders with your real service info.

export const AI_CONFIG = {
  // Endpoint for your Nano Banana (or similar) image generation service
  // Expected to accept POST JSON: { prompt: string, context?: any }
  // and return JSON: { image_url: string }
  NANO_BANANA_URL: 'https://YOUR-NANO-BANANA-ENDPOINT',

  // Optional auth header for your service (e.g., 'Bearer ...')
  NANO_BANANA_AUTH: '',

  // Google AI Studio (Gemini) API key if you want to enrich the prompt.
  // Not strictly required if your Nano Banana handles prompt engineering.
  GEMINI_API_KEY: 'AIzaSyCoomncGi69lw8g3uLQk4Bu4q3ppshY2Oo',

  // Optional Banana.dev keys; if present, we will use Banana start/check flow.
  BANANA_API_KEY: '',
  BANANA_MODEL_KEY: '',
};
