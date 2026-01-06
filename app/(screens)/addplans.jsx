import { Feather, MaterialIcons } from '@expo/vector-icons';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../config/firebaseconfig';
import { useTheme } from '../../context/ThemeContext';


export default function ViewPlans() {
  const { isDarkMode } = useTheme();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [editingId, setEditingId] = useState(null);

  const uid = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
  const querySnapshot = await getDocs(collection(db, 'admin', uid, 'plans'));
      const plansList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlans(plansList);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

 const handleDelete = (id) => {
  Alert.alert(
    "Confirm Deletion",
    "Are you sure you want to delete this plan?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'admin', uid, 'plans', id));
            fetchPlans();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ],
    { cancelable: true }
  );
};


  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('Error', 'Please enter both name and price.');
      return;
    }

    try {
  const planRef = collection(db, 'admin', uid, 'plans');
      if (editingId) {
        await updateDoc(doc(planRef, editingId), {
          name,
          price: parseFloat(price),
          duration,
        });
      } else {
        await addDoc(planRef, {
          name,
          price: parseFloat(price),
          duration,
        });
      }

      setName('');
      setPrice('');
      setDuration('');
      setEditingId(null);
      setModalVisible(false);
      fetchPlans();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleEdit = (plan) => {
    setName(plan.name);
    setPrice(String(plan.price));
    setDuration(String(plan.duration));
    setEditingId(plan.id);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.planName}>{item.name}</Text>
        <Text style={styles.planPrice}>₹{item.price}</Text>
        <Text style={styles.planPrice}>Months - {item.duration}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Feather name="edit" size={22} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 15 }}>
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#181818' : '#fff' }]}> 
      <Text style={[styles.heading, { color: isDarkMode ? '#fff' : '#181818' }]}>Your Plans</Text>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#232323' : '#f1f1f1' }]}> 
            <View>
              <Text style={[styles.planName, { color: isDarkMode ? '#fff' : '#181818' }]}>{item.name}</Text>
              <Text style={[styles.planPrice, { color: isDarkMode ? '#fff' : '#333' }]}>₹{item.price}</Text>
              <Text style={[styles.planPrice, { color: isDarkMode ? '#fff' : '#333' }]}>Months - {item.duration}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Feather name="edit" size={22} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 15 }}>
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshing={loading}
        onRefresh={fetchPlans}
        ListEmptyComponent={<Text style={{ color: isDarkMode ? '#fff' : '#181818' }}>No plans found.</Text>}
      />

      {/* Floating + Button */}
      <TouchableOpacity
        style={[styles.floatingBtn, { backgroundColor: isDarkMode ? '#007bff' : '#007bff' }]}
        onPress={() => {
          setName('');
          setPrice('');
          setDuration('');
          setEditingId(null);
          setModalVisible(true);
        }}
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#232323' : '#fff' }]}> 
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#181818' }]}>{editingId ? 'Edit Plan' : 'Add New Plan'}</Text>
            <TextInput
              placeholder="Plan Name"
              placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
              value={name}
              onChangeText={setName}
              style={[styles.input, { color: isDarkMode ? '#fff' : '#181818', borderColor: isDarkMode ? '#444' : '#ccc', backgroundColor: isDarkMode ? '#181818' : '#fff' }]}
            />
            <TextInput
              placeholder="Plan Duration in Months"
              placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              style={[styles.input, { color: isDarkMode ? '#fff' : '#181818', borderColor: isDarkMode ? '#444' : '#ccc', backgroundColor: isDarkMode ? '#181818' : '#fff' }]}
            />
            <TextInput
              placeholder="Plan Price"
              placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={[styles.input, { color: isDarkMode ? '#fff' : '#181818', borderColor: isDarkMode ? '#444' : '#ccc', backgroundColor: isDarkMode ? '#181818' : '#fff' }]}
            />
            <Button title={editingId ? 'Update' : 'Add'} onPress={handleSave} color={isDarkMode ? '#007bff' : undefined} />
            <Button title="Cancel" color={isDarkMode ? '#888' : 'gray'} onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 80,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 16,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingBtn: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#007bff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    margin: 30,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});
