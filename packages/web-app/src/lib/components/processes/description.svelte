<script lang="ts">
    import { page } from '$app/stores';

    const process = $page.data.svcDef;
</script>

<div class="w-full">
    <h1 class="font-custom-style-h1 mb-6 mx-5 md:mx-0">{process.title}</h1>
    <p class="font-custom-style-body-1 mx-5 md:mx-0">{process.description}</p>
</div>