# Hisab

A simple, mobile-first app for tracking personal income and expenses in Bangladeshi Taka (৳), plus motorcycle fuel and mileage, with private storage for bike documents.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui (Base UI), MongoDB with Mongoose, and Better Auth.

## Run it locally

You need Node.js 20 or newer and a MongoDB database (see below).

1. Install the packages:

   ```bash
   npm install
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in `.env.local`:

   | Variable | What to put |
   | --- | --- |
   | `MONGODB_URI` | Your MongoDB connection string, including the database name |
   | `BETTER_AUTH_SECRET` | A random secret. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
   | `BETTER_AUTH_URL` | `http://localhost:3000` |
   | `BLOB_READ_WRITE_TOKEN` | Leave empty locally. Uploaded files go to the git-ignored `.data` folder |

4. Start the app and open <http://localhost:3000>:

   ```bash
   npm run dev
   ```

   `/` is the public homepage. After logging in, you go to your private dashboard at `/home`.

### Use it like a phone app

Once deployed over HTTPS, open the site on your phone and add it to your home screen. It then opens full screen with its own icon.

- **Android (Chrome):** menu → **Add to Home screen** or **Install app**
- **iPhone (Safari):** Share → **Add to Home Screen**

It still needs an internet connection, because your data lives in the database.

### Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm test` | Unit tests for calculations and validation |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Set up the database (MongoDB Atlas)

1. Create a free cluster at <https://www.mongodb.com/cloud/atlas>.
2. Under **Database Access**, add a user with a strong password.
3. Under **Network Access**, allow your IP address. Vercel uses changing IP addresses, so for a Vercel deployment add `0.0.0.0/0` (the database user and password still protect it).
4. Click **Connect > Drivers** and copy the connection string.
5. Paste it into `MONGODB_URI`, replacing the password and adding the database name `hisab` before the `?`:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/hisab?retryWrites=true&w=majority
   ```

There are no migrations to run. Collections and indexes are created automatically the first time the app uses them.

The database must be a replica set, because sign-up uses a transaction. Every Atlas cluster, including the free one, already is. A plain local `mongod` is not, unless you start it with `--replSet`.

## Deploy to Vercel

1. Push this project to GitHub and import it at <https://vercel.com/new>.
2. In the project, go to **Storage > Create > Blob** and create a store with **private** access. Connect it to the project, which adds `BLOB_READ_WRITE_TOKEN` automatically.
3. Under **Settings > Environment Variables**, add:
   - `MONGODB_URI`: your Atlas connection string
   - `BETTER_AUTH_SECRET`: a new random secret, different from the local one
   - `BETTER_AUTH_URL`: your production address, for example `https://hisab.vercel.app`
4. Deploy. If you added variables after the first deploy, redeploy so they take effect.

## How it works

- **Pages** (`src/app/(app)`) are Server Components that read data through `src/lib/data`, behind a `Suspense` boundary because they depend on the logged-in user.
- **Changes** go through Route Handlers in `src/app/api`. Forms call them, then refresh the page, so totals and lists always come from the database.
- **Validation** rules live in `src/lib/validators.ts`, shared by the forms and the API.
- **Security**: `src/proxy.ts` redirects visitors with no session cookie, but the real checks are on the server. `requireUser()` guards pages, and `withUser()` guards every API route. Every query includes the logged-in user's id.
- **Documents** are stored in a private Vercel Blob store. They have no public URL, and `/api/documents/[id]/file` checks ownership on every request. Files are limited to 4 MB because Vercel limits request bodies to 4.5 MB, and their real type is checked from the file's contents.

### How the numbers are calculated

- **Savings** = income − expenses for the selected month. Savings are never stored.
- **Mileage for an entry** = (this odometer − previous odometer) ÷ this entry's fuel. The first entry has no mileage because there is nothing to compare it with.
- **Average mileage** = total distance ÷ fuel from every entry except the first. No distance was measured against the first fill, so including it would understate your mileage.
- **Cost per km** = cost of every entry except the first ÷ total distance. **Total fuel cost** does include the first fill.
- **Fuel and expenses are separate.** A fuel entry does not create an expense automatically. To count fuel in your monthly spending, add it as an expense in the Bike category too.
- **"Today" and the current month** use Bangladesh time, wherever the server runs.
