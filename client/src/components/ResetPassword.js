import React, {useEffect, useState} from 'react';
import fire from '../fire';

const ResetPassword = () => {

    const [email, setEmail] = useState('');
    const [mailSend, setMailSend] = useState(false);

    useEffect(()=>{}, [mailSend]);

    const sendPasswordResetEmail = (event) => {
        event.preventDefault();
        fire.auth().sendPasswordResetEmail(email).then(()=>{
            console.log('Password Reset Email send');
        }).catch(err=>{
            console.log('Error:', err);
        });
        setMailSend(true);
        setEmail('');
    };

    return (
        <div className='ManageUser'>
            <div style={{display: mailSend ? 'none' : 'block'}}>
                <form onSubmit={sendPasswordResetEmail}>
                    <input type='email' value={email} placeholder='Enter your email' onChange={(event)=>setEmail(event.target.value)}/>
                    <button className = 'uiButtons' type='submit'>Reset</button>
                </form>
            </div>
            <div style={{display: mailSend? 'block': 'none', color: 'white'}}>Check your email for password reset link</div>
        </div>
    )
}

export default ResetPassword;
