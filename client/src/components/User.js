import React, {useState, useContext} from 'react';
import fire from '../fire';
import {AuthContext} from './Auth';
import pic from '../Images/profile.jpg'

const User = (props) => {

    const [imgLink, setImageUrl] = useState('');
    const [updateImage, setUpdateImages] = useState(false);
    const [clickedProfile, setClickedProfile] = useState(false);
    const [file, setFile] = useState(null);
    const [chosePic, setChosePic] = useState(false);
    var images = document.querySelectorAll('img');
    images.forEach(image=>image.draggable = false);


    const styleObj = {
        display: clickedProfile ? 'block' : 'none',
    }

    const chooseFile=(event)=>{
        setFile(event.target.files[0]);
        setChosePic(true);
    }

    const {currentUser} = useContext(AuthContext);

    const uploadPic=()=>{
        if(file!=null){
            console.log("UPLOADING");
            fire.storage().ref('users/'+currentUser.uid+'/profile.jpg').put(file).then(()=>{
                setUpdateImages(true);
                props.parentCallback(updateImage);
            });
            // var ref = fire.storage().ref('users/'+currentUser.uid+'/profile.jpg');
            // ref.getMetadata().then((data)=>{
            //     console.log("User:"+data.generation);
            // });
            if(updateImage){
                setUpdateImages(false);
            }
            setClickedProfile(false);
        }
        else{
            console.log("File is null");
        }
        setChosePic(false);
    }


    fire.auth().onAuthStateChanged((user)=>{
        if(user){
            fire.storage().ref(`users/${user.uid}/profile.jpg`).getMetadata().then(data=>{
                if(data.contentType==="image/jpg" || data.contentType==="image/jpeg" || data.contentType==="image/png"){
                    fire.storage().ref(`users/${user.uid}/profile.jpg`).getDownloadURL().then((imageURL)=>{
                        setImageUrl(imageURL);
                    });
                }
                else{
                    setImageUrl(pic);
                }
            });
            props.getDataFromUser(props.uname);
        }
    });
    
    const clicked=()=>{
        setClickedProfile(clickedProfile=>!clickedProfile);
    }

    const signOut = () => {
        fire.auth().signOut();
    }

    const cancelPicUpload = () => {
        setFile(null);
        setChosePic(false);
    }
    
    return (
        <div className='User'>
            <div className='section1' id="user">
                <img src={imgLink} alt='' unselectable='on' className='profileImages' onClick={clicked} />
                <span>Welcome {props.uname}</span>
            </div>
            <div className='section2'></div>
            <div className='uploadProfile' style={styleObj}>
                <div className='userProfile_settings'>
                    <div>Click on your profile to go back</div>
                    <img src={imgLink} alt='' unselectable='on' className='settingsProfile' onClick={clicked} />
                    <div className='UserButtons updatePic'>
                        <i className="far fa-user-circle"></i>
                        <div className='updatePic_child'>
                            <label id='PicInput_label' htmlFor='PicInput' style={{display: chosePic? 'none' : 'block', cursor: 'pointer'}}>Select Profile Image</label>
                            <input type='file' onChange={chooseFile} id='PicInput' accept='image/*' />
                            <div className='showChoiceButtons' style={{display: chosePic? 'block' : 'none'}} >
                                <i className="far fa-times-circle" id='cancelUpload' onClick={cancelPicUpload}></i>
                                <i className="far fa-check-circle" id='acceptUpload'  onClick={uploadPic}></i>
                            </div>
                        </div>
                    </div>

                    <div className='UserButtons signOut'>
                        <i className="fas fa-power-off"></i>
                        <div style={{minWidth: '11vw', background: 'blue', textAlign: 'center', padding: '1vh', cursor: 'pointer'}} onClick = {signOut}>Sign Out</div>
                    </div>
                </div>
                
            </div>
        </div>
    )
}

export default User;