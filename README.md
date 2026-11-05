# হিসাব-Hisab

A simple, mobile-first app for tracking personal income, expenses and savings in Bangladeshi Taka (৳), plus bikes and cars with their fuel, mileage and running costs, and private storage for vehicle documents.

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

Keep the app close to the database, because every page view talks to it. `vercel.json` runs the app in `bom1` (Mumbai) to match an Atlas cluster in `ap-south-1`. If your cluster is elsewhere, change it to the [nearest Vercel region](https://vercel.com/docs/edge-network/regions).

## How it works

- **Pages** (`src/app/(app)`) are Server Components that read data through `src/lib/data`, behind a `Suspense` boundary because they depend on the logged-in user.
- **Changes** go through Route Handlers in `src/app/api`. Forms call them, then refresh the page, so totals and lists always come from the database.
- **Validation** rules live in `src/lib/validators.ts`, shared by the forms and the API.
- **Security**: `src/proxy.ts` redirects visitors with no session cookie, but the real checks are on the server. `requireUser()` guards pages, and `withUser()` guards every API route. Every query includes the logged-in user's id.
- **Documents** are stored in a private Vercel Blob store. They have no public URL, and `/api/documents/[id]/file` checks ownership on every request. Files are limited to 4 MB because Vercel limits request bodies to 4.5 MB, and their real type is checked from the file's contents.

### How the numbers are calculated

- **Saving of Month** = that month's income − expenses. **Total Savings** = all income − all expenses, across every month. Neither is ever stored, so they cannot fall out of step with your records.
- **One record per payment.** Fuel and other vehicle expenses are saved as transactions linked to a vehicle, so they appear in Expenses automatically and are never counted twice.
- **Fuel amounts.** Any two of amount, price per liter and liters give the third. When all three are present, the amount and liters win, because they are what the pump showed, and the price is worked out from them.
- **Reliable mileage** is measured between two fill-ups marked as a full tank: the distance between them ÷ all the fuel added since the first one.
- **Estimated mileage** is used for every other entry: (this odometer − previous odometer) ÷ this entry's fuel. It assumes each fill-up replaced what was burned. The first entry has no mileage because there is nothing to compare it with.
- **Average mileage** uses only reliable measurements when there are any, and estimates otherwise. It is labelled either way.
- **Cost per km** = cost of every fuel entry except the first ÷ total distance.
- **"Today" and the current month** use Bangladesh time, wherever the server runs.

### Vehicles and your history

A vehicle with expense records cannot be deleted, because those records are part of your financial history. Archive it instead: it leaves your lists, but its expenses still count in your totals, and you can restore it at any time. A vehicle with no records can be deleted.

Turning a module off in **Settings** only hides it. No data is changed or removed.

### Upgrading from an earlier version

Nothing needs to be run by hand. The first time a user opens the app, their old fuel entries are copied into transactions, once. The old `fuelentries` collection is left untouched. Fuel now counts in Expenses, so if you used to add fuel as a separate expense as well, delete those manual expenses to avoid counting them twice.

## Set up Google sign-in

The app works without this: the Google button only appears once both keys are set.

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create a project.
2. Go to **APIs & Services > OAuth consent screen** and fill in the app name and your email. Add yourself as a test user, or publish the app so anyone can sign in.
3. Go to **APIs & Services > Credentials > Create Credentials > OAuth client ID**, and choose **Web application**.
4. Under **Authorized JavaScript origins**, add `http://localhost:3000` and your live address, such as `https://hisab-psi-seven.vercel.app`.
5. Under **Authorized redirect URIs**, add both of these, with your own live address:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://hisab-psi-seven.vercel.app/api/auth/callback/google`
6. Copy the client ID and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, in `.env.local` and in Vercel's environment variables. Then redeploy.

If someone already has a password account with the same email, Google will not log in to it automatically, because this app does not verify email addresses at sign-up and anyone could have registered that address. They log in with their password, then choose **Connect Google** in Profile.
