# Database Seeding Guide (Group-Purchase Project)

This document explains how to seed your database with **Buildings** and **Campaigns** using a config file, instead of hardcoding values in the script.

---

## 1. What the seeding script does

- **Creates/updates Buildings** by **name** (idempotent).
- **Creates/updates Campaigns** by **id** (idempotent).
- Loads configuration from `scripts/seed-data.json`.  
  If the file is missing or invalid, it falls back to a built-in default.

---

## 2. Pre-requisites

- Node ≥ 18 (20 recommended)
- pnpm (or npm/yarn; examples use pnpm)
- A Postgres database (Neon/Supabase/local Docker)
- `.env` file with `DATABASE_URL` set

```bash
# verify versions
node -v
corepack enable && corepack prepare pnpm@latest --activate
pnpm -v
```

`.env` example:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require"
```

---

## 3. Prisma setup

Make sure your schema supports idempotent upserts:

```prisma
model Building {
  id        String   @id @default(cuid())
  name      String   @unique   // required for upsert
  address   String
  campaigns Campaign[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Campaign {
  id            String   @id
  service       String
  minOrders     Int
  currentOrders Int      @default(0)
  buildingId    String
  building      Building @relation(fields: [buildingId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([buildingId])
}
```

Generate client and run migrations:

```bash
pnpm dlx prisma generate
pnpm dlx prisma migrate dev -n seed-config
```

---

## 4. Config file format

Create `scripts/seed-data.json`:

```json
{
  "buildings": [
    {
      "name": "헬리오시티",
      "address": "서울특별시 강남구",
      "campaigns": [
        {
          "id": "helio-glass-cleaning",
          "service": "유리청소",
          "minOrders": 20
        },
        { "service": "방충망 보수", "minOrders": 15 },
        { "service": "에어컨 청소", "minOrders": 25 }
      ]
    },
    {
      "name": "양평벽산블루밍",
      "address": "서울특별시 양평구",
      "campaigns": [
        { "service": "유리청소", "minOrders": 20 },
        { "service": "방충망 보수", "minOrders": 15 },
        { "service": "에어컨 청소", "minOrders": 25 }
      ]
    }
  ]
}
```

- **Building.name** must be unique.
- If `id` is omitted for a campaign, the script auto-generates one from `{buildingName}-{service}`.

---

## 5. Run the seeding script

Install runtime if not present:

```bash
pnpm add -D ts-node typescript
```

Add NPM scripts in `package.json`:

```json
{
  "scripts": {
    "db:seed": "ts-node --transpile-only scripts/setup-db.ts"
  }
}
```

Run:

```bash
pnpm db:seed
```

Example output:

```
✅ Database setup complete!

🏢 헬리오시티 → id: ckxy...
  • campaigns: 유리청소, 방충망 보수, 에어컨 청소
🏢 양평벽산블루밍 → id: ckwz...
  • campaigns: 유리청소, 방충망 보수, 에어컨 청소
```

---

## 6. Validation (recommended)

Add [Zod](https://github.com/colinhacks/zod) to validate configs:

```bash
pnpm add zod
```

Inside `setup-db.ts`:

```ts
import { z } from "zod";

const CampaignInputSchema = z.object({
  id: z.string().optional(),
  service: z.string(),
  minOrders: z.number().int().positive(),
  currentOrders: z.number().int().nonnegative().optional(),
});

const BuildingInputSchema = z.object({
  name: z.string(),
  address: z.string(),
  campaigns: z.array(CampaignInputSchema),
});

const SeedConfigSchema = z.object({
  buildings: z.array(BuildingInputSchema),
});

// use SeedConfigSchema.parse(json) in loadConfig()
```

This will fail early if someone forgets a required field.

---

## 7. Multiple environments (optional)

Support per-env configs:

- `scripts/seed-dev.json`
- `scripts/seed-staging.json`
- `scripts/seed-prod.json`

Extend script to accept env variable or CLI arg:

```bash
SEED_CONFIG=scripts/seed-staging.json pnpm db:seed
```

Or:

```bash
pnpm ts-node scripts/setup-db.ts scripts/seed-prod.json
```

Update `package.json`:

```json
{
  "scripts": {
    "db:seed:staging": "SEED_CONFIG=scripts/seed-staging.json ts-node --transpile-only scripts/setup-db.ts",
    "db:seed:prod": "SEED_CONFIG=scripts/seed-prod.json ts-node --transpile-only scripts/setup-db.ts"
  }
}
```

---

## 8. How to add new data

1. Open the appropriate `seed-data.json`.
2. To **add a building**: append to `buildings` with `name`, `address`, and campaigns.
3. To **add a campaign**: append to the `campaigns` array of a building.
   - Provide a stable `id` if it will be used in QR codes.
   - Omit `id` if you’re fine with auto-generation.
4. Run:
   ```bash
   pnpm db:seed
   ```

---

## 9. Best practices

- Keep **building names unique** or use a separate `buildingCode` for stability.
- For campaigns tied to **QR codes**, always give explicit `id`s (don’t rely on auto-generation).
- Don’t include `currentOrders` in config unless you intentionally want to reset values.
- Validate configs with Zod to avoid invalid data.
- Consider environment-specific seed files for dev/staging/prod.

---
