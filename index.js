import express, { query } from "express"
import cors from "cors"
import { MongoClient } from "mongodb"

import dotenv from "dotenv";

dotenv.config();

const PORT = 4200;

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URL = process.env.MONGO_URI;

const client = new MongoClient(MONGO_URL);

app.get("/", async (req, res) => {
    res.status(200).send("<h1>Server is started</h1>");
});

app.post("/registration", async (req, res) => {
    const { name, age, email, password } = req.body;
    console.log(email)

    const checkUser = await client
        .db("signup_login")
        .collection("registration")
        .findOne({ email: email })
    // .toArray()
    // checkUser.email == data.email
    if (checkUser) {
        res.status(400).send("User already exists");
    } else {
        const result = await client
            .db("signup_login")
            .collection("registration")
            .insertOne({ "name": name, "age": age, "email": email, "password": password, "status": true })

        if (result.acknowledged) {
            res.status(200).send({ msg: "User registration done" })
        } else {
            res.status(400).send({ msg: "something went wrong!" })
        }
    }

    // const updateStatus = await client
    //     .db("signup_login")
    //     .collection("registration")
    //     .update({ "email": [data.email] },
    //         { $set: { "status": "true" } }
    //     )

    // if (updateStatus.acknowledged) {
    //     res.status(200).send({ msg: "User status updated" })
    // } else {
    //     res.status(400).send({ msg: "something went wrong!" })
    // }
});

app.get("/users", async (req, res) => {

    const result = await client
        .db("signup_login")
        .collection("registration")
        .aggregate([{ $match: { "status": true } },
        {
            $project: {
                // "_id": 1,
                // "name": 1,
                // "email": 1,
                // "age": 1,
                "password": 0,
                // "status": 1
            }
        }
        ])
        .toArray()

    res.status(200).send(result)
});

app.delete("/deleteUsers", async (req, res) => {
    const result = await client
        .db("signup_login")
        .collection("registration")
        .deleteMany({})

    if (result.acknowledged) {
        res.status(200).send({ msg: "All data deleted" })
    } else {
        res.status(400).send({ msg: "something went wrong!" })
    }

})

// app.get("/get", async (req, res) => {
//     const data = req.body;

//     const checkUser = await client
//         .db("signup_login")
//         .collection("registration")
//         .find({ email: data.email })
//         .toArray()

//     res.send(checkUser)
// })


app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const check = await client
        .db("signup_login")
        .collection("registration")
        .findOne({ email: email })

    if (check) {
        if (check.password == password) {
            res.status(200).send({ msg: "User logged in successfull" });
        } else {
            res.status(400).send({ msg: "Password id not matching" });
        }
    } else {
        res.status(400).send({ msg: "User id not exists" });
    }
});

app.listen(PORT, () => {
    console.log("port started at " + PORT);
});