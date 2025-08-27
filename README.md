# Group Purchase Landing Page

A modern Korean group purchase landing page built with Next.js, TypeScript, and Tailwind CSS. Features QR code prefill functionality, real-time progress tracking, and comprehensive form validation.

## 🚀 Features

- **Korean Language**: Optimized for Korean users
- **QR Code Prefill**: URL parameters automatically populate form fields
- **Real-time Progress**: Live order tracking with progress bars
- **Form Validation**: Comprehensive validation with Zod and phone number normalization
- **Database Integration**: Prisma ORM with PostgreSQL
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Type Safety**: Full TypeScript support
- **SEO Optimized**: Sitemap generation and proper meta tags

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Language**: Korean only
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ugnchoi/group-purchase.git
   cd group-purchase
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update the `.env.local` file with your database URL and other configuration.

4. **Set up the database**

   ```bash
   pnpm dlx prisma generate
   pnpm dlx prisma db push
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

## 🌐 Usage

### QR Code Prefill

The landing page supports URL parameters for pre-filling form data:

```
https://yourdomain.com?service=Window%20Cleaning&address=Sunrise%20Apt%20%231203&unit=1203&min=25&count=7
```

**Parameters:**

- `service`: Service name (e.g., "Window Cleaning")
- `address`: Building address
- `unit`: Unit number (optional)
- `min`: Minimum orders required
- `count`: Current order count

### API Endpoints

- `POST /api/order` - Create a new order
- `POST /api/notify` - Sign up for future notifications

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables** in Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXT_PUBLIC_SITE_URL`: Your production URL
3. **Deploy**: Vercel will automatically deploy on push to main branch

### Manual Deployment

```bash
# Build the project
pnpm build

# Deploy to Vercel
vercel --prod
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── api/               # API routes
│   │   ├── order/         # Order creation
│   │   └── notify/        # Notification signup
│   └── globals.css        # Global styles
├── components/
│   └── ui/                # shadcn/ui components
└── lib/
    ├── db.ts              # Prisma client
    └── validation.ts      # Zod schemas
```

## 🔧 Configuration

### Environment Variables

| Variable               | Description                  | Required |
| ---------------------- | ---------------------------- | -------- |
| `DATABASE_URL`         | PostgreSQL connection string | Yes      |
| `NEXT_PUBLIC_SITE_URL` | Production site URL          | Yes      |
| `SENS_ACCESS_KEY`      | SMS provider credentials     | No       |
| `SENS_SECRET_KEY`      | SMS provider credentials     | No       |
| `SENS_SERVICE_ID`      | SMS service ID               | No       |

### Database Schema

The project includes Prisma schema with the following models:

- `Building`: Building information
- `Campaign`: Group purchase campaigns
- `Order`: Individual orders
- `Subscriber`: Notification subscribers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@yourdomain.com or create an issue in the GitHub repository.
