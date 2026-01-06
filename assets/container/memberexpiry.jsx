import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseconfig';

// Utility to fetch and calculate remaining days
async function getMemberPlanRemainingDays(adminId, memberId) {
  try {
    const planDocRef = doc(db, 'admin', adminId, 'members', memberId, 'plandetails', 'current');
    const planDocSnap = await getDoc(planDocRef);
    if (!planDocSnap.exists()) return 'N/A';
    const planData = planDocSnap.data();
    if (!planData.planStartDate || !planData.planExpireDate) return 'N/A';
    // Convert Firestore Timestamp to JS Date
    const startDate = planData.planStartDate.toDate ? planData.planStartDate.toDate() : new Date(planData.planStartDate);
    const expiryDate = planData.planExpireDate.toDate ? planData.planExpireDate.toDate() : new Date(planData.planExpireDate);
    // Normalize to midnight
    expiryDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Calculate difference in days: expiryDate - today
    const diff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  } catch (e) {
    return 'N/A';
  }
}

// MemberExpiry component
const MemberExpiry = ({ adminId, memberId }) => {
  const [remainingDays, setRemainingDays] = useState('...');

  useEffect(() => {
    if (adminId && memberId) {
      getMemberPlanRemainingDays(adminId, memberId).then(setRemainingDays);
    }
  }, [adminId, memberId]);

  return <Text>{remainingDays}</Text>;
};


export { getMemberPlanRemainingDays };
export default MemberExpiry;
