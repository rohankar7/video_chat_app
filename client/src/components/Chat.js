import React,{useState, useEffect, useContext} from 'react';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import '../components/css/Chat.css';
import fire from '../fire';
import {AuthContext} from './Auth';
import VideoPlayer from './VideoPlayer';

const Chat = (props) => {

    // Dropping Files
    var recorders = [];
    var gallery = document.getElementById('gallery');
    const dropArea = document.getElementById('drop-area');
    var previousButton = document.getElementById('prev');  
    var nextButton = document.getElementById('next');
    // let progressBar = document.getElementById('progress-bar');
    var slideshow = document.getElementsByClassName('mySlides')[0];
    var fileArray = [];

    // JSX
    const [arr, setArr] = useState([]);
    const [fileDropped, setFileDropped] = useState(false);
    const [fileDragged, setFileDragged] = useState(false);
    const [fileAdded, setFileAdded] = useState(false);
    const [userName, setUserName] = useState('');
    const [imgURL, setImgURL] = useState('');
    const [typedText, setTypedText] = useState('');
    const [isContactSelected, setIsContactSelected] = useState(false);
    const {currentUser} = useContext(AuthContext);
    const [messages, setMessages] = useState({});
    const [usingEmojis, setUsingEmojis] = useState(false);
    const optionIconClassName = 'fas fa-chevron-circle-down';
    const [displayingMenu, setDisplayingMenu] = useState(false);
    const [recordingAudio, setRecordingAudio] = useState(false);
    const [aboutToCall, setAboutToCall] = useState(false);
    var msgKey = '';    
    var textMessage = document.getElementsByClassName('inputMessage')[0];
    var ul = document.getElementsByClassName('messages')[0];

    // ES6
    function initializeProgress(numFiles){
        // progressBar.value = 0;
        // setFilesToDo(numFiles);
    }
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName=>{
            document.addEventListener(eventName, (e)=>{
            e.preventDefault();
            e.stopPropagation();
            if(isContactSelected){
                setFileDragged(false);
                dropArea.style.display = 'none';
            }
        }, false);
    });
    const handleGod = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if(isContactSelected && (e.type!=='drop') && (e.type!=='dragleave')){
            setFileDragged(true);
        }
    }
    const handleDragEnterOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if(isContactSelected){
            setFileDragged(true);
            dropArea.style.display='block';
            dropArea.style.transform = 'translateY(-100%)';
            dropArea.classList.add('highlight');
        }
    }
    const handleDragLeave = (e) => {
        // e.preventDefault();
        // e.stopPropagation();
        dropArea.classList.remove('highlight');
        setFileDragged(false);
        dropArea.style.display = 'none';
    }
    const handleDragDrop = (e) => {
        setFileDropped(true);
        var dt = e.dataTransfer;
        var files = dt.files;
        fileArray = [...files];
        setFileDragged(false);
        fileArray.forEach(file=>{
            previewFile(file);
        })
        setFileAdded(true);
        initializeProgress(fileArray.length);
        setArr([...fileArray]);
        document.getElementById('uploadButton').disabled = false;
    }
        
    function previewFile(file){
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function(){
            var type = file.type.split("/")[0];
            switch(type){
                case 'image': var img = document.createElement('img');
                    img.src = reader.result;
                    img.style.minWidth = '120px';
                    img.style.minHeight = '120px';
                    img.className = 'galleryChild';
                    img.draggable = false;
                    gallery.appendChild(img);
                    break;
                case 'video': var video = document.createElement('video');
                    video.src = reader.result;
                    video.style.minWidth = '120px';
                    video.style.minHeight = '120px';
                    video.autoplay = false;
                    video.controls = false;
                    video.className = 'galleryChild';
                    gallery.appendChild(video);
                    break;
                case 'application': console.log(file.type.split("/")[1]);
                    break;
                default: console.log('Unknown Type');
            }
            showArrows();
        }
    }
    window.addEventListener('resize', ()=>{
        showArrows();
    });
    function showArrows(){
        if(gallery!==null){
            if(gallery.scrollWidth > gallery.offsetWidth){
                previousButton.style.display = 'block';
                nextButton.style.display = 'block';
            }
            else{
                previousButton.style.display = 'none';
                nextButton.style.display = 'none';
            }
            // Preview element on click
            gallery.childNodes.forEach((element)=>{
                element.onclick = () => {
                    console.log('Length', fileArray.length);
                    console.log(element.tagName);
                    if(element.tagName==='VIDEO'){
                        element.controls = true;
                    }
                    var e=element.cloneNode(true);
                    if(slideshow.childElementCount>0){
                        slideshow.removeChild(slideshow.childNodes[0]);
                    }
                    slideshow.appendChild(e);
                    element.controls = false;
                }
            });  
        }
    }
    const showNextSlide = () => {
        gallery.appendChild(gallery.removeChild(gallery.childNodes[0]));
    }
    const previousSlide = () => {
        gallery.prepend(gallery.removeChild(gallery.childNodes[gallery.childElementCount-1]));
    }
    const displayFiles = (date, time, size, folderName, type) => {
        for(let i=0;i<size;i++){
            fire.storage().ref(`users/${currentUser.uid}/${folderName}/${date}_${time}_${i}`).getDownloadURL().then((imageURL)=>{
                // console.log('File Found', i);
                fire.database().ref(`users/${currentUser.uid}/contacts/${props.uid}/messages`).child(`${date}_${time}_${i}`).set({
                    "date" : date,
                    "time" : time,
                    "message" : null,
                    "file" : imageURL,
                    "uid" : currentUser.uid,
                    "type" : type
                }).then(()=>{
                    fire.database().ref(`users/${props.uid}/contacts/${currentUser.uid}/messages`).child(`${date}_${time}_${i}`).set({
                        "date" : date,
                        "time" : time,
                        "message" : null,
                        "file" : imageURL,
                        "uid" : currentUser.uid,
                        "type" : type
                    })
                })
            })
            .catch(err=>console.log(err));
        }
    }
    const uploadFiles = () => {
        document.getElementById('uploadButton').disabled = true;
        gallery.innerHTML = '';
        // progressBar.style.display = 'block';
        // var ele = document.getElementsByClassName('.BigPreview');
        document.getElementsByClassName('mySlides')[0].innerHTML='';
        var size = 0, index = 0;
        arr.forEach((file)=>{
            var today = new Date();
            var date = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
            var time = `${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;
            var type = file.type.split("/")[0];
            var destinationFolder = '';
            switch(type){
                case 'image' : destinationFolder = 'Images';
                break;
                case 'video' : destinationFolder = 'Video';
                break;
                case 'application' : destinationFolder = 'Application';
                break;
                case 'audio' : destinationFolder = 'Audio';
                break;
                default: destinationFolder = 'Default';
            }
            fire.storage().ref(`users/${currentUser.uid}/${destinationFolder}`).child(`${date}_${time}_${size}`).put(file).then(()=>{
                console.log('Uploaded', `${date}_${time}_${size}`);
                ++index;
                if(index===arr.length){
                    displayFiles(date, time, arr.length, destinationFolder, type);
                }
            })
            .catch(err=>{
                console.log(err);
            });
            ++size;
        });
        
        setArr([]);
        setFileAdded(false);
        setFileDropped(false);
        previousButton.style.display = 'none';
        nextButton.style.display = 'none';
        console.log('OUT');
        // var tempImg = document.createElement('img');
        // document.getElementsByClassName('mySlides')[0].appendChild(tempImg);
        // document.getElementsByClassName('mySlides')[0].childNodes[0].className = 'BigPreview';
    }
    
    const sendMessage=()=>{
        if(typedText.length !== 0){
            var today = new Date();
            var date = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
            // var time = `${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;
            var time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
            // fire.database().ref(`users/${currentUser.uid}/contacts/${props.uid}/messages`).child(`${date}_${time}`).set({
            fire.database().ref(`users/${currentUser.uid}/contacts/${props.uid}/messages`).push().set({
                "date" : date,
                "time" : time,
                "message" : typedText,
                "uid" : currentUser.uid,
            });
            // fire.database().ref(`users/${props.uid}/contacts/${currentUser.uid}/messages`).child(`${date}_${time}`).set({
            fire.database().ref(`users/${props.uid}/contacts/${currentUser.uid}/messages`).push().set({
                "date" : date,
                "time" : time,
                "message" : typedText,
                "uid" : currentUser.uid,
            });
            fire.database().ref(`users/${props.uid}/contacts/${currentUser.uid}/lastMessage`).set({
                "lastMessage" : typedText
            });
            fire.database().ref(`users/${currentUser.uid}/contacts/${props.uid}/lastMessage`).set({
                "lastMessage" : typedText
            })
            textMessage.value = '';
            setTypedText('');
        }
    }

    const updateText = (event) => {
        setTypedText(event.target.value);
    }
    const pressedEnter = (event) => {
        if(event.key==='Enter'){
            sendMessage();
        }
    }
    const addEmoji = (event) => {
        if(textMessage==null){
          setTypedText((msg)=>msg+event.native);
        }
        else{
          textMessage.value += event.native;
          setTypedText((msg)=>msg+event.native);
        }
        textMessage.focus();
    }
    const usePicker = () => {
        setUsingEmojis((usingEmojis)=>!usingEmojis);
    }
    const showMenu = (event) => {
        if(event.target.tagName==='LI'){
            event.target.childNodes[1].childNodes[0].className = optionIconClassName;
        }
        else if(event.target.tagName==='SPAN'){
            if(event.target.childNodes[1]!==undefined){
                event.target.parentElement.childNodes[1].childNodes[0].className = optionIconClassName;
            }
            else{
                event.target.childNodes[0].className = optionIconClassName;
            }
        }
        else if(event.target.tagName==='DIV' && event.target.parentElement.nodeName==='SPAN'){
            event.target.parentElement.parentElement.childNodes[1].childNodes[0].className = optionIconClassName;
        }
        else if(event.target.tagName==='I'){
            event.target.className = optionIconClassName;
        }
    }
    const hideMenu = (event) => {
        if(event.target.tagName==='LI'){
            event.target.childNodes[1].childNodes[0].className = "";
        }
        else if(event.target.tagName==='SPAN'){
            if(event.target.childNodes[1]!==undefined){
                event.target.parentElement.childNodes[1].childNodes[0].className = "";
            }
            else{
                event.target.childNodes[0].className = "";
            }
        }
        else if(event.target.tagName==='DIV' && event.target.parentElement.nodeName==='SPAN'){
            event.target.parentElement.parentElement.childNodes[1].childNodes[0].className = "";
        }
    }

    const displayMsgOptions=(event)=>{
        if(event.target.className===optionIconClassName){
            msgKey = event.target.id;
            event.target.innerHTML = `<section id='menuSection' style={{background:'#fff'}}>
            <button id='edit'>Edit</button>
            <button id='quote'>Quote</button>
            <button id='copy'>Copy</button>
            <button id='remove'>Remove</button>
            </section>`
            setDisplayingMenu(true);
            var editButton = document.getElementById('edit');
            var quoteButton = document.getElementById('quote');
            var copyButton = document.getElementById('copy');
            var removeButton = document.getElementById('remove');
            editButton.onclick = () => {
                console.log('Edit function');
            }
            quoteButton.onclick = () => {
                console.log('Quote function');
            }
            copyButton.onclick = () => {
                var copyText = event.target.parentElement.parentElement.childNodes[0].childNodes[0].data;
                var tempInputField = document.createElement('input');
                tempInputField.setAttribute('value', copyText);
                document.body.appendChild(tempInputField);
                tempInputField.select();
                document.execCommand('copy');
                document.body.removeChild(tempInputField);
                // alert('Copied Text');
            }
            removeButton.onclick = () => {
                fire.database().ref(`users/${currentUser.uid}/contacts/${props.uid}/messages/${msgKey}`).remove().then(()=>{
                    console.log('Data removed successfully');
                }).catch(err=>{
                    console.log('Error in deleting data');
                });
                fire.database().ref(`users/${props.uid}/contacts/${currentUser.uid}/messages/${msgKey}`).remove().then(()=>{
                    console.log('Data removed successfully');
                }).catch(err=>{
                    console.log('Error in deleting data');
                });
            }
        }
    }
    const checkClick=(event)=>{
        var i = document.querySelectorAll(`i`);
        if(displayingMenu){
            i.forEach((item)=>item.innerHTML='');
            setDisplayingMenu(false);
        }
        var j = document.querySelectorAll('.fa-chevron-circle-down');
        j.forEach((item)=>item.className='')
    }

    const recordAudio = () => {
        console.log('Recording Audio...');
        var acceptedAudio = false;
        setRecordingAudio(true);
        var audioConstraints = {audio: true};
        navigator.mediaDevices.getUserMedia(audioConstraints).then((mediaStreamObject)=>{

            let cancel = document.getElementById('cancel');
            let accept = document.getElementById('accept');
            let mediaRecorder = new MediaRecorder(mediaStreamObject);
            let dataArray = [];
            recorders.push(mediaRecorder.stream);
            mediaRecorder.start();
            console.log('Media Recorder', mediaRecorder.state);
            cancel.addEventListener('click', function (ev) {
                if(mediaRecorder.state!=='inactive')
                    mediaRecorder.stop();
                setRecordingAudio(false);
            });
            accept.addEventListener('click', function (ev) {
                if(mediaRecorder.state!=='inactive')
                    mediaRecorder.stop();
                setRecordingAudio(false);
                acceptedAudio = true;
            });
            mediaRecorder.ondataavailable = function (ev) {
                dataArray.push(ev.data);
            }
            mediaRecorder.onstop = function (ev) {
                if(acceptedAudio){
                    let audioBlob = new Blob(dataArray,{ 'type': 'audio/mp3;' });    // blob of type mp3
                    dataArray = [];
                    var today = new Date();
                    var date = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
                    var time = `${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;
                    fire.storage().ref(`users/${currentUser.uid}/Audio`).child(`${date}_${time}`).put(audioBlob).then(()=>{
    
                        fire.storage().ref(`users/${currentUser.uid}/Audio/${date}_${time}`).getDownloadURL().then((audioURL)=>{
                            fire.database().ref(`users/${currentUser.uid}/contacts/${props.uid}/messages`).child(`${date}_${time}`).set({
                                "date" : date,
                                "time" : time,
                                "message" : null,
                                "file" : audioURL,
                                "uid" : currentUser.uid,
                                "type" : 'audio'
                            }).then(()=>{console.log('Updated to db')}).catch(err=>console.log(err));
                        });
                    });
                }
            }
            console.log('Recorders', recorders);
        })
        .catch(error=>{
            console.log('Error');
        })
    }
    const messageToDisplay = (messages, key) => {
        if(messages[key].message){
            return messages[key].message;
        }
        else{
            switch(messages[key].type){
                case 'audio': return <audio src={messages[key].file} controls></audio>
                case 'image': return <img src={messages[key].file} alt='' style={{width: '100px', height: '100px'}}/>
                case 'video': return <video src={messages[key].file} style={{width: '360px', height: '240px'}} controls></video>
                default: console.log('Unaccepted file type', messages[key].type);
            }
        }
    }
    useEffect(()=>{
        if(props.uid!==""){
            setIsContactSelected(true);
            setUserName(props.uname);
            setImgURL(props.picLink);
            fire.database().ref(`users/${currentUser.uid}/contacts/${props.uid}/messages`).on('value',(snapshot)=>{
                setMessages({...snapshot.val()});
            });
        }
        else{
            setIsContactSelected(false);
        }
    },[currentUser, props]);

    return (
        <div id='god' onDrop={e => handleGod(e)} onDragOver={e => handleGod(e)} onDragEnter={e => handleGod(e)} onDragLeave={e => handleGod(e)}>
            <div className='Chat' onClick={checkClick} style={{display: (fileDragged||fileDropped||fileAdded||fileArray.length!==0)? 'none': 'block'}}>
                <div className='contactNotSelected' style={{display: isContactSelected ? "none" : "block"}}>
                    <h1>Hello {props.user}</h1>
                </div>
                <div className='userChat' style={{display: isContactSelected ? "block" : "none"}}>
                    <div className='chatName'>
                        <img className='profileImages' src={imgURL} alt='Profile Pic' />
                        <div className='details'>
                            <h2>{userName}</h2>
                            {/* <h3>Last Seen: ???</h3> */}
                        </div>
                        <div className='phoneCall'><i className="fas fa-phone"></i></div>
                        <div className='videoCall'><i className="fas fa-video" onClick={()=>setAboutToCall(true)}></i></div>
                    </div>
                    <div className='div_messages' style={{height: usingEmojis ? "47vh" : "70vh"}}>
                        <ul className='messages'>
                        {
                            Object.keys(messages).map((key, i)=>{
                                if(messages[key].uid===props.uid)
                                // Display the messages menu
                                    return (<li key={key} className='thisIsNotUser' onMouseOver={showMenu} onMouseOut={hideMenu}>
                                {/* Without the messages menu */}
                                    {/* return (<li key={key} className='thisIsNotUser'> */}
                                    <span className='msgSpan'>
                                        {
                                            messageToDisplay(messages, key)
                                        }
                                        <div className="time">{messages[key].time}</div>
                                    </span>
                                    <span className='space' style={{background: "rgba(0, 0, 0, 0)", width: "2vw", height: "4vh"}}>
                                        <i className="" id={key} onClick={displayMsgOptions} style={{zIndex: '4 !important', position: 'absolute', padding: 0, float: 'right'}}></i>
                                    </span>
                                    </li>)
                                return (<li key={key} className='thisIsUser' onMouseOver={showMenu} onMouseOut={hideMenu}>
                                {/* return (<li key={key} className='thisIsUser'> */}
                                    <span className='msgSpan'>
                                        {
                                            messageToDisplay(messages, key)
                                        }
                                        <div className="time">{messages[key].time}</div>
                                    </span>
                                    <span className='space' style={{background: "rgba(0, 0, 0, 0)", width: "2vw", height: "4vh"}}>
                                        <i className="" id={key} onClick={displayMsgOptions} style={{zIndex: '4 !important', position: 'absolute', padding: 0, float: 'right'}}></i>
                                    </span>
                                </li>)
                            })
                        }
                        </ul>
                    </div>
                    <div style={{background:'#000', height: usingEmojis ? '23vh' : '0vh'}}>
                        {usingEmojis && (<Picker set='twitter' onSelect={addEmoji} />)}
                    </div>
                    <div className='div_type_message'>
                        <div className='emoji' onClick={usePicker}><i className="far fa-laugh-beam"></i></div>
                        <div className='input_sendIcon_div'>
                            <input className='inputMessage' type='text' onKeyPress={pressedEnter} onChange={updateText} autoComplete='off' placeholder='Type a message' autoFocus/>
                            <i className="fas fa-paper-plane" id='sendIcon' onClick={sendMessage}></i>
                        </div>
                        <div className='voiceMessage'>
                            <i className="fas fa-microphone-alt" onClick={recordAudio} style={{display: recordingAudio? 'none' : 'block'}}></i>
                            <div style={{display: recordingAudio? 'block' : 'none'}} className='audio_div'>
                                <i className="far fa-times-circle" id='cancel'></i>
                                <i className="far fa-check-circle" id='accept'></i>
                            </div>
                        </div>
                    </div>
                </div>        
            </div>
            <div id='drag' style={{display: (fileDragged||fileDropped)? 'block': 'none'}} onDragOver={e=>handleDragEnterOver(e)} onDragEnter={e=>handleDragEnterOver(e)} >
                <div className='file_dropped' style={{visibility: fileAdded? 'visible' : 'hidden'}}>
                    <div className='slideshow-container'>
                        <div className="mySlides fade"></div><br />
                    </div>
                    <input type='file' id="fileElem" multiple accept="*" />
                    {/* <form className="my-form">
                        <label htmlFor="fileElem" className="button">Select some files</label>
                    </form> */}
                    <div className='galleryContainer'>
                        <span id="prev" onClick={previousSlide}>&#10094;</span>
                        <div id='gallery'></div>
                        <span id="next" onClick={showNextSlide}>&#10095;</span>
                    </div>
                    {/* <progress id="progress-bar" max={100}></progress> */}
                    <i class="fas fa-upload" onClick={uploadFiles} id='uploadButton'></i>
                    {/* <button type='button'>Upload</button> */}
                </div>
                <div id='drop-area' style={{display: fileDragged? 'block': 'none'}} onDragLeave={e=>handleDragLeave(e)} onDrop={e=>handleDragDrop(e)}></div>
            </div>
            <div>
                {
                    aboutToCall && (
                        <VideoPlayer name={props.user}/>
                    )
                }
            </div>
        </div>
    );
}

export default Chat;