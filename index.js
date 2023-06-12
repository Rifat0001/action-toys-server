const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// this will show on the localhost:5000 
app.get('/', (req, res) => {
    res.send('action toys are fighting')
})

// this will show on the cmd 
app.listen(port, () => {
    console.log(`Action toys are running : ${port}`)
})