import { Server } from "socket.io";
import { createAdapter } from "@socket.io/postgres-adapter";
import { db } from "./firebase/firebaseConfig.js";
import { addDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";


const io = new Server({
    cors: '*'
});


io.on('connection', (socket) => {
    console.log('user connected')
    socket.on('message', async (msg, roomname, sender, receiver) => {
        // console.log(`msg: ${msg} roomname: ${roomname}`);


        socket.to(roomname).emit('message', msg)

        let time = new Date().getTime()
        console.log(time)
        const chatDocRef = doc(db, 'messages', roomname)
        const chatDocSnap = await getDoc(chatDocRef)

        if (chatDocSnap.exists()) {
            await updateDoc(chatDocRef, {
                [time]: {
                    sender: sender,
                    msg: msg
                }
            })
        }
        else {
            await setDoc(chatDocRef, {
                [time]: {
                    sender: sender,
                    msg: msg
                }
            })
        }

        // uid split
        let uid1 = roomname.slice(0, 5)
        let uid2 = roomname.slice(5, 10)
        console.log(`${uid1} + ${uid2}`);

        const uid1DocRef = doc(db, 'contacts', sender)
        const uid1DocSnap = await getDoc(uid1DocRef)

        const uid2DocRef = doc(db, 'contacts', receiver)
        const uid2DocSnap = await getDoc(uid2DocRef)


        if (uid1DocSnap.exists()) {
            await updateDoc(uid1DocRef, {
                [receiver]: roomname
            })
        }
        else {
            await setDoc(uid1DocRef, {
                [receiver]: roomname
            })
        }
        if (uid2DocSnap.exists()) {
            await updateDoc(uid2DocRef, {
                [sender]: roomname
            })
        }
        else {
            await setDoc(uid2DocRef, {
                [sender]: roomname
            })
        }


    })
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId)
        console.log(`connected to ${roomId}`);
    })
    socket.on('disconnect', () => {
        console.log('disconnected');
    })
})

io.listen(5000)

console.log('hi');