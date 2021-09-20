import { useCollection } from 'react-firebase-hooks/firestore';
import { USERS } from '../firebase-constants';
import { database } from '../firebase';

export default function useUsers(user) {
  const [snapshot] = useCollection(
    database.collection(USERS).orderBy('timestamp', 'desc'),
  );

  const users = [];

  if (user) {
    snapshot?.docs.forEach(doc => {
      const id =
        doc.id > user.uid ? `${doc.id}${user.uid}` : `${user.uid}${doc.id}`;
      if (doc.id !== user.uid) {
        users.push({
          id,
          userID: doc.id,
          ...doc.data(),
        });
      }
    });
  }

  return users;
}
