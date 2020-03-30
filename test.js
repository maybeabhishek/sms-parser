
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://maybeabhishek:I_am_jok3r@cluster0-uoo2j.gcp.mongodb.net/qykly_dev?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db('qykly_dev').collection('regexes');
  // perform actions on the collection object
  collection.find().toArray(function(err,b){
    //   console.log(err);
      console.log(b[0]);
  },)
  console.log(err)
  client.close();
});
