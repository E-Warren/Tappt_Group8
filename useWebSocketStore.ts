import { create } from "zustand";

// This file is used to store the clients information using zustand
//allows the user's information to be accessed through other files

interface StudentState {
    name: string; //stores the user's name
    userType?: "student" | "teacher"; //stores the user's type
    roomCode: string;
    students: string[];
    setName: (name: string) => void;
    setUserType: (userType: "student" | "teacher") => void;
    setRoomCode: (roomCode: string) => void;
    addStudent: (newStudent: string) => void;
  }
  
export const useStudentStore = create<StudentState>((set) => ({ //creates a store that can be imported to other files
    name: "",
    userType: undefined,
    roomCode: "",
    students: [],
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
    }
}));