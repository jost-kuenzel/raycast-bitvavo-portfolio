import { Color, Image } from '@raycast/api'

/**
 * Formats a number with proper locale formatting
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formats a signed number with + or - prefix
 */
export const formatSignedNumber = (value: number): string => {
  const formattedValue = formatNumber(Math.abs(value))
  return value >= 0 ? `+ ${formattedValue}` : `- ${formattedValue}`
}

/**
 * Formats a signed currency value with color coding and currency symbol
 */
export const formatSignedCurrencyWithColor = (
  value: number,
  currencySymbol: string,
): { color: Color; value: string } => {
  const formattedValue = formatNumber(Math.abs(value))
  const color = value >= 0 ? Color.Green : Color.Red
  const sign = value >= 0 ? '+ ' : '- '
  return { color, value: `${sign}${currencySymbol}${formattedValue}` }
}

/**
 * Formats a signed number with color coding
 */
export const formatSignedNumberWithColor = (
  value: number,
): { color: Color; value: string } => {
  const formattedValue = formatNumber(Math.abs(value))
  const color = value >= 0 ? Color.Green : Color.Red
  const sign = value >= 0 ? '+ ' : '- '
  return { color, value: `${sign}${formattedValue}` }
}

/**
 * Gets cryptocurrency icon URL from jsdelivr CDN
 */
export const getCryptocurrencyIcon = (symbol: string): Image => {
  const baseUrl =
    'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color'
  const iconUrl = `${baseUrl}/${symbol.toLowerCase()}.svg`

  return {
    source: iconUrl,
    fallback: `${baseUrl}/generic.svg`,
    mask: Image.Mask.Circle,
  }
}

/**
 * Gets currency symbol from market string
 */
export const getCurrencySymbolFromMarket = (market: string): string => {
  if (market.endsWith('-USDC')) return '$'
  return '€' // Default to EUR
}

/**
 * Formats market display from trading pair format
 */
export const formatMarketDisplay = (market: string): string => {
  return market.replace('-', ' / ')
}
