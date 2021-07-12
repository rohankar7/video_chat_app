import React, {useState, useEffect, useContext} from 'react';
import pic from '../Images/profile.jpg';
import fire from '../fire';
import { AuthContext } from './Auth';

const Contact = (props) => {

    const [imgLink, setImageUrl] = useState('');
    const [uname, setUname] = useState('');
    const [lastMessage, setLastMessage] = useState('');
    var images = document.querySelectorAll('img');

    const {currentUser} = useContext(AuthContext);
    images.forEach(image=>image.draggable = false);

    fire.database().ref(`users/${props.uid}/contacts/${currentUser.uid}/lastMessage`).on( 'child_changed', (snapshot)=>{
        setLastMessage(snapshot.val());
    })

    fire.database().ref(".info/connected").on('value', snapshot=>{
        console.log(snapshot.val());
    });

    useEffect(()=>{
        props.sendBackData(false);
        
        if(props.lastMessage!==undefined)
            setLastMessage(props.lastMessage.lastMessage.lastMessage);
        else
            setLastMessage('');
    },[props, currentUser]);


    fire.auth().onAuthStateChanged((user)=>{
        if(user){
            fire.storage().ref(`users/${props.uid}/profile.jpg`).getMetadata().then(data=>{
                if(data.contentType==="image/jpg" || data.contentType==="image/jpeg" || data.contentType==="image/png"){
                    fire.storage().ref(`users/${props.uid}/profile.jpg`).getDownloadURL().then((imageURL)=>{
                        setImageUrl(imageURL);
                    });
                }
                else{
                    setImageUrl(pic);
                }
            });
        }
        setUname(props.uname);
    });

    const chatWithContact = () => {
        props.getClickedContact(props.uid);
        props.getContactPic(imgLink);
        props.getContactName(props.uname);
    }
    
    return (
        <div className='Contact' onClick={chatWithContact}>
            <div className='section1'>
                <img className='profileImages' src={imgLink} alt=''/>
            </div>
            <div className='section2'>
                <h3>{uname}</h3>
                <span>{lastMessage}</span>
            </div>
        </div>
    )
}

export default Contact;