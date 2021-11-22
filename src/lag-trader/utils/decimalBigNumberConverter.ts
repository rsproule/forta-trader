import {BigNumber} from 'ethers';
import {Decimal} from 'decimal.js';

export class DecimalBigNumberConverter {
    private readonly CHUNK_SIZE : number = 5; // increasing size of this will eventually fail to parse as BN

    public static convertToBigNumber(decimal: Decimal) : BigNumber {
        if (decimal.eq(0)) return BigNumber.from(0)
        let chunkSize = 6;
        let digits = decimal.log().floor();
        let bigNumberBuilder = BigNumber.from(0);

        let iteration = 1;
        let lastDecimal: Decimal = new Decimal(0);
        
        do {
            let precision = new Decimal(10).pow(digits.sub(new Decimal(chunkSize).mul(iteration)));
            let precisionBN = BigNumber.from(10).pow(BigNumber.from(digits.toNumber()).sub(BigNumber.from(chunkSize).mul(iteration))); 

            // move decimal all the way to the left to create smaller big number
            let chunkMovedLeft = decimal.sub(lastDecimal).div(precision).floor(); 
            let bigNumberSmall: BigNumber = BigNumber.from(chunkMovedLeft.toNumber())
            let bigNumberChunk = bigNumberSmall.mul(precisionBN)
            bigNumberBuilder = bigNumberBuilder.add(bigNumberChunk);
            // move it back to the right 
            let backToRightRounded = chunkMovedLeft.mul(precision);
            lastDecimal = lastDecimal.add(backToRightRounded);
            iteration += 1
        } while (digits.gt(chunkSize * (iteration))) 

        return bigNumberBuilder;
    }

}