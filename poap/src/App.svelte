<script lang="ts">
	import type { ITokenContextData } from '@tokenscript/card-sdk/dist/types';
	import context from './lib/context';
	import NotFound from './routes/NotFound.svelte';
	import MintSouvenir from './routes/MintSouvenir.svelte';
	import CreateSouvenir from './routes/CreateSouvenir.svelte';
	import './styles.css';

	let token: ITokenContextData;
	let tsViewerType;

	let page: Page;

	tsViewerType =
		new URLSearchParams(document.location.hash.substring(1)).get('tsViewerType') ?? 'default';

	function routeChange() {
		const card: string = new URLSearchParams(document.location.hash.substring(1)).get('card') ?? '';
		page = card == "MintSouvenir" ? MintSouvenir : CreateSouvenir;
	}

	if (tokenscript.tokens.data.currentInstance) {
		context.setToken(tokenscript.tokens.data.currentInstance);
	}

	tokenscript.tokens.dataChanged = async (oldTokens, updatedTokens, cardId) => {
		context.setToken(updatedTokens.currentInstance);
		token = updatedTokens.currentInstance;

		if (tokenscript.tokens.data.currentInstance) {
			context.setToken(tokenscript.tokens.data.currentInstance);
			token = tokenscript.tokens.data.currentInstance
			console.log({token})
		}
		routeChange();
	};
	window.addEventListener('message', (event) => {
		console.log('TAPP event: ', event);
		// Verify origin
		if (event.origin !== import.meta.env.VITE_BACKEND_URL) return;

		if (event.data.type === 'TWITTER_AUTH_SUCCESS') {
			const userData = event.data.user;
			// Handle authentication success
		}
	});
</script>

<svelte:window on:hashchange={routeChange} />

<div>
	<div id="token-container">
		<svelte:component this={page} />
	</div>
</div>
