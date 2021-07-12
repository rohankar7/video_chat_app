import React, {useCallback} from 'react';
import {withRouter} from 'react-router';
import {Link} from 'react-router-dom';
import fire from '../fire';
import './css/UI.css';

const Signup = ({history}) => {

    const removeError = () => {
        document.getElementById('error').innerHTML = '';
    }
    
    const signupUser = useCallback( async (event)=>{
        event.preventDefault();
        const {userName, email, password, confirmPassword} = event.target.elements;
        var emailVerified = null;

        if(confirmPassword.value===password.value && userName.value!==''){
            await fire.auth().createUserWithEmailAndPassword(email.value, password.value).then(()=>{
                fire.auth().onAuthStateChanged((user)=>{
                    emailVerified = user.emailVerified;
                    user.sendEmailVerification().then(()=>{
                        console.log('Email Verification Sent');
                    })
                    .catch(error=>{
                        console.log(`ErrorCode: ${error.code}, ErrorMessage: ${error.message}`);
                    });
                    fire.database().ref('users/'+user.uid).set({
                        "uid" : user.uid,
                        "uname" : userName.value,
                    });
                    fire.storage().ref(`users`).child(`${user.uid}/profile.jpg`).put("Default Profile").then(()=>{
                        console.log('Successfully Put Message in place of image');
                    });
                });
                // history.push("/main");
                if(emailVerified===true){
                    history.push("/main");
                }
                else{
                    history.push('/manage-user');
                }
            }).catch(error=>{
                const err = document.getElementById('error');
                switch(error.code){
                    case "auth/user-not-found" : err.innerHTML = 'User not found'; // error.message
                    break;
                    case 'auth/wrong-password' : err.innerHTML = 'Wrong Password';
                    break;
                    case 'auth/invalid-email' : err.innerHTML = 'Invalid Email';
                    break;
                    case 'auth/email-already-in-use' : err.innerHTML = 'Email already in use';
                    break;
                    case 'auth/weak-password' : err.innerHTML = 'Password must be at least 6 characters';
                    break;
                    default: console.log(error.message);
                }
                document.getElementById('u').value='';
                document.getElementById('m').value='';
                document.getElementById('p').value=null;
                document.getElementById('cp').value=null;
            });
        }
        else{// Clear the input fields
            const err = document.getElementById('error');
            if(userName.value===''){
                err.innerHTML = 'Invalid Username';
            }
            else{
                err.innerHTML = 'Passwords don\'t match';
            }
            document.getElementById('u').value='';
            document.getElementById('m').value='';
            document.getElementById('p').value=null;
            document.getElementById('cp').value=null;
        }
    },[history]);

    return (
        <div className="Signup" id='signUp'>
            <form onSubmit={signupUser}>
                <h1>SIGN&nbsp;UP</h1>
                <div id='error' style={{paddingBottom: '2vh', color: 'darkgreen'}}></div>
                <div className="input_div"><input type="text" placeholder="User Name" autoComplete="off" name='userName' id='u' onClick={removeError} /></div>
                <div className="input_div"><input type="email" placeholder="Email" autoComplete='off' autofill='off' name='email' id='m' onClick={removeError} /></div>
                <div className="input_div"><input type="password" placeholder="Password" name='password' id='p' onClick={removeError} /></div>
                <div className="input_div"><input type="password" placeholder="Confirm Password" name='confirmPassword' id='cp' onClick={removeError} /></div>
                <button className='uiButtons' type="submit">Sign Up</button>
                <div className='link'>Already have an account?&nbsp;
                    <Link to='/login'>Login</Link>
                </div>
            </form>
        </div>
    );
}

export default withRouter(Signup);