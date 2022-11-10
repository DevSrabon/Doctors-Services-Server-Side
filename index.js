const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.send('genius car server is running');
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sajc8ea.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

async function run() {
	try {
		const serviceCollection = client.db('docService').collection('services');
		const reviewCollection = client.db('docService').collection('reviews');

		app.get('/services', async (req, res) => {
			const page = parseInt(req.query.page);
			const size = parseInt(req.query.size);
			const query = {};
			const cursor = serviceCollection.find(query);
			const services = await cursor
				.skip(page * size)
				.limit(size)
				.toArray();
			const count = await serviceCollection.estimatedDocumentCount();
			res.send({ services, count });
		});

		app.get('/services/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const service = await serviceCollection.findOne(query);
			res.send(service);
		});
		app.post('/services', async (req, res) => {
			const result = await serviceCollection.insertOne(req.body);
		});
		app.get('/reviews', async (req, res) => {
			const query = {};
			const cursor = reviewCollection.find(query);
			const reviews = await cursor.toArray();
			res.send(reviews);
		});

		

		app.delete('/reviews/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await reviewCollection.deleteOne(query);
			res.send(result);
		});

	} finally {
	}
}
run();

app.listen(port, () => {
	console.log(`Genius car server running on ${port}`);
});
