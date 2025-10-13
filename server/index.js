const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send("Zero's Server is running....");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});