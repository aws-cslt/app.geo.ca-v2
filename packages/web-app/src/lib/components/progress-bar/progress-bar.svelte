<script lang="ts">
	interface Props {
		progress: number;
		error: boolean;
	}

	let { progress = $bindable(0), error = $bindable(false) }: Props = $props();

	let bar = $state()
	$effect(() => {
		var elem = document.getElementById('myBar');
		elem.style.width = progress + '%';

		if (error) {
			elem?.classList.add('error');
		} else {
			elem?.classList.remove('error');
		}
	});
</script>

<div id="myProgress">
	<div id="myBar" bind:this={bar}></div>
	<div id="label">{progress}%</div>
</div>

<style>
	#myProgress {
		width: 100%;
		border-width: 2px;
		border-radius: 0.25rem;
		position: relative;
	}

	#myBar {
		width: 0%;
		height: 2rem;
		background-color: #04aa6d;
		text-align: center;
	}

	#myBar.error {
		background-color: #dc3545;
	}

	#label {
		width: 100%;
		line-height: 2rem;
		text-align: center;
		position: absolute;
		left: 0;
		top: 0;
	}
</style>
