# Keto Macro Tracker — Setup

## 1. Get a Perplexity API key
1. Go to perplexity.ai and log in.
2. Settings → API tab (`</> API`).
3. Generate a NEW API key (starts with `pplx-...`). Copy it immediately.
   (If you previously pasted a key anywhere public/shared, revoke it and generate a fresh one.)

## 2. Upload to GitHub
1. Create a new repository on GitHub (public or private).
2. Upload ALL files from this folder, preserving the folder structure exactly:
   - index.html
   - netlify.toml
   - netlify/functions/estimate-macros.js
   - README.md
3. Commit the changes.

## 3. Deploy on Netlify
1. Netlify dashboard → Add new site → Import an existing project → GitHub.
2. Select your repository.
3. Netlify should auto-detect the `netlify.toml` build settings. Click Deploy.

## 4. Add your API key
1. Site configuration → Environment variables → Add a variable.
2. Key: PERPLEXITY_API_KEY   (type manually, no quotes, no spaces)
3. Value: your pplx-... key
4. Save, then Deploys → Trigger deploy (to pick up the new variable).

## 5. Verify the function deployed
Site overview → Functions tab. You should see "estimate-macros" listed.
If it's missing, the netlify.toml functions path or folder structure is off —
double check netlify/functions/estimate-macros.js exists exactly at that path in your repo.

## 6. Use it
Open your deployed site URL, type a food description and/or attach a photo,
tap "Estimate Macros." It calls /.netlify/functions/estimate-macros, which uses
your API key server-side to query Perplexity's sonar-pro model and return
calories, protein, fat, total carbs, and net carbs.
