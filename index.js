const express = require("express")
const app = express()
const cors = require("cors")
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const PORT=3000;
app.use(express.json())
app.use(cors())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ae.lom2zra.mongodb.net/?appName=aE"`

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


  app.get("/my-bills", async (req,res)=>{
   const email = req.query.email
   

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