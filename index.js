import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import bcrypt from 'bcryptjs'
import { MongoClient, ServerApiVersion } from 'mongodb';
const app = express();
const port = 7000;

// MIDDLEWARE
app.use(express.json());
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.fp7vkua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // DATABASE COLLECTION
        const users = client.db("Infinity-Moneys").collection("users");


        // CREATE USER
        app.post("/create-user", async (req, res) => {
            const data = req.body;
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(data?.password, salt);
            const userInfo = { userName: data.name, userEmail: data.email, userNumber: data.phone, accountType: data.account_type, password: hash };


            const result = await users.insertOne(userInfo);

            res.send(result)
        })

        // LOGIN USER
        app.post("/login", async (req, res) => {
            const userInfo = req.body;
            const result = await users.findOne(
                {
                    $or: [
                        { userNumber: userInfo.accountNumber },
                        { userEmail: userInfo.accountNumber }
                    ]

                }
            );

            if (!result) {
                return res.send({ message: "Invalid account number or email" })
            }

            const correctPassword = bcrypt.compareSync(userInfo.password, result.password);

            if (!correctPassword) {
                return res.send({ message: "Invalid password" });
            }
            else {

                res.send(result)
            }
        })


        // TEST ROUTE
        app.get("/", async (req, res) => {
            res.send("Hey mama ami to coltechi")
        })


    } finally {

    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})