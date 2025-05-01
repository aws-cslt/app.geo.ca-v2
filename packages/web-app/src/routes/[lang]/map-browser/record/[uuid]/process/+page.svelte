<script lang="ts">
	import type { PageProps } from './$types';
	import Input from '$lib/components/processes/input.svelte';
	import ProcessModal from '$lib/components/processes/process-modal.svelte';
	import { toggleScroll } from '$lib/components/component-utils/toggleScroll';

	let { data }: PageProps = $props();

	const t = data.t;
	const process: ProcessDescription = data.svcDef;

	// The available Input and Output options for this process
	const inputs: Record<string, InputDescription> | undefined = process.inputs;
	const outputs: Record<string, OutputDescription> | undefined = process.outputs;

	// URL to the 'execute' endpoint of the process API.
	const executionLink: string | undefined = process.links?.find(
		(link: Link) => link.rel === 'http://www.opengis.net/def/rel/ogc/1.0/execute'
	)?.href;

	const executionRequest: ExecutionRequest = $state({
		inputs: {},
		outputs: {},
		response: 'raw'
	});

	let selectedOutput: string | undefined = $state();
	if (outputs) {
		selectedOutput = Object.keys(outputs)[0];
	}

	// The UI elements that represent all process inputs
	let inputElements: Record<string, Input> = $state({});

	// Status/Result pop-up window
	let modal: ProcessModal = $state();
	let modalActive: boolean = $state(false);

	/**
	 * Builds the ExecutionRequest and submits it to the process for execution
	 */
	function submit() {
		if (!inputs || !outputs) {
			console.error('Cannot submit request: No inputs and/or outputs are defined.');
			return;
		}

		if (!selectedOutput) {
			console.error('Cannot submit request: No output format was selected.');
			return;
		}

		if (!executionLink) {
			console.error('Cannot submit request: No execution link found.');
			return;
		}

		modalActive = true;
		toggleScroll(true);

		let keys = Object.keys(inputs);
		for (let i = 0; i < keys.length; i++) {
			executionRequest.inputs[keys[i]] = inputElements[keys[i]].getValue();
		}

		executionRequest.outputs = {};
		executionRequest.outputs[selectedOutput] = {
			transmissionMode: 'value',
			format: `${outputs[selectedOutput].schema.contentMediaType}`
		};

		modal.execute(executionRequest, executionLink);
	}

	/**
	 * Reset all input and output fields to their default values.
	 */
	function resetAll() {
		for (let inputElement in inputElements) {
			inputElements[inputElement].reset();
		}

		if (outputs) {
			selectedOutput = Object.keys(outputs)[0];
		}
	}
</script>

<div class="flex flex-col gap-4">
	<h1 class="font-custom-style-h1">{process.title}</h1>
	<h4>{process.description}</h4>

	{#if inputs}
		<h2 class="font-custom-style-h2">{t['input']}</h2>
		<div class="relative flex flex-col gap-4 mb-2 mt-[-0.75em] font-open-sans px-5 md:px-0">
			{#each Object.keys(inputs) as input}
				<Input name={input} definition={inputs[input]} bind:this={inputElements[input]} />
			{/each}
		</div>
	{/if}

	{#if outputs}
		<h2 class="font-custom-style-h2">{t['output']}</h2>
		<div class="relative flex flex-col gap-4 mb-2 mt-[-0.75em] font-open-sans px-5 md:px-0">
			{#each Object.keys(outputs) as output}
				<!-- <div class="flex flex-col gap-2 font-open-sans px-5 md:px-0"> -->
				<div>
					<input
						type="radio"
						id={output}
						value={output}
						name="output"
						bind:group={selectedOutput}
					/>
					<label for={output} class="font-custom-style-h3">{outputs[output].title} ({output})</label>
					<p>{outputs[output].description}</p>
				</div>
			{/each}
		</div>
	{/if}

	<div
		class="grid grid-cols-1 md:grid-cols-2 col-span-6 bg-custom-5 md:border-t border-custom-21 px-5 py-7 md:py-[1.125rem] gap-y-8"
	>
		<button
			type="button"
			class="row-start-2 md:row-start-1 w-full md:w-auto justify-self-start button-3 h-12 md:h-auto"
			onclick={resetAll}>{t['reset']}</button
		>
		<button
			class="w-full md:w-auto justify-self-end button-5 h-12 md:h-auto shadow-[0rem_0.1875rem_0.375rem_#00000029]"
			onclick={submit}>{t['execute']}</button
		>
	</div>
</div>
<ProcessModal bind:active={modalActive} bind:this={modal} />
