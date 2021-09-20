import { useDocument } from 'react-firebase-hooks/firestore';
import { database } from '../firebase';
import { ROOMS, USERS } from '../firebase-constants';

export default function useRoom(roomId, userId) {
  const isUserRoom = roomId.includes(userId);

  const doc = isUserRoom ? roomId?.replace(userId, '') : roomId;
  const getUsersOrRooms = isUserRoom ? USERS : ROOMS;

  const [snapshot] = useDocument(database.collection(getUsersOrRooms).doc(doc));

  if (!snapshot) return null;

  return {
    id: snapshot.id,
    photoURL:
      snapshot.photoURL ||
      `https://avatars.dicebear.com/api/human/${snapshot.id}.svg`,
    ...snapshot.data(),
  };
}
