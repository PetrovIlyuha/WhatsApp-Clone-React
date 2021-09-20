import { useCollection } from 'react-firebase-hooks/firestore';
import { database } from '../firebase';
import { MESSAGES, ROOMS } from '../firebase-constants';

export default function useChatMessages(roomId) {
  const [snapshot] = useCollection(
    roomId
      ? database
          .collection(ROOMS)
          .doc(roomId)
          .collection(MESSAGES)
          .orderBy('timestamp', 'asc')
      : null,
  );

  const messages = snapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return messages;
}
