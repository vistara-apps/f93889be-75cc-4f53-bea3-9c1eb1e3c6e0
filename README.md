# VoteVision

A platform for communities to collectively decide on video themes and styles using blockchain voting, with AI-powered video generation.

## Features

- **AI Video Generation**: Generate videos from text prompts using advanced AI models
- **Community Voting**: Decentralized voting system on Base blockchain
- **Media Asset Library**: Curated collection of royalty-free assets
- **On-Chain Governance**: Transparent voting and decision making
- **Farcaster Integration**: In-frame voting and sharing

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL
- **Blockchain**: Base Network, Solidity smart contracts
- **AI**: RunwayML/Pika Labs integration
- **File Storage**: Cloudinary
- **Authentication**: Wallet-based (MetaMask, Coinbase Wallet, etc.)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- MetaMask or Coinbase Wallet
- API keys for AI service and file storage

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vistara-apps/f93889be-75cc-4f53-bea3-9c1eb1e3c6e0.git
cd votevision
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/votevision

# AI Service (choose one)
AI_SERVICE_TYPE=runway  # or 'pika' or 'custom'
AI_SERVICE_API_KEY=your_api_key
AI_SERVICE_BASE_URL=https://api.runwayml.com/v1
AI_SERVICE_MODEL=gen-3-alpha-turbo

# Cloudinary for file uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
CLOUDINARY_UPLOAD_PRESET=votevision_assets

# Smart Contract (deploy first)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Base RPC
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# OnchainKit
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_key

# JWT Secret
JWT_SECRET=your_secure_jwt_secret
```

4. Set up the database:
```bash
# Create PostgreSQL database
createdb votevision

# Initialize database schema and sample data
npm run init-db
```

5. Deploy the smart contract:
```bash
# Install Hardhat or Foundry
npm install -g hardhat

# Deploy to Base testnet
npx hardhat run scripts/deploy.js --network baseGoerli
```

Update your `.env.local` with the deployed contract address.

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Smart Contract Deployment

### Using Hardhat

1. Install dependencies:
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
```

2. Create `hardhat.config.js`:
```javascript
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.19",
  networks: {
    baseGoerli: {
      url: "https://goerli.base.org",
      accounts: [process.env.PRIVATE_KEY]
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

3. Deploy contract:
```bash
npx hardhat run scripts/deploy.js --network baseGoerli
```

## API Documentation

### Authentication
All voting operations require wallet authentication. Users must sign a message to authenticate.

### Endpoints

#### Users
- `POST /api/users` - Create/authenticate user
- `GET /api/users?walletAddress=0x...` - Get user info

#### Prompts
- `POST /api/prompts` - Create new video prompt
- `GET /api/prompts` - Get prompts with filtering

#### Votes
- `POST /api/votes` - Cast a vote on a prompt
- `GET /api/votes?promptId=...` - Get votes for a prompt

#### Media Assets
- `POST /api/media` - Upload media asset
- `GET /api/media` - Get media assets

#### Video Generation
- `POST /api/generate-video` - Start video generation
- `GET /api/generate-video?generationId=...` - Check generation status

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   ├── components/          # React components
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── contracts/              # Solidity contracts
├── lib/                    # Utility libraries
├── scripts/                # Database and deployment scripts
├── public/                 # Static assets
└── tailwind.config.ts      # Tailwind configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@votevision.app or join our Discord community.

