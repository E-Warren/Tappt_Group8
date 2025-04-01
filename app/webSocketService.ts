import { useStudentStore } from "./useWebSocketStore";

//this file is the websocketservice, it handles all of the messages from the backend and updates zustand store

let webSocket: null | WebSocket = null;

export const WebSocketService = {
    createWebSocket: async () => {
        await new Promise<void>((resolve, reject) => {
            webSocket = new WebSocket('ws://localhost:5000/join'); //creates a new websocket
            webSocket.onopen = () => { //websocket was created fine
                console.log("Successfull!")
                resolve();
            }
            webSocket.onerror = () => { //websocket has errors
                console.log("Failed :(");
                reject();
            }
            webSocket.onmessage = (ev) => {
                const message = JSON.parse(ev.data);
                if (message.type === "newStudentName"){ //used when the backend sends the student name
                    useStudentStore.setState({ name: message.data }); //updates the student's name
                    useStudentStore.setState({ roomCode: message.code }); //update's the students room code
                }
                else if (message.type === "studentsInGame"){ //backend sends a list of students in the game
                    useStudentStore.setState({ students: message.data }); //updates the list of students in the game
                }
                else if (message.type === "generatedRoomCode"){ //used when the backend sends the room code to the teacher
                    useStudentStore.setState({ roomCode: message.data }); //sets the room code in zustand
                }
                else if (message.type === "newCountdown"){
                    useStudentStore.setState({ currentTime: message.timeLeft });
                }
                else if (message.type === "gameHasBegun") {  //backend sends to students that the game has begun
                    useStudentStore.setState({ startedGame : message.data });
                }
                else if (message.type === "sentDeckID") {
                    useStudentStore.setState({ deckID : message.data });
                }
                else if (message.type === "allStudentsAnsweredQuestion") {
                    useStudentStore.setState({ allStudentsAnswered : true });
                }
                else if (message.type === "studentLeft"){
                    useStudentStore.getState().removeStudent(message.studentName);
                }
                else if (message.type === "hostLeft"){
                    //remove all students from the game
                    useStudentStore.getState().resetStudents();
                }
                
                console.log(message);
            }
        })
    },
    sendMessage: (message: string) => {
        if (!webSocket){
            console.log("No websocket!");
            throw new Error("Aw shucks no websocket found");
        }
        webSocket.send(message);
    },

}  