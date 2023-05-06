require('dotenv').config();
const express = require('express');


const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send('Touriciouz API running!');
});

app.listen(port, () => {
    console.log('Touriciouz Server running on port', port)
})