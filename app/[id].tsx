import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import { Button } from "react-native-paper";
import { Link, useNavigation, useRouter, useLocalSearchParams } from "expo-router";

interface Question { //question interface 
  questionText: string;
  answers: string[];
}

export default function CreateDeckScreen() {
  //using router for navigation
  const router = useRouter();
  const {id} = useLocalSearchParams();

  //getting rid of the /createdecks/[id] header at the top of the screen
  //get rid of this code and you'd know why I'm adding this
  const nav = useNavigation();
  React.useLayoutEffect(()=> {
    nav.setOptions({headerShown:false}); 
  }, 
  [nav]); 

  const [deckTitle, setDeckTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { questionText: "", answers: ["", "", "", ""] },
  ]);

  //getting deck info from backend
  useEffect(() => {
    const getDeck = async () => {
      const token = localStorage.getItem('token');
        //get deck with [id] from backend
        try {
            const response = await fetch(`http://localhost:5000/createdecks/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`

            },
            credentials: 'include', // Ensure cookies/sessions are sent

            });
    
            console.log("Response status:", response.status);
    
            const data = await response.json();
            console.log(data);
          
            //if response is 200 or 201, fetch deck found in params (id)
            if (response.ok) {
              console.log("Successfully got deck:", data);

              const deckName = data[0].fld_deck_name;

              //obtain questions array -> for setting current questions for us to view & edit
              const qArr = [];

              //add map so that every answer is appriopriately mapped to every question
              const qMap = new Map();

              //going through JSON data and mapping answers to questions
              data.forEach(row => { 
                if (!qMap.has(row.fld_card_q_pk)) {
                  qMap.set(row.fld_card_q_pk, {
                    questionText: row.fld_card_q,
                    answers: [],
                  });
                }
                  qMap.get(row.fld_card_q_pk).answers.push(row.fld_card_ans);
              });

              //map each question info to qArr
              qMap.forEach(question => qArr.push(question))

              //setting title, questions, and answers to be viewed
              setDeckTitle(deckName);
              setQuestions(qArr);

            } 
            else {
              //handling 404 (does not exist) error
              if (response.status == 404) {
                alert("Error fetching deck: deck does not exist.");
                //go back to view decks
                router.push("/view-decks");
              }
              //handling every other error code
              else {
                alert(data.message);
              }
            }
            
        } catch (error) {
            console.log("Error during deck fetch:", error);
            alert("Server error, please try again later.");
        }
    };

    //run function now if id exists
    if (id) {
      getDeck();
    }
  }, [id]);

  const addQuestion = () => { //add question feature 
    //to generate a lovely list of errors
    let badAns: string[] = [];

    //go through EACH and every question and answer to see if they're empty and/or they've reached
    //the max character limits
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].questionText.length < 1) {
          badAns.push(`Question ${i+1} is empty.`);
      }
      if (questions[i].questionText.length > 768) {
          badAns.push(`Question ${i+1} is exceeds 768 character limit.`);
      }
      for (let j = 0; j < 4; j++) {
          if (questions[i].answers[j].length < 1) {
              badAns.push(`Question ${i+1}: Answer ${j + 1} is empty.`);
          }
          if (questions[i].answers[j].length > 256) {
              badAns.push(`Question ${i+1}: Answer ${j + 1} exceeds the 256 character limit.`);
          }
      }
    }

    //check to see if there are any errors
    if (badAns.length != 0) {
      //add error message to beginning or errors
      badAns.unshift("Cannot add new question:")
      alert(badAns.join("\n"));
      return;
    }

    //else, add new question
    setQuestions([...questions, { questionText: "", answers: ["", "", "", ""] }]);
  };

  const updateQuestionText = (index: number, text: string) => { //update question text boxes 
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  const updateAnswer = (qIndex: number, aIndex: number, text: string) => { //update answer text boxes
    const updated = [...questions];
    updated[qIndex].answers[aIndex] = text;
    setQuestions(updated);
  };

  const handleSaveDeck = async () => { //save deck feature 
    //to generate a lovely list of errors
    let badAns: string[] = [];

    if (!deckTitle.trim()) {
      badAns.push("Deck title is required.");
    }

    //setting up character limits for deck titles
    if (deckTitle.length > 128) {
      badAns.push("Deck title needs to be below 128 characters.");
    }

    //go through EACH and every question and answer to see if they're empty and/or they've reached
    //the max character limits
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].questionText.length < 1) {
          badAns.push(`Question ${i+1} is empty.`);
      }
      if (questions[i].questionText.length > 768) {
          badAns.push(`Question ${i+1} is exceeds 768 character limit.`);
      }
      for (let j = 0; j < 4; j++) {
          if (questions[i].answers[j].length < 1) {
              badAns.push(`Question ${i+1}: Answer ${j + 1} is empty.`);
          }
          if (questions[i].answers[j].length > 256) {
              badAns.push(`Question ${i+1}: Answer ${j + 1} exceeds the 256 character limit.`);
          }
      }
    }

    //check to see if there are any errors
    if (badAns.length != 0) {
      badAns.unshift("Error(s):")
      alert(badAns.join("\n"));
      return;
    }


    //send updated deck to backend if no errors
    try {
      const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:5000/createdecks/${id}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          credentials: 'include', // Ensure cookies/sessions are sent
          body: JSON.stringify({
            deckTitle: deckTitle.trim(),
            QnA: questions,
          }),
        });
  
        console.log("Response status:", response.status);
  
        const data = await response.json();
        
        if (response.ok) {
          console.log("Successfully updated deck:", data);
          alert("Deck updated successfully!");
          router.push("/view-decks");
        } else {
          console.log("Cannot create deck:", data.message);
          alert(data.message);
        }
        
    } catch (error) {
        console.log("Error during deck creation:", error);
        alert("Server error, please try again later.");
    }
  };

  return ( //includes back button to view decks page 
    
    <ScrollView contentContainerStyle={styles.container}> 
        <View style={styles.headerContainer}>
            <Link href="/view-decks" style={styles.backButton}>
              ← Back
            </Link>
          </View>
      <Text style={styles.header}>Edit Deck</Text>
      <TextInput
        style={styles.input}
        placeholder="Deck Title"
        value={deckTitle}
        onChangeText={setDeckTitle}
      />
      {questions.map((q, qIndex) => (
        <View key={qIndex} style={styles.questionCard}>
          <TextInput
            style={styles.questionInput}
            placeholder="Type your question"
            value={q.questionText}
            onChangeText={(text) => updateQuestionText(qIndex, text)}
          />
          {q.answers.map((a, aIndex) => (
            <TextInput
              key={aIndex}
              style={styles.answerInput}
              placeholder={`Answer ${aIndex + 1}`}
              value={a}
              onChangeText={(text) => updateAnswer(qIndex, aIndex, text)}
            />
          ))}
        </View>
      ))}
      <Button mode="contained" onPress={addQuestion} style={styles.addButton}>
        + Add Question
      </Button>
      <Button mode="contained" onPress={handleSaveDeck} style={styles.saveButton}>
         Save Deck
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ //style and formatting for create decks screen 
  container: {
    padding: 20,
    backgroundColor: "#7F55E0FF",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    fontSize: 18,
    color: "#fff",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 18,
  },
  questionCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  questionInput: {
    fontSize: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  answerInput: {
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#6C5CE7",
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#00B894",
  },
});
