import { Token, Pool } from './Pool'

const logger = require('../../service/logger')
export class PoolArb {
  private _dexPrice: number
  public get dexPrice(): number {
    return this._dexPrice
  }
  public set dexPrice(value: number) {
    this._dexPrice = value
  }
  private _cexPrice: number
  public get cexPrice(): number {
    return this._cexPrice
  }
  public set cexPrice(value: number) {
    this._cexPrice = value
  }
  private _cheaperToken: Token
  public get cheaperToken(): Token {
    return this._cheaperToken
  }
  public set cheaperToken(value: Token) {
    this._cheaperToken = value
  }
  private _otherToken: Token
  public get otherToken(): Token {
    return this._otherToken
  }
  public set otherToken(value: Token) {
    this._otherToken = value
  }
  private _isBuy: boolean
  public get isBuy(): boolean {
    return this._isBuy
  }
  public set isBuy(value: boolean) {
    this._isBuy = value
  }
  private _priceDifference: number
  public get priceDifference(): number {
    return this._priceDifference
  }
  public set priceDifference(value: number) {
    this._priceDifference = value
  }
  private _priceDifferencePercentage: number
  public get priceDifferencePercentage(): number {
    return this._priceDifferencePercentage
  }
  public set priceDifferencePercentage(value: number) {
    this._priceDifferencePercentage = value
  }

  private _priceDifferenceBips: number
  public get priceDifferenceBips(): number {
    return this._priceDifferenceBips
  }
  public set priceDifferenceBips(value: number) {
    this._priceDifferenceBips = value
  }

  private _zeroToOne: boolean
  public get zeroToOne(): boolean {
    return this._zeroToOne
  }
  public set zeroToOne(value: boolean) {
    this._zeroToOne = value
  }

  private _cexMarketId: string
  public get cexMarketId(): string {
    return this._cexMarketId
  }
  public set cexMarketId(value: string) {
    this._cexMarketId = value
  }

  constructor(
    cexPrice: number,
    dexPrice: number,
    cexMarketId: string,
    cheaperToken: Token,
    otherToken: Token,
    isBuy: boolean,
    zeroToOne: boolean,
    priceDifference: number,
    priceDifferencePercentage: number,
    priceDifferenceBips: number,
  ) {
    this._cexPrice = cexPrice
    this._dexPrice = dexPrice
    this._cheaperToken = cheaperToken
    this._otherToken = otherToken
    this._isBuy = isBuy
    this._zeroToOne = zeroToOne
    this._priceDifference = priceDifference
    this._priceDifferencePercentage = priceDifferencePercentage
    this._priceDifferenceBips = priceDifferenceBips
    this._cexMarketId = cexMarketId
  }

  toString(requestId: string, pool: Pool) {
    logger.info(
      requestId + ' ' + pool.toString() + ' ' + 'DEX Price: ' + this.dexPrice,
    )
    logger.info(
      requestId + ' ' + pool.toString() + ' ' + 'CEX Price: ' + this.cexPrice,
    )
    logger.info(
      requestId +
        ' ' +
        pool.toString() +
        ' ' +
        'Cheaper Token: ' +
        this.cheaperToken.getSymbol(),
    )
    logger.info(
      requestId + ' ' + pool.toString() + ' ' + 'Is Buy: ' + this.isBuy,
    )
    logger.info(
      requestId + ' ' + pool.toString() + ' ' + 'ZeroToOne: ' + this.zeroToOne,
    )
    logger.info(
      requestId +
        ' ' +
        pool.toString() +
        ' ' +
        'Price Difference: ' +
        this.priceDifference,
    )
    logger.info(
      requestId +
        ' ' +
        pool.toString() +
        ' ' +
        'Price Difference(percentage): ' +
        this.priceDifferencePercentage.toFixed(5) +
        '%',
    )
    logger.info(
      requestId +
        ' ' +
        pool.toString() +
        ' ' +
        'Price Difference(BIPS): ' +
        this.priceDifferenceBips,
    )
  }
}
