import React, {useCallback, useEffect} from 'react';
import {useContext} from 'react';
import {withRouter, Redirect} from 'react-router';
import {Link} from 'react-router-dom';
import fire from '../fire';
import { AuthContext } from './Auth';

import './css/UI.css';

var emailVerified= null;
const Login = ({history}) => {
    
    const {currentUser} = useContext(AuthContext);

    const removeError = () => {
        document.getElementById('error').innerHTML = '';
    }
    
    const loginUser = useCallback(async (event) => {
        event.preventDefault();
        const {email, password} = event.target.elements;
        await fire.auth().signInWithEmailAndPassword(email.value, password.value).then(()=>{
            fire.auth().onAuthStateChanged(user=>{
                if(user!==null){
                    emailVerified = user.emailVerified;
                    // console.log('User Verified', emailVerified);
                }
            });
            if(emailVerified===true){
                history.push("/main");
                console.log('Login - Email Verified:', emailVerified);
                return <Redirect uid={fire.auth().currentUser.uid} to='/main' />;
            }
            else{
                history.push('/manage-user');  
            }
        })
        .catch(error=>{
            const err = document.getElementById('error');
            switch(error.code){
                case "auth/user-not-found" : err.innerHTML = 'User not found'; // error.message
                break;
                case 'auth/wrong-password' : err.innerHTML = 'Wrong Password';
                break;
                case 'auth/invalid-email' : err.innerHTML = 'Invalid Email';
                break;
                default: console.log(error.message);
            }
            if(document.getElementById('m')!==null){
                document.getElementById('m').value = '';
            }
            if(document.getElementById('p')!==null){
                document.getElementById('p').value = null;
            }
        });
    },[history]);

    useEffect(()=>{
        console.log('LOGIN');
    },[]);
    
    if(fire.auth().currentUser || emailVerified || (currentUser===null)){
        // console.log(fire.auth().currentUser.emailVerified);
        if(fire.auth().currentUser!==null){
            if(fire.auth().currentUser.emailVerified===true)
                return <Redirect uid={fire.auth().currentUser.uid} to='/main' />;
            else
                return <Redirect to='/manage-user' />;
        }
    }


    return (
        <div className="Login">
            <form onSubmit={loginUser}>
                <h1>LOGIN</h1>
                <div id='error' style={{paddingBottom: '2vh', color: 'darkgreen'}}></div>
                <div className="input_div"><input name='email' type="email" placeholder="Email" autoComplete="off" id='m' onClick={removeError} /></div>
                <div className="input_div"><input type="password" name='password' placeholder="Password" id='p' onClick={removeError} /></div>
                <button className='uiButtons' type="submit">Login</button>
                <div className='link'>Forgot your password?&nbsp;
                    <Link to={{pathname: '/manage-user', type:'resetPassword'}}>Reset</Link>
                </div>
                <div className='link'>Don't have an account?&nbsp;
                    <Link to='/signup'>Signup</Link>
                </div>
            </form>
        </div>
    );
}

export default withRouter(Login);