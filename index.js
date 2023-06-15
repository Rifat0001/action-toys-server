const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rsztvpo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // for insert data in mongodb database 
        const toyCollection = client.db('actionToy').collection('toys');

        const indexKeys = { name: 1, category: 1 };
        const indexOptions = { name: "nameCategory" };
        const result = await toyCollection.createIndex(indexKeys, indexOptions);
        app.get('/toySearchBy/:text', async (req, res) => {
            const searchText = req.params.text;
            const result = await toyCollection.find({
                $or: [
                    { name: { $regex: searchText, $options: 'i' } },
                    { category: { $regex: searchText, $options: 'i' } }
                ],

            })
                .toArray();
            res.send(result)
        })

        // for  find any specific toy by id 
        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result);
        })

        // get toy by category list
        app.get('/allToy/:text', async (req, res) => {
            if (
                req.params.text == "Marvel" ||
                req.params.text == "Transformers" ||
                req.params.text == "StarWar"
            ) {
                const result = await toyCollection.find({ category: req.params.text }).toArray();
                return res.send(result);
            }
            const result = await toyCollection.find({}).toArray();
            res.send(result)
        });



        // find data for my toys page with user email 
        app.get('/myToys/:email', async (req, res) => {
            console.log(req.params.email);
            const result = await toyCollection.find({ email: req.params.email }).toArray();
            console.log(result)
            res.send(result);
        })

        // for update any data
        app.put("/myToys/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const toyUpdate = req.body;
            toyUpdate.price = parseFloat(toyUpdate.price);
            const updateDoc = {
                $set: {
                    details: toyUpdate.description,
                    price: toyUpdate.price,
                    quantity: toyUpdate.quantity,
                    name: toyUpdate.toy_name,
                    url: toyUpdate.image,
                    category: toyUpdate.category,
                    ratings: toyUpdate.ratings,
                },
            };
            console.log(toyUpdate);
            const result = await toyCollection.updateOne(filter, updateDoc);
            res.send(result);
        });




        // delete
        app.delete("/myToys/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        });

        // to show mongodb data in localhost5000 server 
        app.get('/toy', async (req, res) => {
            const cursor = toyCollection.find();

            const result = await cursor.toArray();
            res.send(result);
        })

        // to send add toys in server 
        app.post('/toy', async (req, res) => {
            const newToy = req.body;
            console.log(newToy)

            // for send in mongodb / its next step to insert data 
            const result = await toyCollection.insertOne(newToy);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



// this will show on the localhost:5000 
app.get('/', (req, res) => {
    res.send('action toys are fighting')
})

// this will show on the cmd 
app.listen(port, () => {
    console.log(`Action toys are running : ${port}`)
})