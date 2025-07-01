const express = require('express');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

const serviceAccount = require('./credential.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.post('/api/create', async (req, res) => {
    console.log('Received POST request for /api/create', req.body);
    try {
        const { collection, data } = req.body;
        const docRef = await db.collection(collection).add(data);
        console.log(`Document created with ID: ${docRef.id} in collection: ${collection}`);
        res.status(201).send({ id: docRef.id });
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).send({ error: error.message });
    }
});

app.post('/api/duplicate', async (req, res) => {
    console.log('Received POST request for /api/duplicate', req.body);
    try {
        const { collection, id, newId } = req.body;
        console.log('Backend received newId:', newId);
        const doc = await db.collection(collection).doc(id).get();
        if (!doc.exists) {
            console.log(`Document with ID: ${id} not found in collection: ${collection}`);
            return res.status(404).send({ error: 'Document not found' });
        }
        const data = doc.data();
        let newDocRef;
        if (newId) {
            console.log('Using provided newId:', newId);
            newDocRef = db.collection(collection).doc(newId);
            await newDocRef.set(data);
            console.log(`Document duplicated to ID: ${newDocRef.id} in collection: ${collection}`);
        } else {
            console.log('Generating random ID.');
            newDocRef = await db.collection(collection).add(data);
            console.log(`Document duplicated to new random ID: ${newDocRef.id} in collection: ${collection}`);
        }
        res.status(201).send({ id: newDocRef.id });
    } catch (error) {
        console.error('Error duplicating document:', error);
        res.status(500).send({ error: error.message });
    }
});

app.post('/api/query', async (req, res) => {
    console.log('Received POST request for /api/query', req.body);
    try {
        const { collection, field, operator, value } = req.body;
        let queryRef = db.collection(collection);
        console.log(`Querying collection: ${collection}`);
        if (field && operator && value) {
            queryRef = queryRef.where(field, operator, value);
            console.log(`Applying filter: ${field} ${operator} ${value}`);
        }
        const snapshot = await queryRef.get();
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Found ${docs.length} documents.`);
        res.status(200).send(docs);
    } catch (error) {
        console.error('Error querying documents:', error);
        res.status(500).send({ error: error.message });
    }
});

app.post('/api/getCollection', async (req, res) => {
    console.log('Received POST request for /api/getCollection', req.body);
    try {
        const { collection } = req.body;
        console.log(`Fetching all documents from collection: ${collection}`);
        const snapshot = await db.collection(collection).get();
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Found ${docs.length} documents in collection: ${collection}`);
        res.status(200).send(docs);
    } catch (error) {
        console.error('Error getting collection:', error);
        res.status(500).send({ error: error.message });
    }
});

app.post('/api/delete', async (req, res) => {
    console.log('Received POST request for /api/delete', req.body);
    try {
        const { collection, field, operator, value } = req.body;
        let queryRef = db.collection(collection);
        console.log(`Attempting to delete documents from collection: ${collection}`);

        if (field === 'id') {
            if (operator === '==') {
                console.log(`Deleting single document by ID: ${value} from collection: ${collection}`);
                await db.collection(collection).doc(value).delete();
                console.log(`Successfully deleted document with ID: ${value}.`);
                return res.status(200).send({ count: 1 });
            } else if (operator === '!=') {
                console.warn(`Warning: Deleting by ID with '!=' operator is inefficient. Fetching all documents in collection: ${collection} and filtering client-side.`);
                const allDocsSnapshot = await db.collection(collection).get();
                const docsToDelete = allDocsSnapshot.docs.filter(doc => doc.id !== value);

                if (docsToDelete.length === 0) {
                    console.log('No documents found to delete after filtering.');
                    return res.status(200).send({ count: 0 });
                }

                const batch = db.batch();
                docsToDelete.forEach(doc => {
                    console.log(`Adding document ${doc.id} to batch for deletion (id != ${value}).`);
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log(`Successfully deleted ${docsToDelete.length} documents.`);
                return res.status(200).send({ count: docsToDelete.length });
            } else {
                console.error(`Unsupported operator '${operator}' for 'id' field in delete operation.`);
                return res.status(400).send({ error: `Unsupported operator '${operator}' for 'id' field.` });
            }
        } else {
            if (field && operator && value) {
                queryRef = queryRef.where(field, operator, value);
                console.log(`Applying deletion filter: ${field} ${operator} ${value}`);
            }

            const snapshot = await queryRef.get();
            console.log(`Found ${snapshot.size} documents matching criteria for deletion.`);
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                console.log(`Adding document ${doc.id} to batch for deletion.`);
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Successfully deleted ${snapshot.size} documents.`);
            res.status(200).send({ count: snapshot.size });
        }
    } catch (error) {
        console.error('Error deleting documents:', error);
        res.status(500).send({ error: error.message });
    }
});

app.get('/api/listCollections', async (req, res) => {
    console.log('Received GET request for /api/listCollections');
    try {
        const collections = await db.listCollections();
        const collectionIds = collections.map(col => col.id);
        console.log('Collections found:', collectionIds);
        res.status(200).send(collectionIds);
    } catch (error) {
        console.error('Error listing collections:', error);
        res.status(500).send({ error: error.message });
    }
});





const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use(express.static('public'));