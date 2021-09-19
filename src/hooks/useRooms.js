import { useCollection } from 'react-firebase-hooks/firestore';
import { database } from '../firebase';
import { ROOMS } from '../firebase-constants';

export default function useRooms() {
  const [snapshot] = useCollection(
    database.collection(ROOMS).orderBy('timestamp', 'desc'),
  );

  const rooms = snapshot?.docs.map(doc => ({
    id: doc.id,
    userID: doc.id,
    ...doc.data(),
  }));

  return rooms;
}
