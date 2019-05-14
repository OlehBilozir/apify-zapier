const { APIFY_API_ENDPOINTS } = require('../consts');
const { wrapRequestWithRetries } = require('../request_helpers');
const { getOrCreateKeyValueStore } = require('../apify_helpers');

const setValue = async (z, bundle) => {
    const { storeIdOrName, key, value } = bundle.inputData;
    const store = await getOrCreateKeyValueStore(z, storeIdOrName);
    const keyValueStoreValueUrl = `${APIFY_API_ENDPOINTS.keyValueStores}/${store.id}/records/${key}`;

    let valueObject;
    try {
        valueObject = JSON.parse(value);
    } catch (err) {
        throw new Error(`Cannot parse the value as JSON: ${err.message}`);
    }

    await wrapRequestWithRetries(z.request, {
        url: keyValueStoreValueUrl,
        method: 'PUT',
        json: valueObject,
    });

    return {
        keyValueStore: store,
        keyValueStoreValueUrl,
    };
};

module.exports = {
    key: 'keyValueStoreSetValue',
    noun: 'Key-Value Store Value',
    display: {
        label: 'Set Key-Value Store Record',
        description: 'Save a record to a key-value store.',
    },

    operation: {
        inputFields: [
            {
                label: 'Key-value store',
                // TODO: We need to make sure if user enters ID, we don't create a named store with that ID.
                // That can be checked with regex
                helpText: 'Please enter name or ID of the key-value store. If the store with the name doesn\'t exist, it will be created.',
                key: 'storeIdOrName',
                required: true,
            },
            {
                label: 'Record key',
                key: 'key',
                required: true,
                type: 'string',
            },
            {
                label: 'Record value',
                helpText: 'Please enter a JSON value. The record will have `Content-Type: application/json`.',
                key: 'value',
                required: true,
                type: 'text',
                default: '{}',
            },
        ],

        perform: setValue,
    },
};