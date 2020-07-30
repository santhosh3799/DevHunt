const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');
const connectDB = async()=>{
	try{
     await mongoose.connect(db,{
     	//to eliminate depreciation warning
     	useNewUrlParser : true,
     	useUnifiedTopology:true,
      useCreateIndex: true,
      useFindAndModify:false
     });

     console.log('MongoDb connected');
	}catch(err){
       console.error(err.message);
       //exit process with failure
       process.exit(1);
	} 
}

module.exports = connectDB;