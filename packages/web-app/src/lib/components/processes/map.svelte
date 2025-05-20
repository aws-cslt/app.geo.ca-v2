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

					if (points.geoViewLayerConfig) {
						points.geoViewLayerConfig.layerId = 'blank_layer.json';
						resultsLayer.listOfLayerEntryConfig.push(points.geoViewLayerConfig);

						delete points.geoViewLayerConfig;
					}

					async function addLayerToMap(sender: any, event: any) {
						if (event.mapId === mapId) {
							let addedResult = cgpv.api.getMapViewer(mapId).layer.addGeoviewLayer(resultsLayer);

							if (addedResult) {
								addedResult.promiseLayer.then(() => {
									cgpv.api.getMapViewer(mapId).layer
									    .getGeoviewLayer('process-results/blank_layer.json')
										.setGeojsonSource(points);

									const extent = cgpv.api.getMapViewer(mapId).layer.getExtentOfMultipleLayers();
									cgpv.api.getMapViewer(mapId).zoomToExtent(extent);
								});

								loaded = true;
							}
						}
					}

					// Remove any old copies of the map
					try {
						console.debug('Removing old instances of map with id ' + mapId);
						cgpv.api.getMapViewer(mapId)?.remove(true);
					} catch (e) {
						console.debug('No map found...');
					}

					cgpv.api.onMapAddedToDiv(addLayerToMap);
					cgpv.api.createMapFromConfig(mapId, sConfig);
				});
		}
	}
</script>

<svelte:head>
	<script src="https://canadian-geospatial-platform.github.io/geoview/public/cgpv-main.js"></script>
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
