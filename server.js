const express =require('express');
const connectDB = require('./config/db');
const app = express();



//connect database
connectDB();

//init middleware
app.use(express.json({extended:false}));

app.get ('/',(req,res) => res.send('hello'));
//define routes
app.use('/api/users',require('./routes/api/users.js'));
app.use('/api/auth',require('./routes/api/auth.js'));
app.use('/api/profile',require('./routes/api/profile.js'));
app.use('/api/posts',require('./routes/api/posts.js'));



const PORT =process.env.PORT || 5000

app.listen(PORT,()=> console.log(`server listening to port ${PORT}`));