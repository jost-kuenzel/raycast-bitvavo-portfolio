# Coiny - Bitvavo Asset Tracker

A TypeScript CLI tool and Raycast extension built with Bun and Effect that tracks your cryptocurrency assets from Bitvavo exchange, showing comprehensive gain/loss analysis based on your complete trading history.

## Setup Guide

### CLI Usage

```bash
# Run the CLI tool
bun run cli

# Or run specific commands
bun run cli assets
bun run cli --help
```

### Raycast Extension Usage

1. Start the extension in development mode:
   ```bash
   bun run dev
   ```

2. Open Raycast and search for "View Portfolio" or "Coiny"

3. Configure your API credentials:
   - Open the extension preferences (⌘+,)
   - Enter your Bitvavo API Key
   - Enter your Bitvavo API Secret

4. The extension will display your portfolio in a beautiful markdown format

### API Configuration

For CLI usage, set environment variables:
```bash
export BITVAVO_API_KEY="your_key_here"
export BITVAVO_API_SECRET="your_secret_here"
```

For Raycast extension, configure through the extension preferences UI.

## Features

- ✅ CLI tool with colored table output
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

### CLI Tool Preservation
- Kept original CLI functionality intact
- Added `cli` command to package.json for easy access
- Maintained colored terminal output with cli-table3
- All existing features work as before

### Shared Architecture
- Both CLI and Raycast extension use the same core services
- Effect-based architecture preserved
- BitvavoClient and AssetAnalyzer shared between both interfaces
- Proper TypeScript types maintained

## Example Output

```
🪙 Bitvavo Asset Portfolio
┌────────┬───────────────┬───────────────┬───────────────┬─────────────┬───────────┬───────────┬─────────────┐
│ Asset  │ Current Price │ Avg Buy Price │ Balance       │ Total Value │ Invested  │ Gain/Loss │ Gain/Loss % │
├────────┼───────────────┼───────────────┼───────────────┼─────────────┼───────────┼───────────┼─────────────┤
│ BTC    │ €102700.00    │ €93478.96     │ 0.06288781    │ €6458.58    │ €5878.69  │ €579.89   │ 9.86%       │
├────────┼───────────────┼───────────────┼───────────────┼─────────────┼───────────┼───────────┼─────────────┤
│ XRP    │ €2.56         │ €2.14         │ 331.45912300  │ €849.93     │ €708.21   │ €141.71   │ 20.01%      │
├────────┼───────────────┼───────────────┼───────────────┼─────────────┼───────────┼───────────┼─────────────┤
│ ETH    │ €2790.00      │ €2327.78      │ 0.47097084    │ €1314.01    │ €1096.32  │ €217.69   │ 19.86%      │
├────────┼───────────────┼───────────────┼───────────────┼─────────────┼───────────┼───────────┼─────────────┤
│ TOTAL  │               │               │               │ €8622.51    │ €7683.22  │ €939.30   │ 12.23%      │
└────────┴───────────────┴───────────────┴───────────────┴─────────────┴───────────┴───────────┴─────────────┘
```

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

- `bun run dev` - Run in development mode
- `bun run build` - Build for production
- `bun run start` - Run production build

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
