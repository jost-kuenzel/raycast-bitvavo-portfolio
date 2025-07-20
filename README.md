# Coiny - Bitvavo Asset Tracker

A Raycast extension built with Node.js and Effect that tracks your cryptocurrency assets from Bitvavo exchange, showing comprehensive gain/loss analysis based on your complete trading history.

## Setup Guide

### Raycast Extension Usage

1. Start the extension in development mode:
   ```bash
   npm run dev
   ```

2. Open Raycast and search for "View Portfolio" or "Coiny"

3. Configure your API credentials:
   - Open the extension preferences (⌘+,)
   - Enter your Bitvavo API Key
   - Enter your Bitvavo API Secret

4. The extension will display your portfolio in a beautiful markdown format

### API Configuration

For Raycast extension, configure through the extension preferences UI.

## Features

- ✅ Raycast extension with markdown formatting
- ✅ Real-time portfolio tracking
- ✅ Gain/loss calculations
- ✅ Trade history analysis
- ✅ Support for BTC, ETH, XRP
- ✅ Proper error handling and loading states

## Development Highlights

### Raycast Extension Implementation
- Created `src/portfolio.tsx` with full Raycast API integration
- Implemented React hooks for state management
- Added proper error handling and loading states
- Configured extension preferences for API credentials
- Added action panel with refresh and preferences options
- Organized helper functions into dedicated utils module


## How It Works

The tool fetches your complete trading history from Bitvavo, including:

- **All executed orders**: Both market orders and limit orders that were filled
- **Accurate cost basis**: Calculates your true average buy price across all trades
- **Real-time prices**: Gets current market prices for precise portfolio valuation
- **Comprehensive analysis**: Shows gain/loss based on your actual investment amounts

### Data Sources

- **Balance data**: From Bitvavo's `/balance` endpoint
- **Trade history**: From Bitvavo's `/trades` endpoint for each supported market
- **Current prices**: From Bitvavo's `/ticker/24h` endpoint

## Project Structure

```
src/
├── portfolio.tsx         # Main Raycast extension command
├── lib/
│   ├── bitvavo-client.ts # Bitvavo API client with Effect integration
│   ├── asset-analyzer.ts # Asset analysis and calculation logic
│   └── utils.ts          # Helper functions for formatting and display
└── types/
    └── bitvavo.ts        # TypeScript interfaces for Bitvavo API
```

## Development

### Scripts

- `npm run dev` - Run extension in development mode

### Technologies Used

- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[npm](https://www.npmjs.com/)** - Package manager
- **[Effect](https://effect.website/)** - Functional programming library for TypeScript
- **[Raycast API](https://developers.raycast.com/)** - For building the Raycast extension
- **[React](https://reactjs.org/)** - For Raycast extension UI components
- **[Axios](https://axios-http.com/)** - HTTP client for API requests

## API Requirements

To use this extension, you need to:

1. Create a Bitvavo account
2. Enable API access in your account settings
3. Generate an API key and secret
4. Configure the credentials in Raycast extension preferences
5. Ensure your API key has permission to read balances and trades

## Security

- API credentials are securely stored in Raycast preferences
- Never share your API credentials
- Keep your API secret secure and never commit it to version control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with `npm run dev`
5. Submit a pull request

## License

This project is private and for personal use only.
