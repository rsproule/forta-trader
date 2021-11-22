import { Exchange, ftx } from 'ccxt'
import {
  BlockEvent,
  Finding,
  HandleBlock,
  getEthersProvider,
} from 'forta-agent'
import LagTradingManager from './lag-trader/LagTradingManager'
import { PoolSeed } from './lag-trader/models/PoolSeed'

const dexSeeds: PoolSeed[] = [
  new PoolSeed(
    '0xc82819f72a9e77e2c0c3a69b3196478f44303cf4',
    getEthersProvider(),
    true,
  ),
]

const cexes: Exchange[] = [new ftx()]
const lagTradingManager: LagTradingManager = new LagTradingManager(dexSeeds, cexes)

const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
  lagTradingManager.run(blockEvent)
  // dont give a fat fuck about findings.
  // we just want your beautiful types and arbitrary block sims
  const findings: Finding[] = []
  return findings
}

export default {
  handleBlock,
}
