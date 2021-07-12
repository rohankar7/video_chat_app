import React, {useState, useEffect, useContext} from 'react';
import Contact from './Contact';
import fire from '../fire';
import User from './User';
import { AuthContext } from './Auth';

const Contacts = (props) => {

    const [users, setUsers] = useState({});
    const [picUpdate, setPicUpdate] = useState('');
    const [picURL, setPicURL] = useState('');
    const {currentUser} = useContext(AuthContext);

    const getTimeofUpdatefromUser = async (childData) => {
        console.log(childData);
        await setPicUpdate(childData);
        if(picURL!==""){
            props.sendPicURL(picURL);
        }
    }

    const getContactName = async (uname) => {
        await props.getContactNameFromContacts(uname);
    }

    const sendBackData = async (childData) => {
        await setPicUpdate(childData);
    }

    const getContactPic = async (imgURL) => {
        setPicURL(imgURL)
        props.sendPicURL(imgURL);
    }

    const getClickedContact = async (childUID)=>{
        // await setClickedUID(childUID);
        props.getDataFromContacts(childUID);
    }

    //get username from User
    const getDataFromUser=async(child)=>{
        await props.getUserDataFromContacts(child);
    }

    useEffect(()=>{
        try{
            fire.database().ref().child('users').on('value', (snapshot)=>{
                if(snapshot.val()!=null){
                    setUsers({...snapshot.val()});

                    // users[currentUser.uid].contacts.forEach(contact=>{
                    //     console.log(contact);
                    // })
                }
            });
        } catch(error){
            console.log(error);
        }
    },[picUpdate]);

    
    return (
        <div className='Contacts'>
            <div>
                {
                    Object.keys(users).filter((key)=>users[key].uid===currentUser.uid).map((key)=>(<User key={key} uid={currentUser.uid} uname={users[key].uname} parentCallback={getTimeofUpdatefromUser} getDataFromUser={getDataFromUser}/>))
                }
            </div>
            <div className='searchBar'>
                <div className='div_search'><i className="fas fa-search"></i></div>
                <input type='text' id='contactsBar' placeholder='Search chats & groups'/>
            </div>
            <div id='allContacts'>
                {
                    Object.keys(users).filter((key)=>users[key].uid!==currentUser.uid)
                    .map((key)=>(<Contact key={key} uid={users[key].uid} uname={users[key].uname} sendBackData={sendBackData} updateImage={picUpdate} getClickedContact={getClickedContact} getContactPic={getContactPic} getContactName={getContactName} lastMessage={users[currentUser.uid].contacts[users[key].uid]}/>))
                    // Object.keys(users)
                    // .map((key)=>(<Contact key={key} uid={users[key].uid} uname={users[key].uname} sendBackData={sendBackData} updateImage={picUpdate} getClickedContact={getClickedContact} getContactPic={getContactPic} getContactName={getContactName}/>))
                }
            </div>
        </div>
    )
}

export default Contacts;