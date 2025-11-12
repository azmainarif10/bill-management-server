const express = require("express")
const app = express()
const cors = require("cors")
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const PORT=3000;
app.use(express.json())
app.use(cors())
const admin = require("firebase-admin");

const decoded = Buffer.from(process.env.FIREBASE_TOKEN, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ae.lom2zra.mongodb.net/?appName=aE"`

 const verifyFireToken = async (req,res,next)=>{

 const authorization = req.headers.authorization
  if(!authorization){
    res.status(403).send({message:"unauthorized access"})
  }
const token = authorization.split(' ')[1]
   if(!token){
    res.status(403).send({message:"unauthorized access"})
  }
  
    try{
   const decoded = await admin.auth().verifyIdToken(token)
     req.token_email = decoded.email
          next()
    }catch(error){
             console.error("Firebase Token Verification Error:", error.code, error.message);
        return res.status(401).send({ 
            message: "Unauthorized: Invalid or expired token.",
            error_code: error.code 
        });
        }



 }

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


 async function run(){


    try{

          // await client.connect()
          // await client.db("billdb").command({ping:1})
     console.log("Pinged your deployment. You successfully connected to MongoDB!");
     
     
     app.listen(PORT ,()=>{
        
        console.log(`Express Server is running on http://localhost:${PORT}`);

     })

    }catch(error){
       console.log(error)
    }
    

 app.get("/homepage-bills", async (req,res)=>{

   const db =  client.db("billdb")
   const billCollection = db.collection("bills")

   const result = await billCollection.find({}).sort({date:-1}).limit(6).toArray()
   res.send(result)


 })
 app.get("/bills", async (req,res)=>{
   const category = req.query.category
   const query={}
   if(category && category !=="All"){
     query.category = category
   }

   const db =  client.db("billdb")
   const billCollection = db.collection("bills")

   const result = await billCollection.find(query).toArray()
   res.send(result)
  
 })
  app.get("/bill-detail/:id", async (req,res)=>{
   const {id} = req.params
   

   const db =  client.db("billdb")
   const billCollection = db.collection("bills")

   const result = await billCollection.findOne({_id:new ObjectId(id)})
   res.send(result)
  
 })

  app.post("/my-bills", async (req,res)=>{
   const myBills = req.body
   

   const db =  client.db("billdb")
   const myBillCollection = db.collection("myBills")

   const result = await myBillCollection.insertOne(myBills)
   res.send(result)
  
 })


  app.get("/my-bills",verifyFireToken, async (req,res)=>{
   const email = req.query.email
   
   
   if (email !== req.token_email) {
    return res.status(403).send({ message: "forbidden access" });
  }

   const db =  client.db("billdb")
   const myBillCollection = db.collection("myBills")

   const query ={};
   if(email){
       query.email = email;
   }

   const result = await myBillCollection.find(query).toArray()
   res.send(result)
  
 })

app.put("/my-bills/update/:id", async (req,res)=>{
    
  const id = req.params.id
   const update = req.body
   
   const db =  client.db("billdb")
   const myBillCollection = db.collection("myBills")

   const result = await myBillCollection.updateOne({_id: new ObjectId(id)},{$set:update})
   res.send(result)
  
 })

app.delete("/my-bills/delete/:id", async (req,res)=>{
    
  const id = req.params.id
   
   const db =  client.db("billdb")
   const myBillCollection = db.collection("myBills")

   const result = await myBillCollection.deleteOne({_id: new ObjectId(id)})
   res.send(result)
  
 })

  app.post("/add-bill", async (req,res)=>{
   const myAdd = req.body
   

   const db =  client.db("billdb")
   const myAddCollection = db.collection("bills")

   const result = await myAddCollection.insertOne(myAdd)
   res.send(result)
  
 })





 }
run().catch(console.dir);