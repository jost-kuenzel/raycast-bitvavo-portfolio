<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Coiny - Bitvavo Asset Tracker

This is a Raycast extension built with Bun and Effect that tracks cryptocurrency assets from Bitvavo exchange.

## Architecture Guidelines

- Use Effect for all async operations and error handling
- Follow functional programming principles
- Use proper TypeScript types and interfaces
- Implement services using Effect's Context pattern
- Use Effect's pipe operator for composing operations
- Handle errors gracefully with Effect's error handling

## Project Structure

- `src/portfolio.tsx` - Main Raycast extension command
- `src/lib/bitvavo-client.ts` - Bitvavo API client with Effect integration
- `src/lib/asset-analyzer.ts` - Asset analysis and calculation logic
- `src/lib/markdown-formatter.ts` - Raycast markdown output formatting
- `src/types/bitvavo.ts` - TypeScript interfaces for Bitvavo API
- `src/index.ts` - CLI application (secondary feature) with commander
- `src/lib/output-formatter.ts` - CLI output formatting with chalk

## Environment Variables

- `BITVAVO_API_KEY` - Your Bitvavo API key
- `BITVAVO_API_SECRET` - Your Bitvavo API secret

## Key Libraries

- **Effect**: For functional programming, async operations, and error handling
- **Bun**: Runtime and package manager
- **Raycast API**: For building the Raycast extension
- **React**: For Raycast extension UI
- **Axios**: HTTP client for API calls
- **Commander**: CLI argument parsing (secondary feature)
- **Chalk**: Terminal color output (secondary feature)

## Development Guidelines

- Always use Effect for async operations
- Implement proper error handling with Effect's error types
- Use type-safe imports for better TypeScript support
- Follow the existing service pattern for new features
- Use Effect's Context pattern for dependency injection
- Ensure shared logic between CLI and Raycast extension is modular and reusable
