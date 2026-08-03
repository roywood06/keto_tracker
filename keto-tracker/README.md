# Keto Macro Tracker — Setup

## 1. Get a Perplexity API key
1. Go to perplexity.ai and log in.
2. Settings → API tab (`</> API`).
3. Generate an API key (starts with `pplx-...`). Copy it immediately.

## 2. Deploy to Netlify
1. Drag this whole folder (or connect the git repo) into Netlify, or run `netlify deploy` from this directory.
2. In the Netlify dashboard: Site configuration → Environment variables.
3. Add variable: `PERPLEXITY_API_KEY` = your key from Step 1.
4. Redeploy the site so the function picks up the new environment variable.

## 3. Use it
Open the deployed site, type a food description and/or attach a photo, then click
"Estimate Macros." The app calls `/.netlify/functions/estimate-macros`, which securely
uses your API key server-side to query the Perplexity `sonar-pro` model and return
calories, protein, fat, total carbs, and net carbs.

Your API key is never exposed to the browser — it lives only in Netlify's environment
variables and is used inside the serverless function.
