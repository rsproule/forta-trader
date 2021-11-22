import PriceDetector from "../PriceDetector.model"

export default class UniswapPriceDetector implements PriceDetector{
  private pairAddress: string

  constructor(pairAddress: string) {
    this.pairAddress = pairAddress
  }

  getPrice(): number {
    return 1
  }
}
