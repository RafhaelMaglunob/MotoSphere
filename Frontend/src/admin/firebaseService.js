import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// ================= USERS SERVICE =================
export const getUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const addUser = async (userData) => {
  try {
    const usersRef = collection(db, 'users');
    const docRef = await addDoc(usersRef, {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ================= DEVICES SERVICE =================
export const getDevices = async () => {
  try {
    const devicesRef = collection(db, 'devices');
    const snapshot = await getDocs(devicesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
};

export const getDeviceById = async (deviceId) => {
  try {
    const deviceRef = doc(db, 'devices', deviceId);
    const deviceSnap = await getDoc(deviceRef);
    if (deviceSnap.exists()) {
      return { id: deviceSnap.id, ...deviceSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching device:', error);
    throw error;
  }
};

export const addDevice = async (deviceData) => {
  try {
    const devicesRef = collection(db, 'devices');
    const docRef = await addDoc(devicesRef, {
      ...deviceData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding device:', error);
    throw error;
  }
};

export const updateDevice = async (deviceId, deviceData) => {
  try {
    const deviceRef = doc(db, 'devices', deviceId);
    await updateDoc(deviceRef, {
      ...deviceData,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating device:', error);
    throw error;
  }
};

export const deleteDevice = async (deviceId) => {
  try {
    const deviceRef = doc(db, 'devices', deviceId);
    await deleteDoc(deviceRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting device:', error);
    throw error;
  }
};

// ================= DASHBOARD SERVICE =================
export const getDashboardStats = async () => {
  try {
    const usersRef = collection(db, 'users');
    const devicesRef = collection(db, 'devices');
    const alertsRef = collection(db, 'alerts');
    
    const [usersSnap, devicesSnap, alertsSnap] = await Promise.all([
      getDocs(usersRef),
      getDocs(devicesRef),
      getDocs(query(alertsRef, where('status', '==', 'active')))
    ]);

    const onlineDevices = devicesSnap.docs.filter(
      doc => doc.data().status === 'Online'
    ).length;

    return {
      totalUsers: usersSnap.size,
      onlineDevices: onlineDevices,
      activeAlerts: alertsSnap.size,
      systemHealth: 99 // You can calculate this based on your logic
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getRecentAlerts = async (limitCount = 5) => {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(
      alertsRef, 
      orderBy('time_of_occurrence', 'desc'), 
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching recent alerts:', error);
    throw error;
  }
};

export const getSystemActivity = async (limitCount = 5) => {
  try {
    const activityRef = collection(db, 'systemActivity');
    const q = query(
      activityRef, 
      orderBy('timestamp', 'desc'), 
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching system activity:', error);
    throw error;
  }
};

// ================= ALERTS SERVICE =================
export const getAlerts = async () => {
  try {
    const alertsRef = collection(db, 'alerts');
    const snapshot = await getDocs(alertsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const addAlert = async (alertData) => {
  try {
    const alertsRef = collection(db, 'alerts');
    const docRef = await addDoc(alertsRef, {
      ...alertData,
      status: 'active',
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding alert:', error);
    throw error;
  }
};

export const updateAlert = async (alertId, alertData) => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await updateDoc(alertRef, alertData);
    return { success: true };
  } catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
};

// ================= REAL-TIME LISTENERS =================
export const subscribeToUsers = (callback) => {
  const usersRef = collection(db, 'users');
  return onSnapshot(usersRef, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(users);
  }, (error) => {
    console.error('Error in users subscription:', error);
  });
};

export const subscribeToDevices = (callback) => {
  const devicesRef = collection(db, 'devices');
  return onSnapshot(devicesRef, (snapshot) => {
    const devices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(devices);
  }, (error) => {
    console.error('Error in devices subscription:', error);
  });
};

export const subscribeToAlerts = (callback) => {
  const alertsRef = collection(db, 'alerts');
  const q = query(alertsRef, where('status', '==', 'active'));
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(alerts);
  }, (error) => {
    console.error('Error in alerts subscription:', error);
  });
};

export const subscribeToDashboardStats = (callback) => {
  return onSnapshot(
    collection(db, 'users'),
    async () => {
      try {
        const stats = await getDashboardStats();
        callback(stats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    },
    (error) => {
      console.error('Error in dashboard stats subscription:', error);
    }
  );
};
