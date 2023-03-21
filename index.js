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
		const usersCollection = client.db('docService').collection('users');

		app.post("/users", async (req, res) => { 
			const user = req.body;
			const query = { email: user.email };
			console.log("🚀 ~ file: index.js:33 ~ app.post ~ user:", user)
			const alreadyExits = await usersCollection.findOne(query);
			if (alreadyExits) {
				res.send(JSON.stringify({ message: 'Already Exits' }));
				return;
			}
			const result = await usersCollection.insertOne(user);
			res.send(result)
		})

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
		app.post("/services", async (req, res) => {
			const result = await serviceCollection.insertOne(req.body);
			res.send(result);
		});
		app.post("/review", async (req, res) => {
			const body = req.body;
			const result = await reviewCollection.insertOne(body);
			res.send(result);
		});
		app.get("/reviews", async (req, res) => {
			const email = req.query.email;
			let query = {};
			if (query) {
				query = { email: email };
			}
			const cursor = reviewCollection.find(query);
			const reviews = await cursor.toArray();
			res.send(reviews);
		});

		app.get("/singlereview", async (req, res) => {
			const id = req.query.id;
			let query = {};
			if (query) {
				query = { service: id };
			}
			const result = await reviewCollection
				.find(query)
				.sort({ date: -1 })
				.toArray();
			res.send(result);
		});
		app.get('/totalDoc', async (req, res) => { 
const user = await usersCollection.countDocuments()
const review = await reviewCollection.countDocuments()
			const service = await serviceCollection.countDocuments()
			res.send({user, review, service});
		})

		app.put("/updatereview/:id", async (req, res) => {
			const id = req.params.id;
			const filter = { _id: ObjectId(id)};
			const myRating = req.body.myRating;
			const message = req.body.message;
			const reviewLength = req.body.reviewLength;
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					myRating,
					message,
					reviewLength,
				},
			};
			const result = await reviewCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			const service = await serviceCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.send({result,service});
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
