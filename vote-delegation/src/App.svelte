<script lang="ts">
	import context from './lib/context';
	import Info from './routes/Info.svelte';
	import NotFound from './routes/NotFound.svelte';
	import Delegate from './routes/Delegate.svelte';
	import './styles.css';

	let token;

	const routingMap = {
		Info: Info,
		Delegate: Delegate
	};

	let page;

	function routeChange() {
		const card = new URLSearchParams(document.location.hash.substring(1)).get('card') ?? '';
		console.log('card', card);

		page = routingMap[card] || NotFound;
	}

	tokenscript.tokens.dataChanged = async (oldTokens, updatedTokens, cardId) => {
		context.setToken(updatedTokens.currentInstance);
		token = updatedTokens.currentInstance;

		routeChange();
	};
</script>

<svelte:window on:hashchange={routeChange} />

<div class="w-full h-full">
	<div id="token-container" class="w-full h-full">
		<svelte:component this={page} />
	</div>
</div>
