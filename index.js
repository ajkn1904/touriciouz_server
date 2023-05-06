require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');



const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7splzic.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){

    await client.connect();
    const packagesCollection = client.db('touriciouz').collection('packages');




    try{

        app.get('/packages', async (req, res) => {
            const query = {}
            const result = await packagesCollection.find(query).toArray()
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(console.log);





app.get('/', (req, res) => {
    res.send('Touriciouz API running!');
});

app.listen(port, () => {
    console.log('Touriciouz Server running on port', port)
})