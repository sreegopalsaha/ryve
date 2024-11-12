const express = require("express");
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3000;
app.get("/", (req, res)=>{
    res.send("hello from the server");
});

app.listen(PORT, ()=>{
    console.log("App is running on", PORT);
});