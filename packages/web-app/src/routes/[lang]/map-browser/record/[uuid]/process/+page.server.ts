import type { PageServerLoad } from './$types';
import { getRecord } from '$lib/db/record.ts';
import enLabels from '$lib/components/processes/i18n/en/translations.json';
import frLabels from '$lib/components/processes/i18n/fr/translations.json';

export const load: PageServerLoad = async ({ fetch, params, url, cookies }) => {

	let record;
	let features;
	let properties;
	let options: Array<object>;

	let svcDef;
	let en: boolean = params.lang == 'en-ca';

	try {
		record = await getRecord(params.uuid);
		features = record?.features[0];
		properties = features?.properties;
		options = properties?.options;

		let serviceUrl: string | undefined;

		if (options) {
			for (const option of options) {
				if (option.description?.en == `API;JSON;${en ? 'eng' : 'fra'}`) {
					serviceUrl = option.url;
					break;
				}
			}
		}

		if (serviceUrl) {
			const response = await fetch(serviceUrl)
			if (!response.ok) {
				console.warn('Invalid response from Process API', response);
				throw new Error('Invalid response from Process API');
			}

			try {
				svcDef = await response.json();
			} catch (e) {
				console.warn('Invalid response from Process API', e);
				throw new Error('Invalid response from Process API');
			}
		}
	} catch (e) {
		console.warn('error fetching record for microdata:\n', e);
	}

	let t = params.lang == 'en-ca' ? enLabels : frLabels;

	return {
		t_title_1: {
			text:
				params.lang == 'en-ca' ? 'Geospatial Data Catalog' : 'Catalogue de données géospatiales',
			href: url.origin + '/' + params.lang + '/map-browser'
		},
		t_title_2: {
			text: params.lang == 'en-ca' ? 'Metadata' : 'Métadonnées',
			href: url.origin + '/' + params.lang + '/map-browser/record/' + params.uuid
		},
		t_title_3: {
			text: params.lang == 'en-ca' ? 'Process' : 'Processus',
			href: url.href
		},
		lang: params.lang,
		uuid: params.uuid,
		svcDef: svcDef,
		t: t
	}
};
