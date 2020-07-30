const express =require('express');
const router = express.Router();
const {check,validationResult} = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config =require('config');

//bring in user model
const User = require('../../models/User');
//@route  POST api/users
//@desc   register user route
//@access public 
router.post('/',[
  check('name','name is required').not().isEmpty(),
  check('email','enter valid email ').isEmail(),
  check('password','enter password with 6 or more characters').isLength({min:6})
	],
    async(req,res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
    	return res.status(400).json({errors :  errors.array()});
    }

    //destructure name,email,password from req.body
    const {name,email,password} = req.body;

    try{

    //see if user exists
    let user = await User.findOne({email:email});
    if(user){
    	return res
    	.status(400)
    	.send({error:[{msg:'user already exists'}]});
    }
   
    //get users gravatar
    const avatar = gravatar.url(email,{
    	s: '200',
    	r: 'pg',
    	d: 'mm'
    })
    user = new User({
    	name,
    	email,
    	avatar,
    	password
    });

    //Encrypt password using bcrypt
  	const salt = await bcrypt.genSalt(10);

  	user.password =await  bcrypt.hash(password,salt);

    //to save inside database
  	await user.save();

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