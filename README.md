# File: README.md
# Path: /README.md
# Project documentation

# Producers Avenue V2

Where Music Creators Connect, Collaborate & Thrive

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payments:** Stripe
- **Storage:** Bunny.net CDN
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Stripe account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/producers-avenue-v2.git
cd producers-avenue-v2
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- Supabase URL and keys
- Stripe keys
- Bunny.net keys

4. Run the development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/src
  /app                 # Next.js pages (App Router)
  /components          # React components
    /common           # Reusable components
    /home             # Homepage components
    /layout           # Layout components (Header, Footer)
    /marketplace      # Marketplace components
  /lib                # Utilities and helpers
  /types              # TypeScript types
/public
  /fonts             # Custom fonts
  /images            # Static images
  /videos            # Hero background videos
```

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Features

### Phase 1 (MVP)
- ✅ User authentication and profiles
- ✅ Social feed and interactions
- ✅ Marketplace (products and services)
- ✅ Messaging system
- ✅ Groups and communities
- ✅ Subscription tiers
- ✅ Wallet and payouts

### Phase 2
- [ ] Webinars
- [ ] Mentoring program
- [ ] Collab Matcher tool
- [ ] Reviews and ratings
- [ ] Advanced analytics
- [ ] Mobile app

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and development process.

## License

This project is proprietary and confidential.

## Support

For support, email support@producersavenue.com