import React, {useState, useEffect} from 'react';
import {Redirect} from 'react-router-dom';
import fire from '../fire';

const ManageUser = (props) => {

    const [emailVerified, setEmailVerified] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordToReset, setPasswordToReset] = useState(false);
    const [mailSend, setMailSend] = useState(false);
    const [resetDone, setResetDone] = useState(false);
    const [resetPassword, setResetPassword] = useState(false);
    const [actionCode, setActionCode] = useState('');
    const [email, setEmail] = useState('');
    const [emailToVerify, setEmailToVerify] = useState(false);
    const [resetMsg, setResetMsg] = useState('');
    

    fire.auth().onAuthStateChanged(user=>{
        if(user===null){
            setEmailVerified(false);
        }
        else{
            setEmailVerified(user.emailVerified);
        }
    });

    const sendPasswordResetEmail = (event) => {
        event.preventDefault();
        fire.auth().sendPasswordResetEmail(email).then(()=>{
            console.log('Password Reset Email send');
            setResetMsg('Check your email for the password reset link');
        }).catch(err=>{
            if(err.code==="auth/user-not-found"){
                setResetMsg("There is no user record corresponding to this email.");
            }
            else{
                setResetMsg("There is an error related to the submitted credentials");
            }
        });
        setMailSend(true);
        setEmail('');
    };

    const getParameterByName = (name) => {
        const url = window.location.href;
        name = name.replace(/[\][\]]/g, "\\$&");
        const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
        if (!results) return null;
        const decodedURIComponent = decodeURIComponent(results[2].replace(/\+/g, " "));
        return decodedURIComponent;
    }

    const updatePassword = (event) => {
        event.preventDefault();
        if(password===confirmPassword){
            fire.auth().confirmPasswordReset(actionCode, password).then(()=>{
                console.log('Password Set Successfully');
                setResetDone(true);
            }).catch(err=>console.log('Password Reset Error: ', err));
        }
        else{
            console.log('Passwords don\'t match');
        }
    };

    
    useEffect(()=>{
        console.log('MANAGE USER');
        if(props.location.type===undefined){
            // email verification
            var mode = getParameterByName('mode');
            var actionCode = getParameterByName('oobCode');
            if(mode!==null && actionCode!==null){
                // Either email verification or password reset
                // read the mode and action code to determine type
                // if mode = email verification then applyActionCode
                // else if mode = password reset then verifyPasswordResetCode
                setActionCode(actionCode);
                switch(mode){
                    case 'verifyEmail': fire.auth().applyActionCode(actionCode).then((res)=>{
                        console.log(res);
                        console.log('Verified');
                        setEmailVerified(true);
                    }).catch(err=>console.log('Error In Email Verification', err));
                        break;

                    case 'resetPassword':   fire.auth().verifyPasswordResetCode(actionCode).then((email) => {
                        setResetPassword(true);
                    }).catch((error) => {console.log('Password Reset Error')});
                        break;
                    default: console.log('Error in Action');
                }
            }
            else if(mode===null && actionCode===null){
                setEmailToVerify(true);
            }
        }
        else{
            if(fire.auth().currentUser!==null){
                if(fire.auth().currentUser.emailVerified===false){
                    setPasswordToReset(true);
                }
                else{
                    setPasswordToReset(false);
                }
            }
            else{
                setPasswordToReset(true);
            }
        }
        return () => {mode = ''; actionCode = '';}
    }, [emailVerified, emailToVerify, props, passwordToReset]);
    
    return (
        <div className='ManageUser'>
            <div className='verifyEmail' style={{display: emailToVerify? 'block' : 'none'}}>{
                emailVerified? (<Redirect to='/login'/>) : (<div><h1 style={{color: 'white'}}>Verify your email!!!</h1></div>)
            }</div>
            <div className='ManageUser' style={{display: (resetPassword)? 'block' : 'none'}}>
                {
                    resetDone? (<Redirect to='/login' />) :
                    <form onSubmit={updatePassword}>
                        <input type='password' value={password} placeholder='Enter new password' onChange={(event)=>setPassword(event.target.value)}/>
                        <input type='password' value={confirmPassword} placeholder='Re-enter new password' onChange={(event)=>setConfirmPassword(event.target.value)}/>
                        <button className = 'uiButtons' type='submit'>Set</button>
                    </form>
                }
            </div>
            <div className='sendResetLink' style={{display: passwordToReset? 'block' : 'none'}}>
                <div style={{display: mailSend? 'none' : 'block'}} className='passwordResetForm_parent'>
                    <form onSubmit={sendPasswordResetEmail}>
                    <div>RESET PASSWORD</div>
                        <input type='email' value={email} placeholder='Enter your email' onChange={(event)=>setEmail(event.target.value)}/>
                        <button className = 'uiButtons' type='submit'>Reset</button>
                    </form>
                </div>
                <div style={{display: mailSend? 'block': 'none', color: 'white'}}>{resetMsg}</div>
            </div>
        </div>
    )
}

export default ManageUser;