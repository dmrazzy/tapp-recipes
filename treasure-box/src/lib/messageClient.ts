import { signMessage } from './data';
import { Token } from './types';

export class MessageClient {
	private static BASE_URL =
		import.meta.env.VITE_MESSAGING_API_BASE_URL ??
		'https://store-backend-stage.smartlayer.network/treasure-box';
	// "http://127.0.0.1:3006/treasure-box";

	private challengeExp = null;
	private challengeText = null;
	private challengeSig = null;

	constructor(private tokenContext: Token) {}

	public async openBox(twitter: string, boxNumber: number) {
		// return await this.requestWithAuth(
		// 	`/send-message/${this.tokenContext.chainId}/${this.tokenContext.contractAddress}/${this.tokenContext.tokenId}/${friendId}`,
		// 	'post',
		// 	{ message, encrypted }
		// );
		return await this.request(`/open/${twitter}/${boxNumber}`, 'post', { auth: '123' });
	}

	private async requestWithAuth(url: string, method: 'get' | 'post', requestData?: any) {
		if (
			!this.tokenContext.tokenId ||
			!this.tokenContext.contractAddress ||
			!this.tokenContext.chainId
		) {
			throw new Error('Error in token data. missing properties');
		}

		if (!this.challengeText || this.challengeExp < Date.now()) {
			await this.fetchAndSignChallenge();
		}

		try {
			return await this.request(url, method, requestData);
		} catch (e) {
			if (e.message === 'Authorisation failed') {
				this.challengeText = null;
				await this.fetchAndSignChallenge();
				return await this.request(url, method, requestData);
			}
			console.log(e);
			throw e;
		}
	}

	private async fetchAndSignChallenge() {
		const challenge = await this.request('/challenge', 'get');

		try {
			this.challengeSig = await signMessage(challenge.text);
			this.challengeExp = challenge.expiry;
			this.challengeText = challenge.text;
		} catch (e) {
			if (typeof e == 'string' && e.toLowerCase().includes('user rejected signing')) {
				e = 'User rejected signing.';
			}
			// console.error("Authentication failed: ", e);
			throw new Error(e);
		}
	}

	private async request(url: string, method: 'get' | 'post', requestData?: any) {
		const headers: any = {
			'Content-type': 'application/json',
			Accept: 'application/json'
		};

		if (this.challengeSig)
			headers['X-SmartCat-Auth'] = this.challengeText + ':' + this.challengeSig;

		const res = await fetch(MessageClient.BASE_URL + url, {
			method,
			headers,
			body: requestData ? JSON.stringify(requestData) : undefined
		});

		let data: any;

		try {
			data = await res.json();
		} catch (e: any) {}

		if (res.status > 299 || res.status < 200) {
			if (res.status === 403) throw new Error('Authorisation failed');
			throw new Error(data?.message ?? res.statusText);
		}

		return data;
	}
}
