import React, { useState } from 'react'; 
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure Notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // Removed sound
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const scheduleNotifications = async (taskDateTime, taskTitle) => {
    const taskDateObj = new Date(taskDateTime);

    const currentTime = new Date();
    if (taskDateObj > currentTime) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'To-Do Reminder',
          body: `Task: ${taskTitle}`,
        },
        trigger: taskDateObj,
      });
    }
  };

  const addTask = async () => {
    if (!title.trim() || !date.trim() || !time.trim()) {
      Alert.alert('Error', 'Task title, date, and time are required.');
      return;
    }

    const taskDateTime = `${date}T${time}`;
    const newTask = {
      id: Date.now(),
      title,
      date,
      time,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setTitle('');
    setDate('');
    setTime('');

    await scheduleNotifications(taskDateTime, title); // Schedule notification for this task
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskContainer}>
      <TouchableOpacity onPress={() => toggleComplete(item.id)}>
        <Text style={[styles.taskTitle, item.completed && styles.completedTask]}>
          {item.title}
        </Text>
        <Text style={styles.taskDetails}>Date: {item.date}</Text>
        <Text style={styles.taskDetails}>Time: {item.time}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const pendingTasks = tasks.filter(task => !task.completed).length;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>To-Do List</Text>
      <Text style={styles.taskCount}>Pending: {pendingTasks}</Text>
      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Time (HH:MM, 24-hour)"
        value={time}
        onChangeText={setTime}
      />
      <TouchableOpacity style={styles.addButton} onPress={addTask}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  taskCount: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskDetails: {
    fontSize: 14,
    color: '#555',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  deleteText: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
});
