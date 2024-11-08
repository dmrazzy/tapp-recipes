import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { ethers } from "ethers";
import { base, baseSepolia } from "viem/chains";
import { tokenData } from "@token-kit/onchain";
import { createPublicClient, http, PublicClient } from "viem";
import { isProd, OPENSEA_API } from "./constant";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


const client = createPublicClient({
    chain: isProd ? base : baseSepolia,
    transport: http()
});


interface Token {
    image: string;
    attributes:
    {
        "trait_type": string;
        "value": string | number
    }[];
    name: string;
    description: string;
}

interface OpenSeaListing {
    created_date: string;
    expiration_time: number;
    order_hash: string;
    protocol_data: {
        parameters: {
            offerer: string;
            offer: Array<{
                itemType: number;
                token: string;
                identifierOrCriteria: string;
                startAmount: string;
                endAmount: string;
            }>;
            consideration: Array<{
                itemType: number;
                token: string;
                identifierOrCriteria: string;
                startAmount: string;
                endAmount: string;
                recipient: string;
            }>;
        };
        signature: null;
    };
    protocol_address: string;
    current_price: string;
    maker: {
        user: number;
        profile_img_url: string;
        address: string;
        config: string;
    };
    maker_asset_bundle: {
        assets: Array<{
            id: number;
            token_id: string;
            image_url: string | null;
            name: string | null;
            asset_contract: {
                address: string;
                name: string;
                schema_name: string;
                symbol: string;
            };
        }>;
    };
    taker: null;
    cancelled: boolean;
    finalized: boolean;
    marked_invalid: boolean;
}


export async function loadListings(chain: string, maker: string) {
    const headers = isProd
        ? { 'X-API-KEY': process.env.NEXT_PUBLIC_OPENSEA_API_KEY }
        : {};
    const listings = (
        await axios.get(
            `${OPENSEA_API}/api/v2/orders/${chain}/seaport/listings?maker=${maker}`, { headers }
        )
    ).data.orders;

    return await Promise.all(
        listings.map(async (listing: OpenSeaListing) => {
            let token: Token = {
                image: '',
                attributes: [],
                name: '',
                description: 'unknow'
            }
            try {
                const result = await tokenData(
                    client as PublicClient,
                    listing.protocol_data.parameters.offer[0].token as `0x${string}`,
                    Number(listing.protocol_data.parameters.offer[0].identifierOrCriteria), { includeTokenMetadata: true },
                );

                if ('tokenMetadata' in result) {
                    token = result.tokenMetadata as Token;
                }
                console.log("result", result)
            } catch (error) {
                console.log(error)
            }

            console.log(listing);
            return {
                orderHash: listing.order_hash,
                currentPrice: `${ethers.formatEther(listing.current_price)} eth`,
                protocolAddress: listing.protocol_address,
                expireTime: listing.expiration_time,
                taker: listing.taker,
                assets: listing.maker_asset_bundle.assets.map(() => {
                    return {
                        ...token, ...{
                            tokenContract: listing.protocol_data.parameters.offer[0].token,
                            tokenId: listing.protocol_data.parameters.offer[0].identifierOrCriteria
                        }
                    };
                }),
            };
        })

    );
}

export function addressPipe(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const getChainName = (chainId: number) => {
    switch (chainId) {
        case 8453:
            return 'base';
        case 84532:
            return 'base-sepolia';
        default:
            return 'ethereum';
    }
};
