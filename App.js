import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  TextInput,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, HeaderTitle } from "@react-navigation/stack";
import { Entypo } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite"; //import sqlite

// create a database called notes.db
// this will create a folder in the phone file system
const db = SQLite.openDatabase("notes.db");

const SAMPLE_NOTES = [
  { title: "Walk the cat", id: "0", done: false },
  { title: "Buy fruits", id: "1", done: false },
  { title: "Walk the dog", id: "2", done: false },
  { title: "Buy milk", id: "3", done: false },
];

function NotesScreen({ navigation, route }) {
  const [notes, setNotes] = useState(SAMPLE_NOTES);

  // this is a function that will run when db creation runs successfully
  // so that it sets the setNotes array match whatever in the db
  function refreshNotes() {
    // goes into the db and reads
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM notes",
        null,
        (txtObj, { rows: { _array } }) => setNotes(_array),
        (txtObj, error) => console.log("Error", error)
      );
    });
  }

  // create DB on first run
  // useEffect runs ONCE after initial rendering
  useEffect(() => {
    db.transaction(
      (tx) => {
        tx.executeSql(`CREATE TABLE IF NOT EXISTS notes 
      (id INTEGER PRIMARY KEY AUTOINCREMENT, 
        title TEXT, 
        done INT);`);
      },
      null,
      refreshNotes
    );
  });

  useEffect(() => {
    if (route.params?.noteText) {
      // 1. to detect the text data received from Add Screen
      //another useEffect() : this time is to use it to detect route parameters has changed
      // this will only trigger when route.params.todoText changes
      // add a route prop in the function above
      // '?' is a JavaScript optional as it may or may not have params and to avoid crashing where there is no params.
      // const newNote = {
      //   title: route.params.noteText,
      //   id: notes.length.toString(),
      //   done: false,
      // };
      // setNotes([...notes, newNote]);

      // 2. insert directly to the db
      db.transaction(
        (tx) => {
          // tx.executeSql, the '?' will look for an array to fit it in
          tx.executeSql("INSERT INTO notes (done, title) VALUES (0,?)", [
            route.params.noteText,
          ]);
        },
        null,
        refreshNotes
      );
    }
  }, [route.params?.noteText]);

  // Adds the + button on the header top right
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Add")}>
          <Entypo
            name="new-message"
            size={24}
            color="black"
            style={{ marginRight: 20 }}
          />
        </TouchableOpacity>
      ),
    });

    // //with db
    // useEffect(() => {
    //   if (route.params?.text) {
    //     db.transaction((tx) => {
    //       tx.executeSql("INSERT INTO notes (done, value) VALUES (0, ?)", [
    //         route.params.text,
    //       ]);
    //     });

    //     const newNote = {
    //       title: route.params.text,
    //       done: false,
    //       id: notes.length.toString(),
    //     };
    //     setNotes([...notes, newNote]);
    //   }
    // }, [route.params?.text]);
  });

  // each time it renders, it displays the item title in the list SAMPLE_NOTES
  function renderItem({ item }) {
    return (
      <View style={styles.listItem}>
        <Text>{item.title}</Text>
      </View>
    );
  }

  //creates a FlatList to display the sample data
  return (
    <View style={styles.container}>
      <FlatList data={notes} renderItem={renderItem} style={styles.list} />
    </View>
  );
}

//define popup screen
function AddScreen({ navigation }) {
  const [noteText, setNoteText] = useState("");

  return (
    <View style={styles.container}>
      <Text>Add your todo</Text>
      {/* onChangeText is a function that receives a text input */}
      <TextInput
        style={styles.textInputStyle}
        onChangeText={(text) => setNoteText(text)}
      />
      {/* Passing the text input back to the NoteStack */}
      <Button
        onPress={() => navigation.navigate("Notes", { noteText })}
        title="Submit"
      />
      <Button onPress={() => navigation.goback()} title="Cancel" />
    </View>
  );
}

const NoteStack = createStackNavigator();

//NoteStack
function NotesStackScreen() {
  return (
    <NoteStack.Navigator>
      <NoteStack.Screen
        name="Notes"
        component={NotesScreen}
        options={{
          headerTitle: "Notes App",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
        }}
      />
    </NoteStack.Navigator>
  );
}

const Stack = createStackNavigator();

//embed NotesStackScreen in the main Stack screen
//mode="modal" will pop up. without this, it will push the entire and doesnt push the title bar
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator mode="modal" headerMode="none">
        <Stack.Screen
          name="NoteStack"
          component={NotesStackScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Add" component={AddScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleStyle: {
    fontWeight: "bold",
    fontSize: 30,
  },
  headerStyle: {
    height: 120,
    backgroundColor: "pink",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  list: {
    width: "100%",
  },

  listItem: {
    height: 40,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    paddingLeft: 20,
  },

  textInputStyle: {
    borderRadius: 10,
    color: "black",
    padding: 5,
    backgroundColor: "pink",
    margin: 10,
    width: "90%",
  },
});

// Components are instantiated(created), mounted(put into memory), rendered (put on the screen)
// useEffect (()=>{}, [])
