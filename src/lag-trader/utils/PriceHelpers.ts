import { BigNumber } from "ethers";

import Decimal from "decimal.js";

import { DecimalBigNumberConverter } from "./decimalBigNumberConverter";

export class PriceHelper {

    public static invertPrice(price: BigNumber) {
        return (BigNumber.from(2).pow(96 * 2)).div(price)
    }

    public static getPriceAtTick(tick: number): BigNumber {
        let negativeTick: boolean = tick < 0
        if (negativeTick) {
            tick = -tick;
        }
        let sqrtPrice: Decimal = ((new Decimal(1.0001).pow(tick)).sqrt()).mul(new Decimal(2).pow(96));
        let result: BigNumber = DecimalBigNumberConverter.convertToBigNumber(sqrtPrice)
        if (negativeTick) {
            result = this.invertPrice(result);
        }
        return result;
    }


    public static sqrtPriceX96ToSqrtPrice(sqrtPriceX96: number) {
        const x96 = Math.pow(2, 96);
        let sqrtPrice = sqrtPriceX96 / x96;
        return sqrtPrice;
    }

    public static divX96Bn(sqrtPriceX96: BigNumber) {
        let sqrtPrice = sqrtPriceX96.div(BigNumber.from(2).pow(96));
        return sqrtPrice;
    }

    public static sqrtPriceX96ToPrice(sqrtPriceX96: BigNumber): number {
        return this.formatPrice(sqrtPriceX96).toNumber();
    }

    public static sqrtPriceX96ToPriceNormalized(sqrtPriceX96: BigNumber, decimalDelta: number) {
        return this.formatPrice(sqrtPriceX96).mul(new Decimal(10).pow(decimalDelta)).toNumber();
    }

    public static priceToSqrtPriceX96(price: number): BigNumber {
        let sqrtPriceX96: Decimal = new Decimal(price).sqrt().mul(new Decimal(2).pow(96));
        return DecimalBigNumberConverter.convertToBigNumber(sqrtPriceX96);
    }

    public static priceToSqrtPriceX96Normalized(price: number, decimalDelta: number): BigNumber {
        let priceDecimalCorrected = new Decimal(price).div(new Decimal(10).pow(decimalDelta))
        let sqrtPriceX96: Decimal = new Decimal(priceDecimalCorrected).sqrt().mul(new Decimal(2).pow(96));
        return DecimalBigNumberConverter.convertToBigNumber(sqrtPriceX96);
    }

    public static formatPrice(price: BigNumber): Decimal {
        return new Decimal(price.toString()).dividedBy(new Decimal(2).pow(96)).pow(2)
    }
}