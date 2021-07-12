import React, { useState, useRef, useEffect, useContext} from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {io} from 'socket.io-client';
import Peer from 'simple-peer';
import { AuthContext } from './Auth';

// var socket = io('http://localhost:5000/main');
var socket = null;

const VideoPlayer = (props) => {
    
    const [stream, setStream] = useState(null);
    const [me, setMe] = useState('');
    const [call, setCall] = useState('');
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState('');
    const [idToCall, setIdToCall] = useState('');

    const {currentUser} = useContext(AuthContext);
    const myVideo = useRef();
    const userVideo = useRef();
    // const userVideo = document.getElementById('userVideo')
    const connectionRef = useRef();
    const videoDiv = useRef();
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    useEffect(() => {
        socket = io('http://localhost:5000');
        navigator.mediaDevices.getUserMedia({
            audio: true, video: {
                mandatory: {
                    maxWidth: 640,
                    maxHeight: 480
                }
            }
        }).then((currentStream)=>{
            setStream(currentStream);
            myVideo.current.srcObject = currentStream;
        }).catch(err=>{
            console.log('Permission to access video is denied');
        });
        
        socket.emit('whatDoYouWant');
        socket.on('gimmeYourDetails', (id) => {
            var user = {name: props.name, uid: currentUser.uid};
            socket.emit('alreadySent', user);
            setMe(id);
        })

        socket.on('calluser', ({from, name: callerName, signal})=>{
            setCall({isReceivedCall: true, from, name: callerName, signal})
        });
    }, [props, currentUser, callEnded]);

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
    function elementDrag(event){
        event.preventDefault();
        pos1 = pos3 - event.clientX;
        pos2 = pos4 - event.clientY;
        pos3 = event.clientX;
        pos4 = event.clientY;
        // set the element's new position
        const videoCallDiv = videoDiv.current;
        videoCallDiv.style.top = (videoCallDiv.offsetTop - pos2) + "px";
        videoCallDiv.style.left = (videoCallDiv.offsetLeft - pos1) + "px";
    }

    const dragMouseDown = (event) => {
        event.preventDefault();
        pos3 = event.clientX;
        pos4 = event.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    const answerCall = () => {
        setCallAccepted(true);
        setCallEnded(false);

        const peer = new Peer({initiator: false, trickle: false, stream});

        peer.on('signal', (data)=>{
            socket.emit('answercall', {signal: data, to: call.from});
        });

        peer.on('stream', (currentStream)=>{
            userVideo.current.srcObject = currentStream;
        });

        peer.signal(call.signal);
        connectionRef.current = peer;
    }

    const callUser = (id) => {
        const peer = new Peer({initiator: true, trickle: false, stream});

        peer.on('signal', (data)=>{
            socket.emit('calluser', {userToCall: id, signalData: data, from: me, name});
        });

        peer.on('stream', (currentStream)=>{
            userVideo.current.srcObject = currentStream;
        });
        socket.on('callaccepted', (signal)=>{
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    }

    const leaveCall = () => {
        connectionRef.current.destroy();
        socket.disconnect();
        // window.location.reload();
        setStream(null);
        setMe('');
        setCall('');
        setCallAccepted(false);
        setCallEnded(false);
        setName('');
        setIdToCall('');
        setCallEnded(true);
    }

    const closeVideoWindow = () => {
        console.log('Clicking');
        const videoCallDiv = videoDiv.current;
        videoCallDiv.style.display = 'none';
    }

    return (
        <div className='VideoPlayer' ref={videoDiv}>
            <div className='windowClose' style={{display: callAccepted && !callEnded ? 'none' : 'block'}}>
                <i className="fas fa-window-close" onClick={closeVideoWindow}></i>
            </div>
            <div id='videoPlayer_topBar' onMouseDown={dragMouseDown}>Click to move</div>
            <div>
                {
                    stream && (
                        <div id='myVideoFrame'>
                            {/* <div>{name || 'Name'}</div> */}
                            <video playsInline muted ref={myVideo} autoPlay id='myVideo'></video>
                        </div>
                    )
                }
                <div id='userVideoFrame'>
                    {
                        callAccepted && !callEnded && (
                            <video playsInline ref={userVideo} autoPlay id='userVideo'></video>
                            // console.log(userVideo),
                        )
                    }
                </div>
            </div>
            <div className='Options'>
                <div>
                    <div>
                        <div>Copy your ID</div>
                        <CopyToClipboard text={me}>
                            <i className="far fa-clipboard" style={{marginTop: '20px'}}></i>
                        </CopyToClipboard>
                    </div>
                    <div>
                        <input id='input_special1' type='text' value={idToCall} onChange={e=>setIdToCall(e.target.value)}  />
                            {
                            callAccepted && !callEnded ? (
                                <i className="fas fa-phone-slash" onClick={leaveCall}></i>
                            ) : (
                                <i className="fas fa-phone" onClick={()=>callUser(idToCall)} id='letsCall'></i>
                            )
                        }
                    </div>
                </div>
                <div className='Notifications'>
                {
                    call.isReceivedCall && !callAccepted && (
                        <div styles={{display: 'flex', justifyContent: 'center'}}>
                            <h1>{props.name} is calling</h1>
                            <button onClick={answerCall}>Answer</button>
                        </div>
                    )
                }
                </div>
            </div>

        </div>
    )
}
export default VideoPlayer