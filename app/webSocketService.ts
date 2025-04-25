import { useStudentStore } from "./useWebSocketStore";
import Config from './config';

//this file is the websocketservice, it handles all of the messages from the backend and updates zustand store

let webSocket: null | WebSocket = null;

export const WebSocketService = {
    createWebSocket: async () => {
        await new Promise<void>((resolve, reject) => {
            webSocket = new WebSocket(`${Config.WS_HOST}/join`); //creates a new websocket
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
                else if (message.type === "sentAnswerCorrectness") {
                    useStudentStore.setState({ ansCorrectness: message.data })
                }
                else if (message.type === "studentLeft"){
                    useStudentStore.getState().removeStudent(message.studentName);
                }
                else if (message.type === "hostLeft"){
                    //remove all students from the game
                    useStudentStore.getState().resetStudents();
                } 
                else if (message.type === "timeUp"){
                    console.log("Recieved the timeup message");
                    useStudentStore.setState({ isTimeUp: message.data });
                }
                else if (message.type === "sendToNextAnswer"){
                    console.log("Going to the next question")
                    useStudentStore.setState((state) => ({ 
                        nextQuestion: true,
                        isTimeUp: false,
                        currentTime: 30,
                        hasAnswered: false,
                        allStudentsAnswered: false,
                        ansCorrectness: "",
                        answerDist: [],
                        correctIndex: [],
                    }));
                } 
                else if (message.type === "gameHasEnded"){
                    console.log("Checking: ", useStudentStore.getState().name, " against ", message.name);
                    console.log("Recieved the websocket game has ended message");
                    useStudentStore.setState((state) => ({ 
                        nextQuestion: false,
                        gameEnded: true, 
                        startedGame: false,
                        name: "",
                        totalQuestions: 0,
                        currQuestionNum: 0,
                        clickCount: 0,
                        pointsPerClick: 1,
                        students: [],
                        deckID: -1,
                        roomCode: "",
                        answerDist: [],
                        answerChoices: [],
                        correctIndex: [],
                        bonus: "",
                        completedReading: false,
                    }));
                }
                else if (message.type === "clickingOver") {
                    useStudentStore.setState({ completedReading: true});
                } else if (message.type === "returnAnswers"){
                    console.log("Recieved the answers: ", message.data);
                    useStudentStore.setState({ 
                        answerDist: message.data, 
                    });
                }
                else if (message.type === "sentBonus") {
                    useStudentStore.setState({bonus: message.bonus})
                }
                else if (message.type === "updateAllScores") {
                    const { playername, clickCount } = message.data;
                    useStudentStore.getState().updateStudentScore(playername, clickCount);
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
    disconnect: () => {
        if (webSocket){
            webSocket.close(1000, "Joining a new game");
            webSocket = null;
        }
    }

}  