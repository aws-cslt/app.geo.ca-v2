<script lang="ts">
	import Description from './description.svelte';
	import Metadata from './metadata.svelte';
	import MapPreview from './map.svelte';

	import { tick } from 'svelte';
	import { page } from '$app/stores';
	import { toggleScroll } from '$lib/components/component-utils/toggleScroll';
	import { poll } from '$lib/components/component-utils/poller';

	import './process-schema.ts';

	const process = $page.data.svcDef;
	const t = $page.data.t;

	let stopPoller: Function | undefined;

	interface Props {
		active?: boolean;
	}

	let { active = $bindable(false) }: Props = $props();

	let jobId: string | undefined = $state();

	let statusJson: JobStatus = $state({
		jobID: '',
		status: '',
		type: ''
	});

	let resultUrl: string | undefined = $state();
	let requestedFormat: string = $state('');

	let processSuccessful: boolean = $state(false);

	let map: MapPreview | undefined = $state();

	let mapVisible: boolean = $state(false);
	let requestUrl: string = $state('');

	const supportedTypes3d = ['application/vnd.google-earth.kml+xml', 'application/geo+json'];
	const supportedTypes2d = ['application/geo+json'];

	// Submit the execution request
	export async function execute(request: ExecutionRequest, url: string) {
		requestUrl = url;
		requestedFormat = request.outputs[Object.keys(request.outputs)[0]].format;

		let resp = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(request),
			headers: {
				'Content-Type': 'application/json; charset=UTF-8'
			}
		});

		handleResponse(resp);
	}

	async function handleResponse(executeResponse: Response) {
		if (executeResponse.status != 201 || !executeResponse.headers.get('location')) {
			console.error('Invalid response: Expected HTTP 201');
			return;
		}

		let statusLink = executeResponse.headers.get('location');
		if (!statusLink) {
			console.error('Missing location header');
			return;
		}

		try {
			statusJson = await executeResponse.json();
		} catch (e) {
			if (e instanceof SyntaxError) {
				console.error('Error parsing JSON response: Syntax Error.');
			} else {
				console.error('Error parsing JSON response.');
			}

			return;
		}

		if (!statusJson) {
			return;
		}

		jobId = statusJson.jobID;

		let result = poll(
			async () => {
				// Main Loop
				try {
					return await fetch(statusLink);
				} catch (error) {
					console.log(error);
				}
			},
			async (statusResponse: Response) => {
				// Validation Function
				if (statusResponse.status != 204 || !statusResponse.headers.get('link')) {
					// TODO: Error
				}

				try {
					const json = await statusResponse.json();
					statusJson = json;
					processSuccessful = json.status == 'successful';
					return json.status != 'accepted' && json.status != 'running';
				} catch (error) {
					return console.error(error);
				}
			},
			5000 // Loop every 5 seconds
		);

		stopPoller = result.cancelFunction;
		await result.result;

		// Find all result links before attempting to filter on language.
		let resultEndpoints = statusJson.links?.filter(
			(link: Link) =>
				link.hasOwnProperty('rel') &&
				(link.rel == 'http://www.opengis.net/def/rel/ogc/1.0/results' || link.rel == 'result')
		);

		if (resultEndpoints == undefined) {
			console.error('Invalid response: No result link found');
			return;
		}

		let resultEndpoint = resultEndpoints?.find(
			(link: Link) => link.hasOwnProperty('hreflang') && $page.data.lang.search(link.hreflang) != -1
		)?.href;

		if (resultEndpoint == undefined) resultEndpoint = resultEndpoints[0].href;

		if (resultEndpoint == undefined) {
			console.error('Invalid response: No result link found');
			return;
		}

		let resultResponse = await fetch(resultEndpoint);
		if (resultResponse.status != 204) {
			console.error('Invalid response: Expected HTTP 204');
		} else if (!resultResponse.headers.get('link')) {
			console.error('Invalid response: Expected HTTP 201');
		}

		let link = resultResponse.headers
			.get('link')
			?.split(',')
			.find((link) => link.includes('; rel="result"'))
			?.split(';')[0];

		if (!link) {
			console.error('Invalid response: No valid result url found in link header.');
		} else {
			resultUrl = link?.substring(1, link.length - 1);
		}

		map?.reload();
	}

	/************* Handlers ***************/
	function handleCloseButtonClick(event: Event) {
		mapVisible = false;
	}

	function closeModal() {
		active = false;
		toggleScroll(active);
		stopPoller?.();

		jobId = undefined;
		resultUrl = undefined;
		stopPoller = undefined;
		processSuccessful = false;

		map = undefined;

		statusJson = {
			jobID: '',
			status: '',
			type: ''
		};

		mapVisible = false;
		requestedFormat = '';
	}
</script>

<!-- Note: we need the z-index to be 100020 so that it is above the header and the map loading mask (geoview has this set at 99999) -->
<div
	class={[
		'fixed flex justify-center z-[100020] inset-0 bg-custom-7/75 overflow-y-scroll hide-scroll pb-4',
		!active && 'hidden'
	]}
>
	<div
		class="md:grid md:grid-cols-6 bg-custom-1 border border-custom-21 w-full md:w-2/3 h-fit md:mt-2 m-5 md:m-0"
	>
		<div
			id="page1"
			class={[
				'col-span-6 flex flex-col gap-5 px-5 pb-5 pt-8 font-custom-style-body-1',
				mapVisible && 'hidden'
			]}
		>
			<Description />
			<Metadata bind:status={statusJson} />
			{#if requestedFormat === 'application/geo+json'}
				<MapPreview bind:status={statusJson} bind:resultUrl bind:this={map} />
			{/if}
		</div>
		<div
			id="bottom-buttons"
			class="grid grid-cols-1 md:grid-cols-2 col-span-6 bg-custom-5 md:border-t border-custom-21 px-5 py-7 md:py-[1.125rem] gap-y-8"
		>
			<div>
				<div style="position: relative; display: inline-block;">
					<a
						href={resultUrl}
						class="row-start-1 md:row-start-2 w-auto md:w-auto justify-self-start h-12 md:h-auto {resultUrl
							? 'button-3'
							: 'button-3-disabled'}"
					>
						{t['download']}
					</a>
					{#if !processSuccessful}
						<!-- Add a mask over the link so that the cursor does not appear differently than that of a button -->
						<div style="height:100%; width:100%; position:absolute; top:0; left:0;"></div>
					{/if}
				</div>
			</div>
			<button
				class="w-full md:w-auto justify-self-end button-5 h-12 md:h-auto shadow-[0rem_0.1875rem_0.375rem_#00000029]"
				onclick={closeModal}>{t['close']}</button
			>
		</div>
	</div>
</div>

<style>
	.hide-scroll {
		-ms-overflow-style: none; /* Edge */
		scrollbar-width: none; /* Firefox */
	}

	.hide-scroll::-webkit-scrollbar {
		@apply hidden; /* Chrome */
	}
</style>
