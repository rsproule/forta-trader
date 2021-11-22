import { BigNumber } from "ethers";

export interface Reserves {
    readonly balance0: BigNumber;
    readonly balance1: BigNumber;
    readonly balance0Cex: number;
    readonly balance1Cex: number;
    readonly balance0DexDecimals: number;
    readonly balance1DexDecimals: number;
    readonly token0Symb: string;
    readonly token1Symb: string;
    readonly dexName: string;
    readonly cexName: string;
}