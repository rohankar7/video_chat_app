import React,{ useEffect} from 'react';
import {Link} from 'react-router-dom';
import './css/UI.css'

const Home = () => {

    useEffect(()=>{
        
    },[]);

    return (
        <div className="Home">
            <div>
                <ul className='navUl' style={{listStyleType: 'none'}}>
                    <li className='navItems' style={{width: '80%', textAlign: 'left'}}>HOME</li>
                    <div className='navBar'>
                        <li className='navItems' id='loginNav'><Link to='/login' tabIndex='0' style={{textDecoration:'none', padding: '2vh', borderRadius: '5px', color: 'black'}}>Login</Link></li>
                        <li className='navItems' ><Link to='/signup' tabIndex='1' style={{textDecoration:'none', padding: '2vh', borderRadius: '5px', color: '#000'}}>Sign Up</Link></li>
                    </div>
                </ul>
            </div>
            <div className='Back'>
                <div className='Title'>
                    Welcome to one of the best<br/> Chat communities online
                </div>
                <img src='Assets/chat.png' alt='chatImage'/>
            </div>
        </div>
    );
}

export default Home;