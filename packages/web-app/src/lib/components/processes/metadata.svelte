<script lang="ts">
	import Card from '$lib/components/card/card.svelte';
	import ProgressBar from '$lib/components/progress-bar/progress-bar.svelte';

	import { page } from '$app/stores';
	import './process-schema.ts';

	interface Props {
		status: JobStatus;
	}

	let { status = $bindable() }: Props = $props();

	let t = $page.data.t;
</script>

<div class="w-full">
	<h2 class="font-custom-style-h2 mb-1 mx-5 md:mx-0">
		{t['status']}
	</h2>
	<p class="mx-5 md:mx-0 mb-5">{t['jobStatusIntro']}</p>
	<Card>
		<div class="card-div flex flex-col lg:flex-row lg:space-x-3 justify-between">
			<div class="top-table flex flex-col min-w-[20%]">
				<h3 class="pb-1 w-full font-semibold">{t['createdOn']}</h3>
				<p class="w-full text-left">{status.created ? status.created : '\xa0'}</p>
			</div>
			<div class="top-table flex flex-col min-w-[20%]">
				<h3 class="pb-1 w-full font-semibold">{t['startedOn']}</h3>
				<p class="w-full text-left">{status.started ? status.started : '\xa0'}</p>
			</div>
			<div class="top-table flex flex-col min-w-[20%]">
				<h3 class="pb-1 w-full font-semibold">{t['updatedOn']}</h3>
				<p class="w-full text-left">{status.updated ? status.updated : '\xa0'}</p>
			</div>
			<div class="top-table flex flex-col min-w-[20%]">
				<h3 class="pb-1 w-full font-semibold">{t['finishedOn']}</h3>
				<p class="w-full text-left">{status.finished ? status.finished : '\xa0'}</p>
			</div>
		</div>
		<div class="card-div flex flex-col lg:flex-row lg:space-x-3 justify-between">
			<div class="top-table flex flex-col min-w-[50%]">
				<h3 class="font-semibold">{t['status']}</h3>
				<p>{status.status ? t[`${status.status}`] : t['submitted']}</p>
			</div>
			<div class="top-table flex flex-col min-w-[50%]">
				<h3 class="font-semibold">{t['message']}</h3>
				<p>{status.message ? status.message : t['submitting']}</p>
			</div>
		</div>
		<div class="card-div">
			<h3 class="font-semibold">{t['progress']}</h3>
			<ProgressBar
				bind:error={() => status.status == 'failed', (v) => {}}
				bind:progress={() => (status.progress ? status.progress : 0), (v) => {}}
			/>
		</div>
	</Card>
</div>

<style>
	.card-div {
		@apply bg-custom-1;
		@apply p-5;
	}

	@media (max-width: 63.9375rem) {
		.top-table:not(:first-child) {
			padding-top: 0.5rem;
		}

		.top-table:not(:last-child) {
			padding-bottom: 0.5rem;
		}
	}
</style>
