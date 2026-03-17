import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export type MaterialFormat = 'pdf' | 'ppt' | 'image' | 'link';
export type MaterialResourceType = 'raw' | 'image' | 'link';

export interface StudyMaterial {
  id: string;
  userId: string;
  url: string;
  name: string;
  format: MaterialFormat;
  resourceType: MaterialResourceType;
  size?: number; // Size in bytes
  createdAt: Timestamp;
}

export const saveStudyMaterial = async (
  userId: string,
  materialData: Omit<StudyMaterial, 'id' | 'userId' | 'createdAt'>
): Promise<StudyMaterial> => {
  const materialsRef = collection(db, `users/${userId}/materials`);
  const newMaterialRef = doc(materialsRef);
  
  const material: StudyMaterial = {
    ...materialData,
    id: newMaterialRef.id,
    userId,
    createdAt: Timestamp.now(),
  };

  await setDoc(newMaterialRef, material);
  return material;
};

export const getUserMaterials = async (userId: string): Promise<StudyMaterial[]> => {
  const materialsRef = collection(db, `users/${userId}/materials`);
  const q = query(materialsRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as StudyMaterial);
};

export const deleteStudyMaterial = async (userId: string, materialId: string): Promise<void> => {
  const materialRef = doc(db, `users/${userId}/materials`, materialId);
  await deleteDoc(materialRef);
};
