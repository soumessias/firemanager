document.addEventListener('DOMContentLoaded', () => {
    const duplicateForm = document.getElementById('duplicate-form');
    const queryForm = document.getElementById('query-form');
    const deleteForm = document.getElementById('delete-form');
    const results = document.getElementById('results');

    const duplicateCollectionSelect = document.getElementById('duplicate-collection');
    const queryCollectionSelect = document.getElementById('query-collection');
    const getCollectionNameSelect = document.getElementById('get-collection-name');
    const deleteCollectionSelect = document.getElementById('delete-collection');

    async function fetchCollectionsAndPopulateDropdowns() {
        try {
            const response = await fetch('/api/listCollections');
            const collections = await response.json();

            const dropdowns = [
                duplicateCollectionSelect,
                queryCollectionSelect,
                getCollectionNameSelect,
                deleteCollectionSelect
            ];

            dropdowns.forEach(dropdown => {
                dropdown.innerHTML = '<option value="">-- Select Collection --</option>'; // Clear existing options
                collections.forEach(collection => {
                    const option = document.createElement('option');
                    option.value = collection;
                    option.textContent = collection;
                    dropdown.appendChild(option);
                });
            });

            // Store fetched collections data for client-side field/document ID extraction
            window.collectionsData = {};
            for (const collectionName of collections) {
                const res = await fetch('/api/getCollection', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ collection: collectionName })
                });
                const docs = await res.json();
                window.collectionsData[collectionName] = docs;
            }

            // Populate fields and document IDs for initially selected collections
            populateFieldsAndDocumentIds();

        } catch (error) {
            console.error('Error fetching collections:', error);
            results.textContent = `Error fetching collections: ${error.message}`;
        }
    }

    fetchCollectionsAndPopulateDropdowns();

    const queryFieldSelect = document.getElementById('query-field');
    const deleteFieldSelect = document.getElementById('delete-field');
    const duplicateIdSelect = document.getElementById('duplicate-id');

    function populateFieldsAndDocumentIds() {
        // Populate fields for query and delete forms
        const queryCollectionName = queryCollectionSelect.value;
        const deleteCollectionName = deleteCollectionSelect.value;
        const duplicateCollectionName = duplicateCollectionSelect.value;

        populateDropdown(queryFieldSelect, getUniqueFields(queryCollectionName), '-- Select Field --');
        populateDropdown(deleteFieldSelect, getUniqueFields(deleteCollectionName), '-- Select Field --');
        populateDropdown(duplicateIdSelect, getDocumentIds(duplicateCollectionName), '-- Select Document ID --');
    }

    function getUniqueFields(collectionName) {
        const fields = new Set();
        if (window.collectionsData && window.collectionsData[collectionName]) {
            window.collectionsData[collectionName].forEach(doc => {
                Object.keys(doc).forEach(field => fields.add(field));
            });
        }
        return Array.from(fields);
    }

    function getDocumentIds(collectionName) {
        const ids = [];
        if (window.collectionsData && window.collectionsData[collectionName]) {
            window.collectionsData[collectionName].forEach(doc => {
                if (doc.id) {
                    ids.push(doc.id);
                }
            });
        }
        return ids;
    }

    function getDocumentIds(collectionName) {
        const ids = [];
        if (window.collectionsData && window.collectionsData[collectionName]) {
            window.collectionsData[collectionName].forEach(doc => {
                if (doc.id) {
                    ids.push(doc.id);
                }
            });
        }
        return ids;
    }

    function populateDropdown(dropdownElement, items, defaultText) {
        dropdownElement.innerHTML = `<option value="">${defaultText}</option>`;
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            dropdownElement.appendChild(option);
        });
    }

    function displayResults(data) {
        if (Array.isArray(data) && data.length > 0) {
            displayResultsAsTable(data);
        } else if (typeof data === 'object' && data !== null) {
            // If it's a single object (e.g., {id: "..."} from create/duplicate/delete count)
            results.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        } else {
            results.innerHTML = '<pre>No results or unexpected format.</pre>';
        }
    }

    function displayResultsAsTable(data) {
        if (!Array.isArray(data) || data.length === 0) {
            results.innerHTML = '<pre>No documents found.</pre>';
            return;
        }

        const allKeys = new Set();
        data.forEach(doc => {
            Object.keys(doc).forEach(key => allKeys.add(key));
        });

        const headers = Array.from(allKeys);
        let tableHtml = '<table><thead><tr>';
        headers.forEach(header => {
            tableHtml += `<th>${header}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';

        data.forEach(doc => {
            tableHtml += '<tr>';
            headers.forEach(header => {
                const value = doc[header];
                tableHtml += `<td>${JSON.stringify(value)}</td>`;
            });
            tableHtml += '</tr>';
        });

        tableHtml += '</tbody></table>';
        results.innerHTML = tableHtml;
    }

    queryCollectionSelect.addEventListener('change', populateFieldsAndDocumentIds);
    deleteCollectionSelect.addEventListener('change', populateFieldsAndDocumentIds);
    duplicateCollectionSelect.addEventListener('change', populateFieldsAndDocumentIds);

    duplicateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const collection = duplicateCollectionSelect.value;
        const id = duplicateIdSelect.value;
        const newId = document.getElementById('new-duplicate-id').value.trim();
        console.log('Frontend newId:', newId);

        const body = { collection, id };
        if (newId) {
            body.newId = newId;
        }

        const response = await fetch('/api/duplicate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const result = await response.json();
        displayResults(result);
    });

    queryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const collection = queryCollectionSelect.value;
        const field = queryFieldSelect.value;
        const operator = document.getElementById('query-operator').value;
        const value = document.getElementById('query-value').value;

        const body = { collection };
        if (field && operator && value) {
            body.field = field;
            body.operator = operator;
            body.value = value;
        }

        const response = await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const result = await response.json();
        displayResults(result);
    });

    const getCollectionForm = document.getElementById('get-collection-form');
    getCollectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const collection = getCollectionNameSelect.value;
        const response = await fetch('/api/getCollection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ collection })
        });
        const result = await response.json();
        displayResults(result);
    });

    deleteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const collection = deleteCollectionSelect.value;
        const field = deleteFieldSelect.value;
        const operator = document.getElementById('delete-operator').value;
        const value = document.getElementById('delete-value').value;

        const body = { collection };
        if (field && operator && value) {
            body.field = field;
            body.operator = operator;
            body.value = value;
        }

        const response = await fetch('/api/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const result = await response.json();
        displayResults(result);
        fetchCollectionsAndPopulateDropdowns(); // Refresh dropdowns after deletion
    });
});