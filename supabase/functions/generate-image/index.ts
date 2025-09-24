// // Supabase Edge Function: generate-image
// // Use Gemini's multimodal capabilities to analyze wardrobe items and generate combined outfit images
// // Set secret before deploy: supabase secrets set GEMINI_API_KEY=your_key

// // deno-lint-ignore-file no-explicit-any
// import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "*",
// };

// serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   try {
//     const { prompt, images, userProfileImageUrl } = await req.json();
//     const apiKey = Deno.env.get("GEMINI_API_KEY");
    
//     if (!apiKey) {
//       return new Response(JSON.stringify({ error: "GEMINI_API_KEY not set" }), {
//         status: 500,
//         headers: { "Content-Type": "application/json", ...corsHeaders },
//       });
//     }

//     // Create virtual try-on prompt based on available inputs
//     let virtualTryOnPrompt;

//     if (userProfileImageUrl) {
//       // Virtual try-on mode with user's profile photo
//       virtualTryOnPrompt = `
// VIRTUAL TRY-ON TASK: Create a photorealistic image of the person wearing the specified clothing.

// PERSON REQUIREMENTS (from first image - user profile photo):
// - Use the EXACT person from the first provided image as the base
// - Preserve their face, facial features, hair, skin tone, and expression completely
// - Maintain their natural body proportions and posture
// - Keep their head position and angle identical to the original

// CLOTHING REQUIREMENTS:
// ${prompt}
// ${images && images.length > 0 ? 
//   '- Reference the additional clothing images provided to match the exact styles, colors, patterns, and details' : 
//   '- Create clothing based on the text description provided'}

// TECHNICAL REQUIREMENTS:
// - Generate a full-body view showing the person wearing the complete outfit
// - Ensure realistic clothing physics: proper draping, wrinkles, and fit on the body
// - Match lighting conditions to create seamless integration
// - Use professional fashion photography quality
// - Clean, neutral background (preferably white or light gray)
// - High resolution and sharp focus
// - Natural shadows and highlights on both person and clothing

// CRITICAL: The result must look like a real photograph of this specific person wearing these exact clothes, not a composite or edited image.

// Generate the image now.`;

//     } else {
//       // Fallback to regular outfit generation without specific person
//       virtualTryOnPrompt = `
// FASHION OUTFIT GENERATION:
// Create a professional fashion photograph showing: ${prompt}

// ${images && images.length > 0 ? 
//   'Use the provided clothing reference images to match exact styles, colors, and details.' : ''}

// STYLE REQUIREMENTS:
// - Professional fashion photography
// - Clean white studio background
// - High quality, photorealistic
// - Well-lit with professional lighting
// - Magazine quality composition
// - Full body or appropriate crop showing the outfit clearly
// - Natural model pose and expression

// Generate the image now.`;
//     }

//     // Use the CORRECT Gemini model that supports image generation
//     const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${encodeURIComponent(apiKey)}`;

//     // Build content parts array
//     const contentParts: any[] = [];

//     // Add user profile photo FIRST (most important for virtual try-on)
//     if (userProfileImageUrl) {
//       try {
//         console.log('Fetching user profile image:', userProfileImageUrl);
//         const profileResponse = await fetch(userProfileImageUrl);
//         if (profileResponse.ok) {
//           const profileBuffer = await profileResponse.arrayBuffer();
//           const profileBase64 = btoa(String.fromCharCode(...new Uint8Array(profileBuffer)));
//           const mimeType = profileResponse.headers.get('content-type') || "image/jpeg";
          
//           contentParts.push({
//             inlineData: {
//               mimeType: mimeType,
//               data: profileBase64
//             }
//           });
//           console.log('Successfully added profile image, MIME type:', mimeType);
//         } else {
//           console.warn('Failed to fetch user profile image - HTTP', profileResponse.status);
//         }
//       } catch (e) {
//         console.warn('Failed to fetch user profile image:', userProfileImageUrl, e);
//       }
//     }

//     // Add wardrobe item reference images
//     if (images && Array.isArray(images) && images.length > 0) {
//       console.log('Processing', images.length, 'wardrobe images');
//       for (let i = 0; i < images.length; i++) {
//         const imageUrl = images[i];
//         if (imageUrl && typeof imageUrl === 'string') {
//           try {
//             console.log(`Fetching wardrobe image ${i + 1}:`, imageUrl);
//             const imageResponse = await fetch(imageUrl);
//             if (imageResponse.ok) {
//               const imageBuffer = await imageResponse.arrayBuffer();
//               const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
//               const mimeType = imageResponse.headers.get('content-type') || "image/jpeg";
              
//               contentParts.push({
//                 inlineData: {
//                   mimeType: mimeType,
//                   data: imageBase64
//                 }
//               });
//               console.log(`Successfully added wardrobe image ${i + 1}, MIME type:`, mimeType);
//             } else {
//               console.warn(`Failed to fetch wardrobe item image ${i + 1} - HTTP`, imageResponse.status, imageUrl);
//             }
//           } catch (e) {
//             console.warn(`Failed to fetch wardrobe item image ${i + 1}:`, imageUrl, e);
//           }
//         }
//       }
//     }

//     // Add the detailed virtual try-on prompt
//     contentParts.push({
//       text: virtualTryOnPrompt
//     });

//     const requestBody = {
//       contents: [{
//         role: "user",
//         parts: contentParts
//       }],
//       generationConfig: {
//         responseModalities: ["IMAGE"],
//         temperature: 0.2, // Slightly higher for more creativity while maintaining consistency
//         maxOutputTokens: 4096,
//       },
//       safetySettings: [
//         {
//           category: "HARM_CATEGORY_HARASSMENT",
//           threshold: "BLOCK_MEDIUM_AND_ABOVE"
//         },
//         {
//           category: "HARM_CATEGORY_HATE_SPEECH",
//           threshold: "BLOCK_MEDIUM_AND_ABOVE"
//         },
//         {
//           category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
//           threshold: "BLOCK_MEDIUM_AND_ABOVE"
//         },
//         {
//           category: "HARM_CATEGORY_DANGEROUS_CONTENT",
//           threshold: "BLOCK_MEDIUM_AND_ABOVE"
//         }
//       ]
//     };

//     console.log('Sending request to Gemini with', contentParts.length, 'parts');
//     console.log('Content parts breakdown:');
//     contentParts.forEach((part, index) => {
//       if (part.text) {
//         console.log(`  Part ${index + 1}: Text prompt (${part.text.length} chars)`);
//       } else if (part.inlineData) {
//         console.log(`  Part ${index + 1}: Image (${part.inlineData.mimeType})`);
//       }
//     });

//     const geminiResponse = await fetch(geminiEndpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(requestBody),
//     });

//     let base64Image = null;

//     if (geminiResponse.ok) {
//       const geminiData = await geminiResponse.json();
//       console.log('Gemini response status: OK');
//       console.log('Response structure keys:', Object.keys(geminiData));
      
//       if (geminiData.candidates) {
//         console.log('Number of candidates:', geminiData.candidates.length);
        
//         const candidate = geminiData.candidates[0];
//         if (candidate) {
//           console.log('First candidate keys:', Object.keys(candidate));
          
//           if (candidate.content && candidate.content.parts) {
//             console.log('Number of parts in response:', candidate.content.parts.length);
            
//             for (let i = 0; i < candidate.content.parts.length; i++) {
//               const part = candidate.content.parts[i];
//               console.log(`Part ${i + 1} keys:`, Object.keys(part));
              
//               if (part.inlineData && part.inlineData.data) {
//                 base64Image = part.inlineData.data;
//                 console.log('Successfully extracted image from Gemini response, size:', base64Image.length);
//                 console.log('Image MIME type:', part.inlineData.mimeType);
//                 break;
//               }
//             }
//           } else {
//             console.error('No content.parts in candidate:', candidate);
//           }
//         } else {
//           console.error('No first candidate found');
//         }
//       } else {
//         console.error('No candidates in response');
//       }

//       if (!base64Image) {
//         console.error('Complete Gemini response for debugging:');
//         console.error(JSON.stringify(geminiData, null, 2));
//       }
//     } else {
//       const errorText = await geminiResponse.text();
//       console.error('Gemini API error response:');
//       console.error('Status:', geminiResponse.status);
//       console.error('Status Text:', geminiResponse.statusText);
//       console.error('Error body:', errorText);
      
//       // Try to parse error as JSON for more details
//       try {
//         const errorJson = JSON.parse(errorText);
//         console.error('Parsed error details:', errorJson);
//       } catch (e) {
//         console.error('Error text is not valid JSON');
//       }
      
//       return new Response(JSON.stringify({ 
//         error: `Gemini API failed with status ${geminiResponse.status}`,
//         statusText: geminiResponse.statusText,
//         details: errorText
//       }), {
//         status: 500,
//         headers: { "Content-Type": "application/json", ...corsHeaders },
//       });
//     }

//     if (!base64Image) {
//       return new Response(JSON.stringify({ 
//         error: "Failed to generate image - no image data returned from Gemini",
//         details: "Check server logs for detailed response structure"
//       }), {
//         status: 500,
//         headers: { "Content-Type": "application/json", ...corsHeaders },
//       });
//     }

//     console.log('Successfully returning base64 image, length:', base64Image.length);
//     return new Response(JSON.stringify({ image_base64: base64Image }), {
//       status: 200,
//       headers: { "Content-Type": "application/json", ...corsHeaders },
//     });

//   } catch (err) {
//     console.error('Edge function error:', err);
//     console.error('Error stack:', err.stack);
//     return new Response(JSON.stringify({ 
//       error: "Internal server error",
//       details: String(err)
//     }), {
//       status: 500,
//       headers: { "Content-Type": "application/json", ...corsHeaders },
//     });
//   }
// });


// Supabase Edge Function: generate-image
// Direct Google GenAI API approach matching your example structure
// Set secret before deploy: supabase secrets set GEMINI_API_KEY=your_key

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "*",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, images, userProfileImageUrl } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log('Starting virtual try-on generation...');

    // Build the prompt array exactly like your example
    const promptParts: any[] = [];

    // Add text instruction first (like your example)
    if (userProfileImageUrl) {
      promptParts.push({
        text: `Make the person in the first image wear the clothing items shown in the subsequent images. Leave the background unchanged or use a clean neutral background.

Virtual try-on requirements:
- Use the exact person from the first image as the base
- Replace their current clothing with the new clothing items  
- Preserve their face, hair, skin tone, and body proportions exactly
- Maintain their pose and expression
- Ensure the new clothes fit naturally with realistic draping
- Make it look like a real photograph, not a composite

Clothing request: ${prompt}

Generate a photorealistic virtual try-on image.`
      });
    } else {
      promptParts.push({
        text: `Create a professional fashion photograph showing: ${prompt}

Requirements:
- Professional fashion photography style
- Clean studio background
- High quality and photorealistic
- Model wearing the specified clothing
- Professional lighting and composition`
      });
    }

    // Add user profile image (like imageData1 in your example)
    if (userProfileImageUrl) {
      try {
        console.log('Fetching profile image (like girl.png in your example)');
        const profileResponse = await fetch(userProfileImageUrl);
        if (profileResponse.ok) {
          const profileBuffer = await profileResponse.arrayBuffer();
          const profileBase64 = btoa(String.fromCharCode(...new Uint8Array(profileBuffer)));
          
          promptParts.push({
            inlineData: {
              mimeType: profileResponse.headers.get('content-type') || "image/jpeg",
              data: profileBase64,
            },
          });
          console.log('Added profile image to prompt array');
        }
      } catch (e) {
        console.warn('Failed to fetch profile image:', e);
      }
    }

    // Add clothing images (like imageData2 in your example)
    if (images && Array.isArray(images) && images.length > 0) {
      console.log(`Adding ${images.length} clothing images (like tshirt.png in your example)`);
      
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        if (imageUrl && typeof imageUrl === 'string') {
          try {
            console.log(`Fetching clothing image ${i + 1}`);
            const imageResponse = await fetch(imageUrl);
            if (imageResponse.ok) {
              const imageBuffer = await imageResponse.arrayBuffer();
              const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
              
              promptParts.push({
                inlineData: {
                  mimeType: imageResponse.headers.get('content-type') || "image/jpeg",
                  data: imageBase64,
                },
              });
              console.log(`Added clothing image ${i + 1}`);
            }
          } catch (e) {
            console.warn(`Failed to fetch clothing image ${i + 1}:`, e);
          }
        }
      }
    }

    console.log(`Built prompt array with ${promptParts.length} parts`);

    // Try models that support image generation (matching your gemini-2.5-flash-image-preview)
    const modelsToTry = [
      "gemini-2.5-flash-image-preview",
      "gemini-2.0-flash-exp",
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash-latest"
    ];

    let generatedImageBase64 = null;
    let successfulModel = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName} (like your example)`);
        
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

        // Structure the request like the GenAI SDK would
        const requestBody = {
          contents: [{
            role: "user",
            parts: promptParts
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
          }
        };

        console.log(`Sending request to ${modelName}...`);
        const response = await fetch(geminiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log(`Response received from ${modelName}`);
          
          // Process response like your example: for (const part of response.candidates[0].content.parts)
          if (responseData.candidates && responseData.candidates[0]) {
            const candidate = responseData.candidates[0];
            
            if (candidate.content && candidate.content.parts) {
              for (const part of candidate.content.parts) {
                if (part.text) {
                  console.log(`${modelName} text response:`, part.text.substring(0, 100) + '...');
                } else if (part.inlineData && part.inlineData.data) {
                  // Found image data! (like your example: const imageData = part.inlineData.data)
                  console.log(`SUCCESS! ${modelName} generated image, size:`, part.inlineData.data.length);
                  generatedImageBase64 = part.inlineData.data;
                  successfulModel = modelName;
                  break;
                }
              }
            }
          }

          if (generatedImageBase64) {
            break; // Success! Exit the model loop
          } else {
            console.log(`${modelName} didn't return image data`);
          }

        } else {
          const errorText = await response.text();
          console.error(`${modelName} HTTP error:`, response.status, errorText);
        }

      } catch (error) {
        console.error(`Error with ${modelName}:`, error.message);
      }
    }

    if (!generatedImageBase64) {
      console.error('All models failed to generate image');
      return new Response(JSON.stringify({ 
        error: "Failed to generate image with any model",
        details: "All available Gemini models failed to produce image output",
        modelsAttempted: modelsToTry
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Successfully generated image using ${successfulModel}`);
    
    // Return the base64 image (like your example saves it as girl-with-tshirt.png)
    return new Response(JSON.stringify({ 
      image_base64: generatedImageBase64,
      model_used: successfulModel
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: String(err)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

// Test the function locally with:
// supabase functions serve

// Deploy with:
// supabase functions deploy generate-image

// Call from frontend:
/*
const response = await supabase.functions.invoke('generate-image', {
  body: {
    prompt: "blue t-shirt and jeans",
    userProfileImageUrl: "https://example.com/person.jpg", // like girl.png
    images: ["https://example.com/tshirt.jpg", "https://example.com/jeans.jpg"] // like tshirt.png
  }
});

const { image_base64, model_used } = response.data;

// Use the image_base64 to display or save the result
// (equivalent to your fs.writeFileSync("girl-with-tshirt.png", buffer))
const imgElement = document.getElementById('result');
imgElement.src = `data:image/jpeg;base64,${image_base64}`;
*/