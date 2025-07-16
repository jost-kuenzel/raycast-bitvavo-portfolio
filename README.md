# Coiny - Bitvavo Asset Tracker

A TypeScript CLI tool built with Bun and Effect that tracks your cryptocurrency assets from Bitvavo exchange, showing comprehensive gain/loss analysis based on your complete trading history.

## Features

- 🔍 Fetches your current cryptocurrency balances from Bitvavo
- 📊 Analyzes your complete trade history including all executed orders (limit orders, market orders)
- 💰 Shows current market prices and total portfolio value
- 📈 Displays accurate gain/loss calculations in both absolute and percentage terms
- 🎨 Beautiful colored terminal output with formatted tables
- ⚡ Built with Effect for robust async operations and error handling
- 🔄 Automatically fetches trades for BTC-EUR, XRP-EUR, and ETH-EUR markets

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- A Bitvavo account with API access enabled
- API Key and Secret from your Bitvavo account

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Build the project:
   ```bash
   bun run build
   ```

## Configuration

Set your Bitvavo API credentials as environment variables:

```bash
export BITVAVO_API_KEY="your_api_key_here"
export BITVAVO_API_SECRET="your_api_secret_here"
```

Or create a `.env` file in the project root:

```
BITVAVO_API_KEY=your_api_key_here
BITVAVO_API_SECRET=your_api_secret_here
```

## Usage

### Development Mode
```bash
bun run dev
```

### Production Mode
```bash
bun run start
```

### Available Commands

- `coiny` or `coiny assets` - Display your cryptocurrency assets with gain/loss analysis

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
