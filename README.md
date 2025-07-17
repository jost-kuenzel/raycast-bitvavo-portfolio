# Coiny - Bitvavo Asset Tracker

A Raycast extension built with Bun and Effect that tracks your cryptocurrency assets from Bitvavo exchange, showing comprehensive gain/loss analysis based on your complete trading history.

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
- Created `MarkdownFormatter` for beautiful table rendering
- Configured extension preferences for API credentials
- Added action panel with refresh and preferences options


## How It Works

The tool fetches your complete trading history from Bitvavo, including:

- **All executed orders**: Both market orders and limit orders that were filled
- **Accurate cost basis**: Calculates your true average buy price across all trades
- **Real-time prices**: Gets current market prices for precise portfolio valuation
- **Comprehensive analysis**: Shows gain/loss based on your actual investment amounts

### Data Sources

- **Balance data**: From Bitvavo's `/balance` endpoint
- **Trade history**: From Bitvavo's `/trades` endpoint for each market (BTC-EUR, XRP-EUR, ETH-EUR)
- **Current prices**: From Bitvavo's `/ticker/24h` endpoint

## Project Structure

```
src/
├── index.ts              # Main CLI application
├── lib/
│   ├── bitvavo-client.ts # Bitvavo API client with Effect integration
│   ├── asset-analyzer.ts # Asset analysis and calculation logic
│   └── output-formatter.ts # CLI output formatting with chalk
└── types/
    └── bitvavo.ts        # TypeScript interfaces for Bitvavo API
```

## Development

### Scripts

- `npm run dev` - Run in development mode

### Technologies Used

- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager
- **[Effect](https://effect.website/)** - Functional programming library for TypeScript
- **[Commander](https://github.com/tj/commander.js/)** - CLI framework
- **[Chalk](https://github.com/chalk/chalk)** - Terminal string styling
- **[cli-table3](https://github.com/cli-table/cli-table3)** - Pretty table formatting for CLI
- **[Axios](https://axios-http.com/)** - HTTP client

## API Requirements

To use this tool, you need to:

1. Create a Bitvavo account
2. Enable API access in your account settings
3. Generate an API key and secret
4. Ensure your API key has permission to read balances and trades

## Security

- Never commit your API credentials to version control
- Use environment variables or a `.env` file for credentials
- Keep your API secret secure and never share it

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and for personal use only.
