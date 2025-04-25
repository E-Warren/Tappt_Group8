import { create } from "zustand";
import { WebSocketService } from "./webSocketService";

// This file is used to store the clients information using zustand
//allows the user's information to be accessed through other files

//bundle student name and clickCount in one object (to be used in an array)
interface Student {
    name: string;
    clickCount: number;
}

interface StudentState {

    //student properties
    name: string; //stores the user's name
    userType?: "student" | "teacher"; //stores the user's type
    clickCount: number;
    pointsPerClick: number;


    //game properties
    roomCode: string;
    students: Student[];
    deckID: number;


    //status properties
    currentTime: number;
    isClickable: boolean;
    startedGame: boolean;
    allStudentsAnswered: boolean;
    currQuestionNum: number;
    ansCorrectness: string;
    totalQuestions: number;
    isTimeUp: boolean;
    hasAnswered: boolean;
    nextQuestion: boolean;
    gameEnded: boolean;
    completedReading: boolean;
    answerDist: number[];
    correctIndex: number[];
    answerChoices: string[];
    bonus: string;


    //sets - student properties
    setName: (name: string) => void;
    setUserType: (userType: "student" | "teacher") => void;
    incClickCount: (by: number) => void;
    setPointsPerClick: (pointsPerClick: number) => void;
    
    //sets - game properties
    setRoomCode: (roomCode: string) => void;
    resetStudents: Function;
    addStudent: (newStudent: string) => void;
    removeStudent: (studentName: string) => void;
    setDeckID: (deckID: number) => void;
    resetGame: Function;
    updateStudentScore: (name: string, newCount: number) => void;


    //sets - status properties
    setIsClickable: (clickable: boolean) => void;
    setStartedGame: (startedGame: boolean) => void;
    setAllStudentsAnswered: (allStudentsAnswered: boolean) => void;
    setCurrQuestionNum: (currQuestionNum: number) => void;
    setAnsCorrectness: (ansCorrectness: string) => void;
    setTotalQuestions: (totalQuestions: number) => void;
    setCompletedReading: (completedReading: boolean) => void;
    setNextQuestion: (nextQuestion: boolean) => void;
    setBonus: (bonus: string) => void;
  }
  
export const useStudentStore = create<StudentState>((set, get) => ({ //creates a store that can be imported to other files
    
    //student
    name: "",
    userType: undefined,
    clickCount: 0,
    pointsPerClick: 1,

    //game
    roomCode: "",
    students: [],
    deckID: -1,

    //status
    currentTime: 30,
    isClickable: false,
    startedGame: false,
    allStudentsAnswered: false,
    currQuestionNum: 0,
    ansCorrectness: "",
    totalQuestions: 0,
    isTimeUp: false,
    hasAnswered: false,
    nextQuestion: false,
    gameEnded: false,
    completedReading: false,
    answerDist: [],
    correctIndex: [],
    answerChoices: [],
    bonus: "",


    //student
    setName: (name) => {
        console.log("Name: ", name);
        set({ name })},
    setUserType: (userType) => {
        set({ userType });
    },
    incClickCount: (by: number) => {
        set((state) => {
            const newCount = state.clickCount + by;
            // WebSocketService.sendMessage(JSON.stringify({
            //     type: "updateScore",
            //     data: {
            //         name: state.name,
            //         clickCount: newCount,
            //     }
            // }));
            return { clickCount: newCount };
        });
    },
    setPointsPerClick: (pointsPerClick) => {
        console.log("new points per click: ", pointsPerClick);
        set({ pointsPerClick })
    },



    //game
    setRoomCode: (roomCode) => {
        set({ roomCode });
    },
    resetStudents: () => {
        set({students: []});
    },
    addStudent: (newStudent) => {
        set((state) => ({
            students: [...state.students, { name: newStudent, clickCount: 0 }]
        }));
        console.log("students array: ", get().students);
    },
    setDeckID: (deckID) => {
        console.log("deckID: ", deckID);
        set({deckID});
    },
    removeStudent: (studentName) => {
        set((state) => ({
            students: state.students.filter((student) => student.name !== studentName)
        }));
    },  
    resetGame: () => {
        set({name: "",
            roomCode: "",
            students: [],
            currentTime: 30,
            clickCount: 0,
            pointsPerClick: 1,
            isClickable: false,
            deckID: -1,
            startedGame: false,
            allStudentsAnswered: false,
            currQuestionNum: 0,
            totalQuestions: 0,
            isTimeUp: false,
            hasAnswered: false,
            nextQuestion: false,
            gameEnded: false,
            completedReading: false,
        })
    },
    updateStudentScore: (name: string, newCount: number) => {
        set((state) => ({
            students: state.students.map(student =>
                student.name === name ? { ...student, clickCount: newCount } : student
            )
        }));
    }, 


    //status
    setIsClickable: (clickable) => {
        (set((state) => ({ isClickable: clickable })));
    },
    setStartedGame: (startedGame) => {
        console.log("startedGame?: ", startedGame);
        set({startedGame});
    },
    setAllStudentsAnswered: (allStudentsAnswered) => {
        set({allStudentsAnswered});
    },
    setCurrQuestionNum: (currQuestionNum) => {
        set({currQuestionNum});
    },
    setAnsCorrectness: (ansCorrectness) => {
        set ({ansCorrectness});
    },
    setTotalQuestions: (totalQuestions) => {
        console.log("Setting total questions to: ", totalQuestions);
        set ({totalQuestions});
    },
    setCompletedReading: (completedReading) => {
        console.log("reading done");
        set ({completedReading});
    },
    setNextQuestion: (nextQuestion) => {
        set({nextQuestion});
    },
    setBonus: (bonus) => {
        set({ bonus });
    },
}));