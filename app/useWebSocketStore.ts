import { create } from "zustand";

// This file is used to store the clients information using zustand
//allows the user's information to be accessed through other files

interface StudentState {
    name: string; //stores the user's name
    userType?: "student" | "teacher"; //stores the user's type
    roomCode: string;
    students: string[];
    currentTime: number;
    clickCount: number;
    isClickable: boolean;
    deckID: number;
    startedGame: boolean;
    allStudentsAnswered: boolean;
    currQuestionNum: number;
    ansCorrectness: string;
    totalQuestions: number;
    setName: (name: string) => void;
    setUserType: (userType: "student" | "teacher") => void;
    setRoomCode: (roomCode: string) => void;
    addStudent: (newStudent: string) => void;
    incClickCount: (by: number) => void;
    setIsClickable: (clickable: boolean) => void;
    setDeckID: (deckID: number) => void;
    setStartedGame: (startedGame: boolean) => void;
    setAllStudentsAnswered: (allStudentsAnswered: boolean) => void;
    setCurrQuestionNum: (currQuestionNum: number) => void;
    setAnsCorrectness: (ansCorrectness: string) => void;
    setTotalQuestions: (totalQuestions: number) => void;
  }
  
export const useStudentStore = create<StudentState>((set) => ({ //creates a store that can be imported to other files
    name: "",
    userType: undefined,
    roomCode: "",
    students: [],
    currentTime: 30,
    clickCount: 0,
    isClickable: false,
    deckID: -1,
    startedGame: false,
    allStudentsAnswered: false,
    currQuestionNum: 0,
    ansCorrectness: "",
    totalQuestions: 0,
    setName: (name) => {
        console.log("Name: ", name);
        set({ name })},
    setUserType: (userType) => {
        set({ userType });
    },
    setRoomCode: (roomCode) => {
        set({ roomCode });
    },
    addStudent: (newStudent) => {
        set((state) => ({ students: [...state.students, newStudent]}));
    },
    incClickCount: (by) => {
        (set((state) => ({ clickCount: state.clickCount + by })));
    },
    setIsClickable: (clickable) => {
        (set((state) => ({ isClickable: clickable })));
    },
    setDeckID: (deckID) => {
        console.log("deckID: ", deckID);
        set({deckID});
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
        set ({totalQuestions});
    },
}));