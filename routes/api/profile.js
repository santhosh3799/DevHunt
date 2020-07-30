const express =require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
const{check,validationResult} = require('express-validator');
const request = require('request');
const config = require('config');
//@route  GET api/profile/me
//@desc   get current users profile
//@access private(so import auth middleware)
router.get('/me',auth,async(req,res)=> {
	try{
		const profile = await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);

		if(!profile){
		return res.status(400).json({msg:'There is no profile for this user'});
	    } 
	    res.json(profile);  
	}catch(err){
		console.err(err.message);
		res.status(500).send('server error');
	}
	
   	
});
//@route POST api/profile
//@desc   CREATE OR UPDATE USER Profile
//@access private(so import auth middleware)
router.post('/',[auth,[
	check('status','Status is required').not().isEmpty(),
	check('skills','Skills is required').not().isEmpty()
]],async(req,res)=>{
 	const errors = validationResult(req);
 	if(!errors.isEmpty()){
 		return res.status(400).json({errors: errors.array()});
 	}
 	//destructuring every fields from the req.body
 	const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user =req.user.id;
    if(company)profileFields.company=company;
    if(website)profileFields.website=website;
    if(location)profileFields.location=location;
    if(bio)profileFields.bio=bio;
    if(status)profileFields.status=status;
    if(githubusername)profileFields.githubusername=githubusername;
    if(skills){
    	profileFields.skills = skills;
    }
    //build social object
    profileFields.social = {}
    	if(youtube)profileFields.social.youtube=youtube;
    	if(twitter)profileFields.social.twitter=twitter;
    	if(facebook)profileFields.social.facebook=facebook;
    	if(linkedin)profileFields.social.linkedin=linkedin;
    	if(instagram)profileFields.social.instagram=instagram;
    
  	try{
  		let profile =await Profile.findOne({user:req.user.id});

  		if(profile){
  			//update profile
  			profile =await Profile.findOneAndUpdate(
  				{user:req.user.id},
  				{$set: profileFields},
  				{new: true}
  				);
  			return res.json(profile);
  		}
  		//create profile
  		profile = new Profile(profileFields);
  		await profile.save();
  		res.json(profile);
  	}catch(err){
  		console.error(err.message);
  		return res.status(500).send('server error');
  	}

    res.send('hello');
})

//@route GET api/profile
//@desc   get all user profile
//@access public
router.get('/',async(req,res)=>{
	try{
		const profiles = await Profile.find().populate('user',['name','avatar']);
		res.json(profiles);
	}catch(err){
		console.error(err.message);
		res.status(500).send('Server error');
	}
})
//@route GET api/profile/user/:user_id
//@desc   get profile by user_id
//@access public
router.get('/user/:user_id',async(req,res)=>{
	try{
		const profile = await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
		
		if(!profile){
			return res.status(400).json({msg:'there is no profile for this user'});
		}

		res.json(profile);
	}catch(err){
		console.error(err.message);
		if(err.kind=='ObjectId'){
			return res.status(400).json({msg:'Profile not found'});
		}
		res.status(500).send('Server error');
	}
})
//@route DELETE api/profile
//@desc  delete profile ,user ,posts
//@access private
router.delete('/',auth,async(req,res)=>{
	try{
		//remove user posts
		await post.deleteMany({user:req.user.id});

		//remove profile
		await Profile.findOneAndRemove({user:req.user.id});
		//remove user
		await User.findOneAndRemove({_id:req.user.id});
		
		

		res.json({msg:'user deleted'});
	}catch(err){
		console.error(err.message);
		if(err.kind=='ObjectId'){
			return res.status(400).json({msg:'Profile not found'});
		}
		res.status(500).send('Server error');
	}
})
//@route PUT api/profile/experience
//@desc  add profile experience
//@access private
router.put('/experience',[auth,[
	check('title','Title is required').not().isEmpty(),
	check('company','Company is required').not().isEmpty(),
	check('from','From date  is required').not().isEmpty()
	]
],async(req,res)=>{
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(400).json({errors:errors.array()})
	}
	const{
		title,
		company,
		location,
		from,
		to,
		current,
		description
	} = req.body;
	const newExp = {
		title,
		company,
		location,
		from,
		to,
		current,
		description
	}
	try{
		const profile = await Profile.findOne({user:req.user.id})

		profile.experience.unshift(newExp);

		await profile.save();

		res.json(profile);

	}catch(err){
		console.error(err.message);
		res.status(500).send('Server error');
	}
});
//@route DELETE api/profile/experience/:exp_id
//@desc  delete experience from profile
//@access private
router.delete('/experience/:exp_id',auth,async(req,res)=>{
	try{
		const profile = await Profile.findOne({user:req.user.id})
		//get remove index
		const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
		profile.experience.splice(removeIndex,1);
		await profile.save();
		res.json(profile);
	}catch(err){
		console.error(err.message);
		res.status(500).send('Server error');	
	}
})	
//@route PUT api/profile/education
//@desc  add profile education
//@access private
router.put('/education',[auth,[
	check('school','school is required').not().isEmpty(),
	check('degree','degree is required').not().isEmpty(),
	check('fieldofstudy','field of study is required').not().isEmpty(),
	check('from','From date  is required').not().isEmpty()
	]
],async(req,res)=>{
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(400).json({errors:errors.array()})
	}
	const{
		school,
		degree,
		fieldofstudy,
		from,
		to,
		current,
		description
	} = req.body;
	const newEdu = {
		school,
		degree,
		fieldofstudy,
		from,
		to,
		current,
		description
	}
	try{
		const profile = await Profile.findOne({user:req.user.id})

		profile.education.unshift(newEdu);

		await profile.save();

		res.json(profile);

	}catch(err){
		console.error(err.message);
		res.status(500).send('Server error');
	}
});
//@route DELETE api/profile/education/:edu_id
//@desc  delete education from profile
//@access private
router.delete('/education/:edu_id',auth,async(req,res)=>{
	try{
		const profile = await Profile.findOne({user:req.user.id})
		//get remove index
		const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
		profile.education.splice(removeIndex,1);
		await profile.save();
		res.json(profile);
	}catch(err){
		console.error(err.message);
		res.status(500).send('Server error');	
	}
});

//@route  GET api/profile/github/:username
//@desc  get user repos from github
//@access public

router.get('/github/:username',async(req,res)=>{
	try{
		const options = {
			uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
			method:'GET',
			headers:{'user-agent':'node.js'}
		};
		request(options,(error,response,body)=>{
			if(error) console.error(error);
			if(response.statusCode !== 200){
				return res.status(404).json({msg:'No github profile found'});
			}
			res.json(JSON.parse(body));
		})
	}catch(err){
		console.error(err.message);
		res.status(500).send('server error');
	}
})

module.exports = router;