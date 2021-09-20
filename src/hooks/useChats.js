import { useCollection } from 'react-firebase-hooks/firestore';
import { database } from '../firebase';
import { CHATS, USERS } from '../firebase-constants';

export default function useChats(user) {
  const [snapshot] = useCollection(
    user
      ? database
          .collection(USERS)
          .doc(user.uid)
          .collection(CHATS)
          .orderBy('timestamp', 'desc')
      : null,
  );

  return snapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}
