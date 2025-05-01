<script lang="ts">
	import { page } from '$app/stores';

	import './process-schema.ts';

	const translations = $page.data.t;
	const mapPreviewtext = translations?.mapPreview ? translations['mapPreview'] : 'Map Preview';
	const windowTooSmall = translations?.windowTooSmall ? translations['windowTooSmall'] : '';

	/************ Map Config ************/

	const mapId = 'process-results';
	const interactionType = 'dynamic';
	const mapLang = $page.data.lang == 'fr-ca' ? 'fr' : 'en';

	const basemapId = 'transport';
	const shaded = true;
	const labeled = true;

	const mapProjection = 3857;
	const center = [-100, 68];
	const zoom = 5;
	const maxExtent = [-180, -90, 180, 90];

	let loaded: boolean = false;

	interface Props {
		status: JobStatus;
		resultUrl: string | undefined;
	}

	let { status = $bindable(), resultUrl = $bindable() }: Props = $props();

	let t = $page.data.t;

	let config = $state({
		map: {
			interaction: interactionType,
			viewSettings: {
				initialView: {
					zoomAndCenter: [zoom, center]
				},
				maxExtent: maxExtent,
				projection: mapProjection
			},
			basemapOptions: {
				basemapId: basemapId,
				shaded: shaded,
				labeled: labeled
			}
		},
		navBar: ['zoom', 'home'],
		components: ['overview-map'],
		overviewMap: {
			hideOnZoom: 5
		},
		corePackages: [],
		appBar: {
			tabs: {
				core: ['legend']
			},
			collapsed: true
		}
	});

	const sConfig = JSON.stringify(config);

	export function reload() {
		if (resultUrl != undefined && !loaded) {
			fetch(resultUrl)
				.then((response) => response.json())
				.then((points) => {
					let resultsLayer = {
						geoviewLayerId: 'process-results',
						geoviewLayerName: 'OGC API Process Results',
						metadataAccessPath: '/blank_layer.meta',
						geoviewLayerType: 'GeoJSON',
						listOfLayerEntryConfig: []
					};

					console.error(JSON.stringify(resultsLayer));

					if (points.geoViewLayerConfig) {
						(points.geoViewLayerConfig.layerId = 'blank_layer.json'),
							console.error(JSON.stringify(points.geoViewLayerConfig));
						resultsLayer.listOfLayerEntryConfig.push(points.geoViewLayerConfig);
						console.error(JSON.stringify(resultsLayer));

						delete points.geoViewLayerConfig;
						console.log(points);
					}

					async function addLayerToMap(sender: any, event: any) {
						if (event.mapId === 'process-results') {
							let addedResult =
								cgpv.api.maps['process-results'].layer.addGeoviewLayer(resultsLayer);

							if (addedResult) {
								addedResult.promiseLayer.then(() => {
									cgpv.api.maps['process-results'].layer
										.getGeoviewLayer('process-results/blank_layer.json')
										.overrideGeojsonSource(points);

									const extent = cgpv.api.maps['process-results'].layer.getExtentOfMultipleLayers();
									cgpv.api.maps['process-results'].zoomToExtent(extent);
								});

								loaded = true;
							}
						}
					}

					// Remove any old copies of the map
					cgpv.api.maps[mapId]?.remove(true);

					cgpv.api.onMapAddedToDiv(addLayerToMap);
					cgpv.api.createMapFromConfig('process-results', sConfig);
				});
		}
	}
</script>

<svelte:head>
	<!-- TODO: switch back to old link after geoview pull request with modifyDragged event accepted -->
	<!-- <script src="https://lbercovitch.github.io/geoview-leah/cgpv-main.js"></script> -->
	<script src="http://10.1.4.228:8080/cgpv-main.js"></script>
	<!--<script src="https://canadian-geospatial-platform.github.io/geoview/public/cgpv-main.js"></script>-->
</svelte:head>

<div class="w-full">
	<h2 class="font-custom-style-h2 mb-1 mx-5 md:mx-0">
		{mapPreviewtext}
	</h2>
	<div
		id={mapId}
		class="bg-blue-500/5 w-full h-64 md:h-80 lg:h-96 xl:h-[28rem] 2xl:h-[32rem]"
		data-config={sConfig}
		data-lang={mapLang}
	></div>
</div>
