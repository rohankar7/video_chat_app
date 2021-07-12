import React,{useState} from 'react';
import './css/Chat.css';
import Contacts from './Contacts';
import Chat from './Chat';
// import {AuthContext} from './Auth';

const Main = () => {
    const [chatUserData, setChatUserData] = useState('');
    const [chatUsername, setChatUsername] = useState('');
    const [picLink, setPicLink] = useState('');
    const [userName, setUserName] = useState('');

    const getDataFromContacts=async(childData)=>{
        await setChatUserData(childData);
    }

    const getContactNameFromContacts = async (child) => {
        setChatUsername(child);
    }

    const sendPicURL = async (imgLink) => {
        await setPicLink(imgLink);
    }
    const getUserDataFromContacts=async(childName)=>{
        await setUserName(childName);
    }

    return (
        <div className='Main'>
            <div className='chatSection'>
                <Contacts getDataFromContacts={getDataFromContacts} sendPicURL={sendPicURL} getContactNameFromContacts={getContactNameFromContacts} getUserDataFromContacts={getUserDataFromContacts}/>
                <Chat uid={chatUserData} uname={chatUsername} picLink={picLink} user={userName}/>
            </div>
        </div>
    );
}

export default Main;