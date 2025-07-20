<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Coiny - Bitvavo Asset Tracker

This is a Raycast extension built with Node.js and Effect that tracks cryptocurrency assets from Bitvavo exchange.

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
- `src/lib/asset-analyzer.ts` - Asset analysis service using Effect.Service pattern
- `src/lib/utils.ts` - Helper functions for formatting and UI utilities
- `src/types/bitvavo.ts` - TypeScript interfaces for Bitvavo API

## Environment Variables

The extension uses Raycast preferences for configuration instead of environment variables:

- `bitvavoApiKey` - Your Bitvavo API key (configured via Raycast preferences)
- `bitvavoApiSecret` - Your Bitvavo API secret (configured via Raycast preferences)

## Key Libraries

- **Effect**: For functional programming, async operations, and error handling
- **Node.js**: Runtime environment
- **npm**: Package manager
- **Raycast API**: For building the Raycast extension
- **React**: For Raycast extension UI
- **Axios**: HTTP client for API calls

## Development Guidelines

- Always use Effect for async operations
- Implement proper error handling with Effect's error types
- Use type-safe imports for better TypeScript support
- Follow the existing service pattern for new features
- Use Effect's Context pattern for dependency injection
