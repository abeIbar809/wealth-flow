import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import userrouter from "./routes/users.js"

const app = express();

mongoose.connect(process.env.MONGO_URI);
const con = mongoose.connection;

try{
  con.on('open', ()=>{
    console.log('Connected to the database');
  })
} catch (error) {
  console.log("Error: " + error);
}

const port = 9000;
app.listen(port, ()=>{
  console.log("Listening on Port: " + port);
});

app.use(express.json());

//Server demo
app.get("/backend-test", async (req, res) => {
  try {
    // 1. SIMPLE SERVER CHECK
    console.log("Backend test started.");

    // 2. TEMP TEST MODEL (not part of your real schema)
    const TestModel = mongoose.model(
      "TestBackend",
      new mongoose.Schema({ message: String }),
      "test_backend_collection"
    );

    // 3. WRITE SAMPLE DATA
    const created = await TestModel.create({
      message: "Hello from backend test!"
    });

    // 4. READ EVERYTHING BACK
    const allDocs = await TestModel.find();

    // 5. RETURN SUMMARY
    return res.json({
      server: "OK",
      dbWrite: created,
      dbRead: allDocs,
    });
  } catch (err) {
    console.error("Backend test error:", err);
    return res.status(500).json({ error: err.message });
  }
});


app.use('/users', userrouter);