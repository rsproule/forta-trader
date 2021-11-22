import { Contract } from "@ethersproject/contracts";
import { Pool, Token } from "./Pool";
import { abi as POOL_ABI_IMPL } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import { abi as ERC20ABI } from '@openzeppelin/contracts/build/contracts/ERC20.json';
import { Provider } from "@ethersproject/abstract-provider";


export class PoolSeed {
    private address: string;
    public provider: Provider;
    private enabled: boolean;
    constructor(address: string, provider: Provider, enabled: boolean) {
        this.address = address;
        this.provider = provider;
        this.enabled = enabled
    }

    public async getPool(): Promise<Pool> {
        let contract: Contract = new Contract(this.address, POOL_ABI_IMPL, this.provider);
        let pool: Pool = new Pool(contract, this.enabled, Pool.getQuoter(this.provider), -1);
        pool.setFee(await pool.getContract().fee());
        pool.setSlot(await pool.getContract().slot0());
        let token0: Token = await new Token(new Contract(await pool.getContract().token0(), ERC20ABI, this.provider)).load();
        let token1: Token = await new Token(new Contract(await pool.getContract().token1(), ERC20ABI, this.provider)).load();
        pool.setTokens(token0, token1);
        pool.setChain(await this.provider.getNetwork());
        return pool;
    }
}