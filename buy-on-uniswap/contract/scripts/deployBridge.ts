import {ethers, network, upgrades} from 'hardhat';
import { MockERC20, TokenBridgeV3 } from '../typechain-types';

let TokenBridgeV3, tokenBridge, owner, addr1, addr2;
let MockERC20, sln, usdt, weth;

let uniswapRouterAddress

let tx

async function main() {
    const [owner] = await ethers.getSigners();
    console.log("ETH balance = ", ethers.formatEther( await ethers.provider.getBalance(owner.address)))

    console.log("Owner address... ", owner.address)
    switch (network.name) {
        case "baseSepolia":
            uniswapRouterAddress = "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4"
            break
        case "mainnet":
            uniswapRouterAddress = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"
            break

    }
    if (!uniswapRouterAddress){
        console.log("Uniswap router address undefined.. exit...")
        return
    } 
    
    // Deploy TokenBridgeV3
    TokenBridgeV3 = await ethers.getContractFactory("TokenBridgeV3");
    tokenBridge = await upgrades.deployProxy(TokenBridgeV3.connect(owner), [uniswapRouterAddress]) as unknown as TokenBridgeV3
    await tokenBridge.waitForDeployment()

    console.log("Bridge deployed... ", tokenBridge.target)
}

main().then(console.log).catch(console.log);


