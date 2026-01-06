// Utility to fetch current plan details for a member from Firestore
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseconfig';

/**
 * Fetches the current plan details for a member from Firestore.
 * @param {string} adminId - The admin ID.
 * @param {string} memberId - The member ID.
 * @returns {Promise<Object|null>} The plan details object, or null if not found.
 */
export async function getCurrentPlanDetails(adminId, memberId) {
  try {
    const planRef = doc(db, 'admin', adminId, 'members', memberId, 'plandetails', 'current');
    const planSnap = await getDoc(planRef);
    if (planSnap.exists()) {
      return { id: planSnap.id, ...planSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching current plan details:', error);
    return null;
  }
}
