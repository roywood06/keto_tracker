// Netlify Function: calls Perplexity Sonar API to estimate macros
// from a food description and/or photo. Requires PERPLEXITY_API_KEY
// set as an environment variable in Netlify site settings.

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "PERPLEXITY_API_KEY is not set in Netlify environment variables." }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { description, imageBase64, imageMime } = payload;

  if (!description && !imageBase64) {
    return { statusCode: 400, body: JSON.stringify({ error: "Provide a description or an image." }) };
  }

  const content = [];
  const instruction =
    "You are a nutrition estimation assistant for a ketogenic diet tracker. " +
    "Estimate the macros for the food described and/or shown. " +
    "Respond with ONLY a compact JSON object, no prose, no markdown fences, in this exact shape: " +
    '{"calories": number, "protein_g": number, "fat_g": number, "total_carbs_g": number, "net_carbs_g": number, "notes": "short string"}. ' +
    "net_carbs_g = total_carbs_g minus fiber. Use your best estimate for typical portion sizes if not specified.";

  content.push({ type: "text", text: instruction + (description ? ` Food description: ${description}` : " Analyze the food in the attached image.") });

  if (imageBase64) {
    content.push({
      type: "image_url",
      image_url: { url: `data:${imageMime || "image/jpeg"};base64,${imageBase64}` },
    });
  }

  try {
    const resp = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [{ role: "user", content }],
        temperature: 0.2,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify({ error: data.error || data }) };
    }

    const raw = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!raw) {
      return { statusCode: 502, body: JSON.stringify({ error: "No content returned from Perplexity API." }) };
    }

    let jsonText = raw.trim();
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) jsonText = fenceMatch[1].trim();

    let macros;
    try {
      macros = JSON.parse(jsonText);
    } catch (e) {
      const braceMatch = jsonText.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        macros = JSON.parse(braceMatch[0]);
      } else {
        throw e;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ macros }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to estimate macros: " + err.message }),
    };
  }
};
