const express =require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const {check,validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const config =require('config');
const bcrypt = require('bcryptjs');
//@route  GET api/auth
//@desc   get users data using token
//@access public 
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  POST api/auth
//@desc   Authenticate user & get token
//@access public 
router.post('/',[
  
  check('email','enter valid email ').isEmail(),
  check('password','password is required').exists()
	],
    async(req,res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
    	return res.status(400).json({errors :  errors.array()});
    }

    //destructure name,email,password from req.body
    const {email,password} = req.body;

    try{

    //see if user not exists
    let user = await User.findOne({email:email});
    if(!user){
    	return res
    	.status(400)
    	.json({error:[{msg:'invalid credentials'}]});
    }
   
    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
    	return res
    	.status(400)
    	.json({error:[{msg:'invalid credentials'}]});
    }
    

    //return jsonwebtoken
    const payload = {
    	id : user.id
    }
    jwt.sign(payload,
    	config.get('jwtSecret'),
    	{expiresIn:360000},
    	(err,token)=>{
    		if (err) throw err;
    		res.json({token});
    	})

	
   }
    catch(err){
      console.error(err.message);
      res.status(500).send('server error');
   }

});
module.exports = router;