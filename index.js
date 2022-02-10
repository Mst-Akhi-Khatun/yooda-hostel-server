const express = require("express");
const cors = require("cors");
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oxzfl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const usersCollection = client.db("yoodaHostel").collection("users");
    const foodCollection = client.db("yoodaHostel").collection("foods");
    const studentCollection = client.db("yoodaHostel").collection("students");
    // save user
    app.post('/user', async (req, res) => {
        const user = await usersCollection.insertOne(req.body)
        res.send(user)
    })

    // get an admin
    app.get('/saveUser/:email', async (req, res) => {
        const email = req.params.email;
        const result = await usersCollection.findOne({ email: email });
        let isAdmin = false;
        if (result?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    })

    app.post('/addFood', async (req, res) => {
        const newItem = await foodCollection.insertOne(req.body);
        res.json(newItem);
    })

    app.get('/allFoods', async (req, res) => {
        let { page, size } = req.query;
        if (!page) {
            page = 1
        }
        if (!size) {
            size = 5
        }
        const count = await foodCollection.find({}).count();
        console.log(count);
        const limit = parseInt(size)
        const skip = page * size;
        const result = await foodCollection.find({}, { limit: limit, skip: skip }).toArray();
        res.send({
            count,
            result
        });
    })

    app.post('/addStudent', async (req, res) => {
        const student = await studentCollection.insertOne(req.body);
        res.json(student);
    })

    // get all Students
    app.get('/allStudent', async (req, res) => {
        let { page, size } = req.query;
        if (!page) {
            page = 1
        }
        if (!size) {
            size = 5
        }
        const count = await studentCollection.find({}).count();
        const limit = parseInt(size)
        const skip = page * size;
        const result = await studentCollection.find({}, { limit: limit, skip: skip }).toArray();
        res.send({
            count,
            result
        });
    })
    // status update
    app.put("/allStudents/:id", async (req, res) => {
        const id = req.params.id;
        const updateStatus = req.body;
        const filter = { _id: ObjectId(id) };
        const updateDoc = {
            $set: {
                status: updateStatus.status,
            },
        };
        const result = await studentCollection.updateOne(
            filter,
            updateDoc,
        );
        res.json(result);
    });

    app.put("/student/:id", async (req, res) => {
        const id = req.params.id;
        const updateBody = req.body;
        const filter = { _id: ObjectId(id) };
        const updateDoc = {
            $set: {
                foodStatus: updateBody.foodStatus,
                shift: updateBody.shift,
                date: updateBody.date,
            },
        };
        const result = await studentCollection.updateOne(
            filter,
            updateDoc,
        );
        res.json(result);
    });
    //remove order
    app.delete('/removeStudent/:id', async (req, res) => {
        const id = req.params.id;
        const result = await studentCollection.deleteOne({ _id: ObjectId(id) });
        res.json(result);
    })

    app.get('/studentInfo/:id', async (req, res) => {
        const id = req.params.id;
        const result = await studentCollection.findOne({ _id: ObjectId(id) });
        res.json(result);
    })
    // perform actions on the collection object
    //   client.close();
});


app.get("/", (req, res) => {
    res.send("Getting successfully");
});

app.listen(port, () => {
    console.log("listening on port", port);
});


// user= yoodaHostelUser
// pass= 5KvU3MU5ml5ZlY63