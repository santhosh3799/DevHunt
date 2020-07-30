import axios from 'axios';
import {REGISTER_SUCCESS,
		REGISTER_FAIL,
		USER_LOADED,
		AUTH_ERROR,
		LOGIN_SUCCESS,
		LOGIN_FAIL,
		LOGOUT,
		CLEAR_PROFILE
} from './types';
import {setAlert} from './alert';
import setAuthToken from '../utils/setAuthToken';


//LOAD USER
export const loadUser =() => async dispatch =>{
	//we gonna check if there is token 
	// and put it in global header  x-auth-token
	if(localStorage.token){
		setAuthToken(localStorage.token);
	}
	try{
		const res =await axios.get('api/auth');
		dispatch({
			type: USER_LOADED,
			//response data is the users data we get in response
			payload:res.data
		})
	}catch(err){
		dispatch({
			type:AUTH_ERROR
		});
	}
}


//register user
export const register = ({name,email,password}) =>async dispatch=>{
	const  config ={
		headers:{
			'Content-Type':'application/json'
		}
	}
 	const body = JSON.stringify({name,email,password});

 	try{
 		const res = await axios.post('/api/users',body,config);

 		dispatch({
 			type:REGISTER_SUCCESS,
 			//we get token as payload in response
 			payload: res.data
 		});

 		dispatch(loadUser());


 	}catch(err){
 		//if we get array of errors like name is invalid or email is empty
 		const errors = err.response.data.errors;
 		if(errors){
 			errors.forEach(error =>dispatch(setAlert(err.message,'danger')));
 		}
 		dispatch({
 			type:REGISTER_FAIL
 		})
 	}
}

//login user
export const login = (email,password) =>async dispatch=>{
	const  config ={
		headers:{
			'Content-Type':'application/json'
		}
	}
 	const body = JSON.stringify({email,password});

 	try{
 		const res = await axios.post('/api/auth',body,config);

 		dispatch({
 			type:LOGIN_SUCCESS,
 			//we get token as payload in response
 			payload: res.data
 		});
 		
 		dispatch(loadUser());

 	}catch(err){
 		//if we get array of errors like name is invalid or email is empty
 		const errors = err.response.data.errors;
 		if(errors){
 			errors.forEach(error =>dispatch(setAlert(err.message,'danger')));
 		}
 		dispatch({
 			type:LOGIN_FAIL
 		})
 	}
};
//LOGOUT/CLEAR PROFILE

export const logout =()=>dispatch =>{
	dispatch({type:CLEAR_PROFILE});
	dispatch({type:LOGOUT});
}