import axios from 'axios';


const setAuthToken =token =>{
	//token we pass in gonno come from local storage
	if(token){
		//to set token to global header
		axios.defaults.headers.common['x-auth-token'] = token;		
	}else{
		delete axios.defaults.headers.common['x-auth-token'];
	}
}
export default setAuthToken;