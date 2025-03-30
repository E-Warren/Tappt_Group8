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
    setName: (name: string) => void;
    setUserType: (userType: "student" | "teacher") => void;
    setRoomCode: (roomCode: string) => void;
    addStudent: (newStudent: string) => void;
    incClickCount: (by: number) => void;
    setIsClickable: (clickable: boolean) => void;
  }
  
export const useStudentStore = create<StudentState>((set) => ({ //creates a store that can be imported to other files
    name: "",
    userType: undefined,
    roomCode: "",
    students: [],
    currentTime: 30,
    clickCount: 0,
    isClickable: false,
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
    }
}));