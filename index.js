const express = require('express');
const cors = require('cors');
const mainRouter = require('./routes/index');
const PORT = 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/v1', mainRouter);

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
})