import { AI_CONFIG } from '@/config/ai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { uploadFromUrl, uploadBase64 } from '@/services/storage'
import { supabase } from '@/supabse/Supabase'
import { WardrobeItem } from '@/types/database'

type OutfitPieces = {
  top?: WardrobeItem | null
  bottom?: WardrobeItem | null
  accessory?: WardrobeItem | null
}

function buildPrompt(pieces: OutfitPieces) {
  const parts: string[] = []
  if (pieces.top) parts.push(`${pieces.top.color || ''} ${pieces.top.name || pieces.top.subcategory || 'top'} ${pieces.top.brand || ''}`.trim())
  if (pieces.bottom) parts.push(`${pieces.bottom.color || ''} ${pieces.bottom.name || pieces.bottom.subcategory || 'bottom'} ${pieces.bottom.brand || ''}`.trim())
  if (pieces.accessory) parts.push(`${pieces.accessory.color || ''} ${pieces.accessory.name || pieces.accessory.subcategory || 'accessory'} ${pieces.accessory.brand || ''}`.trim())

  if (parts.length === 0) {
    return 'stylish minimalist casual outfit'
  }

  return parts.join(' and ')
}

async function callBanana(prompt: string, userId?: string): Promise<string> {
  const apiKey = (AI_CONFIG as any).BANANA_API_KEY
  const modelKey = (AI_CONFIG as any).BANANA_MODEL_KEY
  if (!apiKey || !modelKey) throw new Error('BANANA_API_KEY or BANANA_MODEL_KEY missing in config/ai.ts')

  const startRes = await fetch('https://api.banana.dev/start/v4/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey,
      modelKey,
      modelInputs: { prompt },
    }),
  })
  if (!startRes.ok) throw new Error(`Banana start failed: ${startRes.status} ${await startRes.text().catch(()=> '')}`)
  const startJson = await startRes.json().catch(() => ({})) as any
  const callID = startJson?.callID
  if (!callID) throw new Error('Banana start missing callID')

  const poll = async (): Promise<any> => {
    const checkRes = await fetch('https://api.banana.dev/check/v4/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, callID }),
    })
    if (!checkRes.ok) throw new Error(`Banana check failed: ${checkRes.status} ${await checkRes.text().catch(()=> '')}`)
    const out = await checkRes.json().catch(() => ({})) as any
    if (out?.message === 'success' && out?.finished) return out
    await new Promise(r => setTimeout(r, 1500))
    return poll()
  }
  const result = await poll()
  // Try various shapes
  const imageUrl = result?.modelOutputs?.[0]?.image_url || result?.image_url
  const base64 = result?.modelOutputs?.[0]?.image_base64 || result?.image_base64
  if (imageUrl) return imageUrl
  if (base64 && userId) {
    const uploaded = await uploadBase64({ base64, bucket: 'wardrobe', userId, folder: 'previews', filenameBase: 'banana' })
    return uploaded.publicUrl
  }
  throw new Error('Banana result missing image output')
}

export async function generateOutfitImage(pieces: OutfitPieces, userIdForUpload?: string): Promise<string> {
  let prompt = buildPrompt(pieces)

  // Get user profile photo for virtual try-on
  let userProfileImageUrl = null
  if (userIdForUpload) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userIdForUpload)
        .single()

      userProfileImageUrl = profile?.avatar_url
    } catch (e) {
      console.warn('Could not fetch user profile image:', e)
    }
  }

  const payload = {
    prompt,
    userProfileImageUrl, // Add profile photo for virtual try-on
    context: {
      // Provide direct item image URLs as context
      images: [pieces.top?.image_url, pieces.bottom?.image_url, pieces.accessory?.image_url].filter(Boolean),
      meta: {
        top: pieces.top ? { id: pieces.top.id, color: pieces.top.color, brand: pieces.top.brand } : null,
        bottom: pieces.bottom ? { id: pieces.bottom.id, color: pieces.bottom.color, brand: pieces.bottom.brand } : null,
        accessory: pieces.accessory ? { id: pieces.accessory.id, color: pieces.accessory.color, brand: pieces.accessory.brand } : null,
      },
    },
    // Some services expect `inputs` wrapper
    inputs: { prompt },
  }

  // If Banana config provided, use Banana; else use generic endpoint
  if ((AI_CONFIG as any).BANANA_API_KEY && (AI_CONFIG as any).BANANA_MODEL_KEY) {
    return callBanana(prompt, userIdForUpload)
  }

  // If only Gemini is configured, prefer calling Edge Function to avoid CORS and hide key
  if (AI_CONFIG.GEMINI_API_KEY && (!AI_CONFIG.NANO_BANANA_URL || AI_CONFIG.NANO_BANANA_URL.includes('YOUR-NANO-BANANA-ENDPOINT')) &&
      !(AI_CONFIG as any).BANANA_API_KEY) {
    // call Supabase Edge Function: generate-image
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: {
        prompt,
        images: payload.context.images,
        userProfileImageUrl: payload.userProfileImageUrl
      },
    }) as any
    if (error) throw new Error(error?.message || 'Edge function failed')
    const base64 = data?.image_base64
    if (!base64) throw new Error('No image data from edge function')
    if (!userIdForUpload) return `data:image/jpeg;base64,${base64}`
    const uploaded = await uploadBase64({ base64, bucket: 'wardrobe', userId: userIdForUpload, folder: 'previews', filenameBase: 'gemini' })
    return uploaded.publicUrl
  }

  // Generic nano banana style endpoint with timeout and verbose logging
  console.log('[AI] POST', AI_CONFIG.NANO_BANANA_URL, payload)
  const controller = new AbortController()
  const to = setTimeout(() => controller.abort(), 30000)
  const res = await fetch(AI_CONFIG.NANO_BANANA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(AI_CONFIG.NANO_BANANA_AUTH ? { Authorization: AI_CONFIG.NANO_BANANA_AUTH } : {}),
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
  clearTimeout(to)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Nano Banana request failed: ${res.status} ${res.statusText} ${text}`)
  }
  const data = await res.json().catch(() => ({})) as any
  console.log('[AI] response', data)
  const imageUrl = data?.image_url || data?.output?.image_url || data?.data?.image_url
  if (!imageUrl) {
    // Try base64 fallback shapes
    const base64 = data?.image_base64 || data?.output?.image_base64 || data?.data?.image_base64
    if (base64 && userIdForUpload) {
      const uploaded = await uploadBase64({ base64, bucket: 'wardrobe', userId: userIdForUpload, folder: 'previews', filenameBase: 'generated' })
      return uploaded.publicUrl
    }
    throw new Error('Nano Banana response missing image_url')
  }
  // Optionally upload into Supabase storage for persistence
  if (userIdForUpload) {
    try {
      const uploaded = await uploadFromUrl({ url: imageUrl, bucket: 'wardrobe', userId: userIdForUpload, folder: 'previews' })
      return uploaded.publicUrl
    } catch {
      // fall back to external URL
      return imageUrl
    }
  }
  return imageUrl
}

// Removed direct Google Images API call from client to avoid CORS; routed via Edge Function instead.
