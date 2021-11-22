import { Provider } from '@ethersproject/abstract-provider'
import { PoolSeed } from './models/PoolSeed'
import { Dictionary, Exchange, Market } from 'ccxt'
import { CEXHelper } from './utils/CEXHelper'
import { BlockEvent } from 'forta-agent'
import { Pool } from './models/Pool'

export default class LagTradingManager {
  private dexSeeds: PoolSeed[]
  private cexes: Exchange[]
  private ethHoldings: number = 10
  private usdHoldings: number = 0

  constructor(dexSeeds: PoolSeed[], cexes: Exchange[]) {
    this.dexSeeds = dexSeeds
    this.cexes = cexes
  }

  public async run(blockHeight: BlockEvent) {
    this.dexSeeds.forEach(async (dexSeed) => {
      this.cexes.forEach(async (cex) => {
        let pool: Pool;
        let markets: Dictionary<Market>;
        try {
          pool = await dexSeed.getPool()
          markets = await cex.loadMarkets(true)
        } catch (error) {
          console.log(error)
          return
        }
        const market = CEXHelper.getRelevantCEXMarket(pool, markets)

        const dexPrice = pool.getNormalizedPrice()
        const cexPrice = market.info.price

        const delta = dexPrice - cexPrice
        const deltaBips = (delta / dexPrice) * 10000

        // if token we are currently holding is losing value against the other > threshold, then switch

        if (deltaBips > 25 && this.ethHoldings > 0) {
          // should be selling our eth into USD
          this.usdHoldings = this.ethHoldings * dexPrice
          this.ethHoldings = 0
        } else if (deltaBips < -25 && this.usdHoldings > 0) {
          // should be buying eth from USD
          this.ethHoldings = this.usdHoldings / dexPrice
          this.usdHoldings = 0
        }

        console.log(
          `${blockHeight}, ${dexPrice}, ${cexPrice}, ${deltaBips}, ${this.ethHoldings}, ${this.usdHoldings}`,
        )
      })
    })
  }
}
