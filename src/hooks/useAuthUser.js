import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { createTimestamp, database } from '../firebase';
import { USERS } from '../firebase-constants';
import { auth } from '../firebase';

export default function useAuthUser() {
  const [user] = useAuthState(auth);
  useEffect(() => {
    if (user) {
      const ref = database.collection(USERS).doc(user.uid);
      ref.get().then(doc => {
        if (!doc.exists) {
          ref.set({
            name: user.displayName,
            photoURL: user.photoURL,
            timestamp: createTimestamp(),
          });
        }
      });
    }
  }, [user]);
  return user;
}
