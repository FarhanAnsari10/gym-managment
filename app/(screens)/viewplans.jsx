import { Picker } from '@react-native-picker/picker';
import { StyleSheet, Text, View } from 'react-native';

import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebaseconfig';

export default function UsePlan() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
    const unsub = onSnapshot(collection(db, 'admin', adminId, 'plans'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlans(list);
    });
    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Select a Plan</Text>
      <Picker
        selectedValue={selectedPlan}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedPlan(itemValue)}
      >
        <Picker.Item label="-- Select Plan --" value="" />
        {plans.map((plan) => (
          <Picker.Item
            key={plan.id}
            label={`${plan.name} - $${plan.price}`}
            value={plan.id}
          />
        ))}
      </Picker>
      {selectedPlan ? (
        <Text style={styles.selection}>
          Selected Plan: {
            plans.find(p => p.id === selectedPlan)?.name
          }
        </Text>
      ) : null}
    </View>
  );
}

//   return (
//     <View style={styles.container}>
//       <Text>Select a Plan</Text>
//       <Picker
//         selectedValue={selectedPlan}
//         style={styles.picker}
//         onValueChange={(itemValue) => setSelectedPlan(itemValue)}
//       >
//         <Picker.Item label="-- Select Plan --" value="" />
//         {plans.map((plan) => (
//           <Picker.Item
//             key={plan.id}
//             label={`${plan.name} - $${plan.price}`}
//             value={plan.id}
//           />
//         ))}
//       </Picker>
//       {selectedPlan ? (
//         <Text style={styles.selection}>
//           Selected Plan: {
//             plans.find(p => p.id === selectedPlan)?.name
//           }
//         </Text>
//       ) : null}
//     </View>
//   );
// }

const styles = StyleSheet.create({
  container: { padding: 20 },
  picker: { height: 50, width: '100%' },
  selection: { marginTop: 20, fontWeight: 'bold' },
});


import { auth } from '../../config/firebaseconfig';

