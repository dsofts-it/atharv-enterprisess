# Render deployment: backend Web Service + frontend Static Site

This guide matches this repository: `https://github.com/dsofts-it/Atharv-Enterprises`, with application code in `atharv-care/`. Both Render services use that folder as their Root Directory. Original sibling Documents/Photos folders do not need to be added to a deployment. The supplied logo now also has a deployment copy at `atharv-care/public/Photos/Logo.png`.

Hosting topology:

```text
Browser -> Render Static Site (React / Vite)
Browser -> Render Web Service (Express API) -> MongoDB Atlas
```

The names below are examples, not existing deployed services. Render may append a suffix if a name is unavailable. Always copy the actual HTTPS URLs from your dashboard.

| Component | Example URL |
| --- | --- |
| Frontend | `https://atharv-care.onrender.com` |
| Backend | `https://atharv-care-api.onrender.com` |
| Backend health | `https://atharv-care-api.onrender.com/api/v1/health` |

## 1. Push the prepared code

The Git remote is already configured. From PowerShell:

```powershell
cd "D:\Dsofts Projects\Atharv Enterprises"
git branch --show-current
git status --short
git add atharv-care
git diff --cached --stat
git commit -m "Prepare separate Render frontend and backend deployment"
git push origin HEAD
```

Check the staged file list before committing. The application's `.gitignore` excludes `.env`, `.env.*.local`, dependencies, build outputs, test results and local runtime databases. Do not add passwords or database connection strings to tracked files. Your actual selected branch is the branch you will select for both Render services. No new `git init` or remote is needed.

Open GitHub and confirm the pushed branch contains `atharv-care/package.json`, `atharv-care/package-lock.json`, `atharv-care/client/`, `atharv-care/server/`, `atharv-care/shared/` and `atharv-care/public/`.

## 2. Create the production database in MongoDB Atlas

1. Sign into https://cloud.mongodb.com and create/select a project.
2. Create an Atlas cluster. For preview, choose an available free cluster. For live business data, select a deployment and backup arrangement appropriate to your needs. Choose an available region near the Render backend region; Singapore is a useful option when both providers offer it for your plan.
3. Under Database Access / Database Users, create a dedicated application database user with **readWrite on the `atharv` database**. This is a database login, not your Atlas website login.
4. Generate a strong password and retain it privately.
5. Open the cluster's **Connect -> Drivers**, select Node.js, and copy its `mongodb+srv://` connection string.
6. Replace the database username/password placeholders and include `/atharv` before the query string. Preserve the cluster hostname and options supplied by Atlas. URL-encode special characters in the username/password (for example, `@` becomes `%40`).

Example shape only:

```text
mongodb+srv://DB_USER:ENCODED_PASSWORD@YOUR_CLUSTER.mongodb.net/atharv?retryWrites=true&w=majority
```

7. In Atlas Network Access / IP Access List, add **your current public IP** so you can create the owner account from your computer later.
8. After creating the Render backend in the next step, also add **all its outbound CIDR ranges**. The backend will not connect until these ranges are allowed. Avoid opening database access to the entire internet.

Use Atlas, not the local `dev:local` MongoDB helper or the development Docker database. Application transactions require a replica set; Atlas provides this architecture.

Official instructions: [Atlas connections](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/), [Atlas IP access list](https://www.mongodb.com/docs/atlas/security/ip-access-list/).

## 3. Generate the backend signing secret

In your local PowerShell terminal:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the generated value into Render's backend `JWT_ACCESS_SECRET` field. Keep it private. Do not use a sample secret from documentation, and do not put this value into the frontend.

## 4. Create the backend Web Service

1. Sign into https://dashboard.render.com and connect your GitHub account.
2. Select **New -> Web Service**.
3. Choose the existing `dsofts-it/Atharv-Enterprises` repository. Grant Render repository access if requested.
4. Select the branch pushed in step 1.
5. Configure:

| Render field | Value |
| --- | --- |
| Name | `atharv-care-api` (or an available name) |
| Language / Runtime | Node |
| Root Directory | `atharv-care` |
| Region | Choose near your Atlas cluster |
| Build Command | `npm ci --include=dev && npm run build:server` |
| Start Command | `npm start` |
| Health Check Path | `/api/v1/health` |
| Instance | Free for preview; paid for live business use |

6. Add these environment variables in **Environment**:

| Key | Value |
| --- | --- |
| `NODE_VERSION` | `24.19.0` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your private Atlas connection string |
| `JWT_ACCESS_SECRET` | The generated secret |
| `CLIENT_URL` | Expected frontend origin, initially `https://atharv-care.onrender.com`; replace with the actual URL after frontend creation |
| `COOKIE_SAME_SITE` | `none` for separate `onrender.com` URLs |
| `MONGOMS_DISABLE_POSTINSTALL` | `1` (skip the development MongoDB binary download) |
| `BUSINESS_PHONE` | Your business phone, optional |
| `BUSINESS_EMAIL` | Your business email, optional |

`CLIENT_URL` must be the exact frontend origin: HTTPS, no trailing slash, no `/portal` or other path. It is not the backend URL. Render supplies `PORT`; leave it unset. The prepared server reads that variable and listens on `0.0.0.0`.

7. Click **Deploy Web Service**. Copy the actual backend URL.
8. Open this backend service's **Connect -> Outbound** tab. Add every displayed CIDR range to Atlas's IP access list. An initial deploy can fail with a database timeout until you complete this step. Redeploy after Atlas accepts the entries.
9. Wait for **Live**. Open `<ACTUAL_BACKEND_URL>/api/v1/health`. Expected data:

```json
{"data":{"status":"ok","database":"connected"}}
```

The service catalog is initialized during server startup. Do not run the development-only `seed` command against production.

Official details: [Node/Express deployment](https://render.com/docs/deploy-node-express-app), [port binding](https://render.com/docs/web-services), [outbound IP ranges](https://render.com/docs/outbound-ip-addresses).

## 5. Create the frontend Static Site

1. In Render select **New -> Static Site**.
2. Select the same GitHub repository and branch.
3. Configure:

| Render field | Value |
| --- | --- |
| Name | `atharv-care` (or an available name) |
| Root Directory | `atharv-care` |
| Build Command | `npm ci --include=dev && npm run build:client` |
| Publish Directory | `dist` |

4. Add these frontend build environment variables:

| Key | Value |
| --- | --- |
| `NODE_VERSION` | `24.19.0` |
| `VITE_API_ORIGIN` | Actual backend HTTPS origin, e.g. `https://atharv-care-api.onrender.com` |
| `SKIP_INSTALL_DEPS` | `true` (the build command installs dependencies explicitly) |
| `MONGOMS_DISABLE_POSTINSTALL` | `1` |

Do not append `/api` or `/api/v1` to `VITE_API_ORIGIN`. Do not set database credentials, JWT secrets, admin passwords or email API keys on this Static Site. Any `VITE_` variable is public in the browser bundle.

5. Click **Deploy Static Site** and wait for success.
6. Copy the actual frontend HTTPS URL.
7. Open the Static Site's **Redirects/Rewrites**, then add:

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | Rewrite |

8. Save the rule. This makes refreshes on `/portal`, `/about`, `/services` and other React routes work. Do not redirect `/*` and do not rewrite API calls to `index.html`: the frontend now calls its configured backend origin directly.

The Static Site has no Start Command. Its Publish Directory is `dist`, not `client/dist`, because Vite builds from the application root.

Official details: [Static Sites](https://render.com/docs/static-sites), [SPA rewrites](https://render.com/docs/redirects-rewrites), [Vite build variables](https://vite.dev/guide/env-and-mode).

## 6. Connect the actual URLs

1. On the backend service, set `CLIENT_URL` to the **actual frontend URL** from step 5, without a trailing slash.
2. Save and deploy the backend environment change.
3. On the Static Site, check that `VITE_API_ORIGIN` is the **actual backend URL**.
4. If you changed `VITE_API_ORIGIN`, choose **Save, rebuild, and deploy**. Vite embeds that value at build time; saving without rebuilding is insufficient.
5. Open the frontend and hard-refresh with Ctrl+F5.

Do not mix `www`, a custom domain, and the `onrender.com` frontend URL when testing. The backend trusts one exact frontend origin.

## 7. Set up reliable production login with custom domains

The example `onrender.com` setup is cross-site. `COOKIE_SAME_SITE=none` enables Secure cross-site cookies, but browsers or privacy modes that block third-party cookies can still prevent login. This is a browser restriction; CORS alone does not fix it.

For reliable production login, use HTTPS domains under the **same domain you control**, for example:

| Service | Custom domain |
| --- | --- |
| Frontend Static Site | `www.your-domain.com` |
| Backend Web Service | `api.your-domain.com` |

1. Add the frontend custom domain in the Static Site's **Settings -> Custom Domains**.
2. Add the API custom domain in the Web Service's **Settings -> Custom Domains**.
3. At your DNS provider, add the exact records Render displays for each service.
4. Click **Verify** in Render and wait for valid HTTPS certificates.
5. Set backend `CLIENT_URL=https://www.your-domain.com` and `COOKIE_SAME_SITE=strict`.
6. Set frontend `VITE_API_ORIGIN=https://api.your-domain.com`.
7. Redeploy the backend and rebuild/deploy the frontend.
8. Sign in from the custom frontend domain. These HTTPS sibling domains are same-site even though they are different origins. Do not leave one service on `onrender.com` while using `strict` for the other on your own domain.

Keep CORS and credentials enabled as implemented. Do not replace HttpOnly cookies with tokens stored in localStorage.

Official details: [Render custom domains](https://render.com/docs/custom-domains), [cookie SameSite behavior](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies).

## 8. Create your owner account once

The public registration form creates client accounts; it does not create an owner. No default admin password exists.

Use your own computer; this works even if your Render backend is on the Free plan without dashboard shell access.

1. Make sure your current public IP is allowed in Atlas.
2. From `atharv-care`, build the server:

```powershell
cd "D:\Dsofts Projects\Atharv Enterprises\atharv-care"
npm.cmd run build:server
```

3. Create a private file named `.env.owner.local` in that folder with these values:

```dotenv
NODE_ENV=production
CLIENT_URL=https://YOUR-ACTUAL-FRONTEND-ORIGIN
MONGODB_URI=YOUR-ACTUAL-ATLAS-CONNECTION-STRING
JWT_ACCESS_SECRET=YOUR-BACKEND-SIGNING-SECRET
ADMIN_NAME=YOUR OWNER NAME
ADMIN_EMAIL=YOUR REAL EMAIL
ADMIN_PASSWORD="YOUR STRONG UNIQUE PASSWORD"
```

Use a 12–128 character owner password. These are placeholders, not usable credentials. The file is gitignored. Keep it private and do not put it under `public/`.

4. Run:

```powershell
node --env-file=.env.owner.local dist-server/server/src/setup-admin.js
```

This command connects to Atlas and creates the first owner; it does not require the backend service to be running on your computer. If the shell already defines the same environment variable names, clear those overrides or use a fresh terminal so they do not override this file.

5. Wait for `Owner created. Remove ADMIN_PASSWORD from your environment.`
6. Remove `ADMIN_PASSWORD` from the private file or delete that temporary file, and remove your temporary Atlas IP entry if no longer needed.
7. Open your live frontend `/portal` and sign in with that owner email/password.

The command refuses to create a second owner when one already exists. Do not change the Render Start Command to run admin setup on every deployment.

## 9. Configure password recovery email

For real password recovery and email delivery, configure a sending domain/sender with Resend, then add backend-only `EMAIL_API_KEY` and `EMAIL_FROM` and deploy the environment change. The application uses Resend's HTTPS API. Without these settings, the portal can run, but real recovery email is not delivered. Do not add these secrets to the frontend.

## 10. Verify the live installation

- Open backend `/api/v1/health` and check `database: connected`.
- Open the frontend and confirm the logo, images and service catalog load.
- Refresh `/about`, `/services` and `/portal` directly; none should show a Render 404.
- Create a fictional test client, sign out, and sign back in.
- Create a test care request, check it in the owner portal, and confirm that portal refresh keeps the session.
- Verify authorized agreement/invoice PDFs and report downloads use the backend origin.
- If configured, request and complete password recovery.
- In browser Developer Tools -> Network, API requests should go to the backend HTTPS origin, not localhost or the Static Site. Review rejected cookies in the browser's Issues/Application panels when diagnosing login.
- Redeploy and confirm Atlas records remain. The local development records are not automatically copied to Atlas.

## 11. Updates and troubleshooting

Push future code changes to the connected branch. With Auto-Deploy enabled, both services build from it. A database deployment is independent of frontend/backend builds.

| Symptom | Check |
| --- | --- |
| No open ports / backend unavailable | Correct Start Command, `PORT`, host `0.0.0.0`, and startup logs |
| Atlas timeout / server selection error | All Render outbound IP ranges allowed, correct cluster hostname, database user/password, and active cluster |
| Database authentication error | Database user credentials, database role, and URL-encoded password |
| `Request origin is not trusted` / CORS error | Exact backend `CLIENT_URL`, no trailing slash, correct frontend origin, redeployed backend |
| Login succeeds then portal signs out | Browser blocking cross-site cookies; use same-site custom domains and confirm cookie settings |
| API receives HTML / `Unexpected token <` | Missing or wrong `VITE_API_ORIGIN`; rebuild the Static Site |
| `/portal` refresh returns 404 | Add the SPA Rewrite `/* -> /index.html` |
| Logo missing | Commit `atharv-care/public/Photos/Logo.png`; verify casing on Linux |
| TypeScript/Vite command missing | Use `npm ci --include=dev` in the Build Command |
| First API request is slow on Free | Free web services spin down after idle and must wake up |
| Admin setup says owner already exists | Sign in/recover that owner's account; do not run setup repeatedly |

Render Free backend services sleep after 15 idle minutes and can take about a minute to wake. Their local filesystem is ephemeral and they do not have dashboard shell access. Use paid compute for the live nursing-care backend. Atlas stores records independently of the Render filesystem; generated PDFs do not require local persistent storage in this implementation. Configure database backups for real business records. See [Render Free limits](https://render.com/docs/free).

## Preparation verified locally

Production build/TypeScript and ESLint passed. All 23 unit/integration tests passed, including API-origin/refresh routing and cookie configuration checks. Both selected browser smoke tests passed: public registration/care-request flow and desktop homepage/service navigation. The compiled server and owner-setup entry points exist, and the deployment logo is an identical copy of the supplied logo.

The project includes split build scripts, configurable `VITE_API_ORIGIN` for API/refresh/download URLs, an explicit cross-site-cookie setting with HTTPS enforcement, Render proxy/port support, and a deployable logo copy. Original Documents and Photos files were not modified. These changes do not create, pay for, or deploy any Render/Atlas resource. Live DNS, Render routing, Atlas networking and browser cookie behavior must be verified after you configure the accounts.
