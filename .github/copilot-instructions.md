<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Coiny - Bitvavo Asset Tracker

This is a TypeScript CLI tool built with Bun and Effect that tracks cryptocurrency assets from Bitvavo exchange.

## Architecture Guidelines

- Use Effect for all async operations and error handling
- Follow functional programming principles
- Use proper TypeScript types and interfaces
- Implement services using Effect's Context pattern
- Use Effect's pipe operator for composing operations
- Handle errors gracefully with Effect's error handling

## Project Structure

- `src/index.ts` - Main CLI application with commander
- `src/lib/bitvavo-client.ts` - Bitvavo API client with Effect integration
- `src/lib/asset-analyzer.ts` - Asset analysis and calculation logic
- `src/lib/output-formatter.ts` - CLI output formatting with chalk
- `src/types/bitvavo.ts` - TypeScript interfaces for Bitvavo API

## Environment Variables

- `BITVAVO_API_KEY` - Your Bitvavo API key
- `BITVAVO_API_SECRET` - Your Bitvavo API secret

## Key Libraries

- **Effect**: For functional programming, async operations, and error handling
- **Bun**: Runtime and package manager
- **Commander**: CLI argument parsing
- **Chalk**: Terminal color output
- **Axios**: HTTP client for API calls

## Development Guidelines

- Always use Effect for async operations
- Implement proper error handling with Effect's error types
- Use type-safe imports for better TypeScript support
- Follow the existing service pattern for new features
- Use Effect's Context pattern for dependency injection
