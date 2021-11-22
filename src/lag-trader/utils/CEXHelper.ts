import { Dictionary, Exchange, Market } from 'ccxt'
import { BigNumber } from 'ethers'
import { Pool, Token } from '../models/Pool'

export class CEXHelper {
  public static convertSymbolForCEX(symbol: string) {
    return this.stablesToUSD(this.removeWrappedFromSymbol(symbol))
  }

  public static removeWrappedFromSymbol(symbol: string) {
    return symbol.startsWith('W') ? symbol.substring(1, symbol.length) : symbol
  }

  public static stablesToUSD(symbol: string) {
    let stables = ['DAI', 'USDT', 'USDC']

    if (stables.includes(symbol)) {
      return 'USD'
    } else {
      return symbol
    }
  }

  public static getPrice(dex: Pool, cex: Market) {
    // this makes sure the price is in the same base currency for DEX and CEX (comparing apples to apples)
    if (
      this.convertSymbolForCEX(dex.getToken0()!.getSymbol()!) === cex.baseId
    ) {
      return cex.info.price
    } else {
      return 1 / cex.info.price
    }
  }

  public static getMarketId(dex: Pool, cex: Market) {
    if (
      this.convertSymbolForCEX(dex.getToken0()!.getSymbol()!) === cex.baseId
    ) {
      return cex.baseId + '/' + cex.quoteId
    } else {
      return cex.quoteId + '/' + cex.baseId
    }
  }

  public static getRelevantCEXMarket(
    pool: Pool,
    markets: Dictionary<Market>,
  ): Market {
    let market0to1
    try {
      let potentialMarketName =
        CEXHelper.convertSymbolForCEX(pool.getToken0()!.getSymbol()!) +
        '/' +
        CEXHelper.convertSymbolForCEX(pool.getToken1()!.getSymbol()!)
      market0to1 = markets[potentialMarketName]
    } catch (err) {
      console.log(err)
    }
    if (market0to1) {
      return market0to1
    }

    let market1to0: Market | undefined
    try {
      let potentialMarketName =
        CEXHelper.convertSymbolForCEX(pool.getToken1()!.getSymbol()!) +
        '/' +
        CEXHelper.convertSymbolForCEX(pool.getToken0()!.getSymbol()!)
      market1to0 = markets[potentialMarketName]
    } catch (err) {
      console.log(err)
    }

    if (market1to0) {
      return market1to0
    }

    throw 'UNABLE TO LOCATE CEX MARKET: ' + pool.toString()
  }

  public static getAmountAtCEXPrice(
    amount: BigNumber,
    token: Token,
    market: Market,
  ) {
    let decimalizedAmount = token.toDecimal(amount)

    let tokenSymbol = this.convertSymbolForCEX(token.getSymbol()!)
    let cexPriceMultiplier
    // console.log(tokenSymbol)
    // console.log(market.baseId)
    // console.log("Amount Middle: " + decimalizedAmount)
    if (tokenSymbol === market.baseId) {
      cexPriceMultiplier = market.info.price
    } else {
      cexPriceMultiplier = 1 / market.info.price
    }
    return decimalizedAmount * cexPriceMultiplier
  }
}
