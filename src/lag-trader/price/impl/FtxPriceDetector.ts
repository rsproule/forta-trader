import PriceDetector from "../PriceDetector.model";

export default class FtxPriceDetector implements PriceDetector {
    private baseCurrency: string;
    private quoteCurrency: string;

    constructor(baseCurrency: string, quoteCurrency: string) {
        this.baseCurrency = baseCurrency;
        this.quoteCurrency = quoteCurrency;
    }

    public getPrice(): number {
        return 1;
    }

}