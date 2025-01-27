# AIBTCDEV Frontend

## Prerequisites
- Node.js (recommended version 18+)
- npm
- Backend repository: [bitcoin-ai-agent-crew-backend](https://github.com/soladity/bitcoin-ai-agent-crew-backend)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/soladity/bitcoin-ai-agent-crew-frontend.git
cd bitcoin-ai-agent-crew-frontend
```

### 2. Environment Setup
Create a `.env.local` file in the project root and add the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://addyourown.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=add_your_anon_key
HIRO_API_KEY=hiro_api_key
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_STACKS_NETWORK=testnet
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Backend
Clone and set up the backend repository:
```bash
git clone https://github.com/soladity/bitcoin-ai-agent-crew-backend.git
cd bitcoin-ai-agent-crew-backend
# Follow backend setup instructions
```

### 5. Run Frontend Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


