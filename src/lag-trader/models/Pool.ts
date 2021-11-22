import { BigNumber, Contract, utils } from 'ethers'
import { abi as ERC20ABI } from '@openzeppelin/contracts/build/contracts/ERC20.json'
import { abi as TICK_LENS_ABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/TickLens.sol/TickLens.json'
import { abi as QUOTER_ABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import { PriceHelper } from '../utils/PriceHelpers'
import { DecimalBigNumberConverter } from '../utils/decimalBigNumberConverter'
import Decimal from 'decimal.js'
import { Exchange } from 'ccxt'
import { Provider } from '@ethersproject/abstract-provider'


export class PoolPair {
  private poolA: Pool
  private poolB: Pool

  constructor(poolA: Pool, poolB: Pool) {
    this.poolA = poolA
    this.poolB = poolB
  }

  public async load() {
    await this.poolA.load()
    await this.poolB.load()
  }
  public getMinPricePool(): Pool {
    let poolBPrice = this.poolB.getSqrtPriceX96()
    if (!this.sameTokenOrdering()) {
      poolBPrice = PriceHelper.invertPrice(poolBPrice)
    }
    return this.poolA.getSqrtPriceX96().lt(poolBPrice) ? this.poolA : this.poolB
  }

  public getPoolA(): Pool {
    return this.poolA
  }

  public getPoolB(): Pool {
    return this.poolB
  }

  public getMaxPricePool(): Pool {
    let poolBPrice = this.poolB.getSqrtPriceX96()
    if (!this.sameTokenOrdering()) {
      poolBPrice = PriceHelper.invertPrice(poolBPrice)
    }
    return this.poolA.getSqrtPriceX96().lt(poolBPrice) ? this.poolB : this.poolA
  }

  public sameTokenOrdering() {
    let token0AName = this.poolA.getToken0()!.getSymbol()
    let token1AName = this.poolA.getToken1()!.getSymbol()
    let token0BName = this.poolB.getToken0()!.getSymbol()
    let token1BName = this.poolB.getToken1()!.getSymbol()
    // good to check both since names can be fucked sometimes ie WETH <-> ETH
    return token0AName === token0BName || token1AName === token1BName
  }
}

export class Pool {
  private contract: Contract
  private fee: number | undefined
  private slot0: any
  private token0: Token | undefined
  private token1: Token | undefined
  private tickSpacing: number | undefined
  private liquidity: BigNumber | undefined
  private tickLens: Contract | undefined
  private quoter: Contract
  private chain: any
  private lockedLoops: number
  private swapsDisabled: boolean

  constructor(
    contract: Contract,
    swapsDisabled: boolean,
    quoter: Contract,
    lockedLoops: number,
  ) {
    this.contract = contract
    this.quoter = quoter
    this.lockedLoops = lockedLoops
    this.swapsDisabled = swapsDisabled
  }

  public async load(): Promise<Pool> {
    this.fee = await this.contract.fee()
    this.slot0 = await this.contract.slot0()
    this.token0 = new Token(
      new Contract(
        await this.contract.token0(),
        ERC20ABI,
        this.contract.provider,
      ),
    )
    await this.token0.load()
    this.token1 = new Token(
      new Contract(
        await this.contract.token1(),
        ERC20ABI,
        this.contract.provider,
      ),
    )
    await this.token1.load()
    this.tickLens = new Contract(
      '0xbfd8137f7d1516D3ea5cA83523914859ec47F573',
      TICK_LENS_ABI,
      this.contract.provider,
    )

    this.tickSpacing = await this.contract.tickSpacing()
    this.liquidity = await this.contract.liquidity()
    this.chain = await this.contract.provider.getNetwork()
    return this
  }

  public static getQuoter(provider: Provider) {
    return new Contract(
      '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
      QUOTER_ABI,
      provider,
    )
  }

  public setIsDisabled(isDisabled: boolean) {
    this.swapsDisabled = isDisabled
  }

  public setFee(fee: number) {
    this.fee = fee
  }

  public setSlot(slot: any) {
    this.slot0 = slot
  }

  public setToken0(token0: Token) {
    this.token0 = token0
  }

  public setToken1(token: Token) {
    this.token1 = token
  }

  public setTokens(token0: Token, token1: Token) {
    this.token0 = token0
    this.token1 = token1
  }

  public setChain(chain: any) {
    this.chain = chain
  }

  public areSwapsEnabled() {
    return !this.swapsDisabled
  }

  public getLockedLoops() {
    return this.lockedLoops
  }

  public incrementLockedLoops() {
    this.lockedLoops += 1
  }

  public getChain() {
    return this.chain.chainId
  }

  public getChainName() {
    switch (this.chain.chainId) {
      case 1:
        return 'L1'
      case 10:
        return 'Optimism'
      case 42161:
        return 'Arbitrum'
      default:
        return 'Unknown Chain'
    }
  }

  public getName() {
    return (
      this.getChainName() +
      '-' +
      this.getToken0()!.getSymbol() +
      '-' +
      this.getToken1()!.getSymbol()
    )
  }

  public getQuoter() {
    return this.quoter
  }

  public getSqrtPriceX96(): BigNumber {
    return this.slot0.sqrtPriceX96
  }

  public getSqrtPrice(): BigNumber {
    return PriceHelper.divX96Bn(this.getSqrtPriceX96())
  }

  public getPrice(): number {
    return PriceHelper.sqrtPriceX96ToPrice(this.getSqrtPriceX96())
  }

  public getNormalizedPrice(): number {
    return PriceHelper.sqrtPriceX96ToPriceNormalized(
      this.getSqrtPriceX96(),
      this.getDecimalDelta(),
    )
  }

  public getDecimalDelta(): number {
    return this.getToken0()!.getDecimals()! - this.getToken1()!.getDecimals()!
  }

  public getTick(): number {
    return this.slot0.tick
  }

  public getToken0() {
    return this.token0
  }

  public getToken1() {
    return this.token1
  }

  public getFee(): number {
    return this.fee!
  }

  public getFeeIndex(): number {
    switch (this.getFee()) {
      case 500:
        return 0
      case 3000:
        return 1
      case 10000:
        return 2
      default:
        return -1
    }
  }

  public getContract() {
    return this.contract
  }

  public getTickSpacing(): number {
    return this.tickSpacing!
  }

  public getLiquidity(): BigNumber {
    return this.liquidity!
  }

  public getTickLens(): Contract {
    return this.tickLens!
  }

  public getCexMarketName(cex: Exchange) {
    let market =
      cex.markets[
        this.getToken0()!.getSymbol() + '/' + this.getToken1()!.getSymbol()
      ]
    console.log()

    return this.getToken0()!.getSymbol() + '-' + this.getToken1()!.getSymbol()
  }

  public toString() {
    return (
      'Chain ' +
      this.getChain() +
      ': ' +
      this.token0!.getSymbol() +
      '/' +
      this.token1!.getSymbol() +
      ' ' +
      this.getFee() +
      ' Fee.'
    )
  }
}

export class Token {
  private contract: Contract
  private symbol: string | undefined
  private decimals: number | undefined

  constructor(token: Contract) {
    this.contract = token
  }

  public async load(): Promise<Token> {
    this.symbol = await this.contract.symbol()
    this.decimals = await this.contract.decimals()
    return this
  }

  public setSymbol(symbol: string) {
    this.symbol = symbol
  }

  public setDecimals(dec: number) {
    this.decimals = dec
  }

  public getSymbol() {
    return this.symbol
  }

  public getDecimals() {
    return this.decimals
  }

  public getContract() {
    return this.contract
  }

  public formatValue(value: BigNumber): string {
    return utils.formatUnits(value, this.getDecimals()) + ' ' + this.getSymbol()
  }

  public toDecimal(value: BigNumber): number {
    return parseFloat(utils.formatUnits(value, this.getDecimals()))
  }

  public fromDecimal(value: number): BigNumber {
    if (value == 0) {
      return BigNumber.from(0)
    }
    return DecimalBigNumberConverter.convertToBigNumber(
      new Decimal(value).mul(new Decimal(10).pow(this.decimals!)),
    )
  }

  public toString() {
    return `Token Symbol: ${this.getSymbol()}. Token Addy: ${
      this.getContract().address
    }`
  }
}

export class Tick {
  private tickIndex: number
  private reserves0: BigNumber
  private reserves1: BigNumber

  constructor(tickIndex: number, reserves0: BigNumber, reserves1: BigNumber) {
    this.tickIndex = tickIndex
    this.reserves0 = reserves0
    this.reserves1 = reserves1
  }

  public getTickIndex() {
    return this.tickIndex
  }

  public getReserves0() {
    return this.reserves0
  }

  public getReserves1() {
    return this.reserves1
  }

  public toString() {
    return 'sasdasd'
  }
}

export class TickRange {
  private ticks: Tick[]

  constructor(ticks: Tick[]) {
    this.ticks = ticks
  }

  public toString() {
    return JSON.stringify(this, null, 4)
  }

  public getTicks() {
    return this.ticks
  }
}
