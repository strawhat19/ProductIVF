import { dev, formatDate } from './pages/_app';
import { User } from './shared/models/User';
import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import { doc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';

export enum Environments {
  beta = `beta_`,
  production = ``,
  alpha = `alpha_`,
}

export enum Tables {
  users = `users`,
  items = `items`,
  lists = `lists`,
  tasks = `tasks`,
  grids = `grids`,
  counts = `counts`,
  boards = `boards`,
  events = `events`,
  visits = `visits`,
  metrics = `metrics`,
  columns = `columns`,
  comments = `comments`,
  templates = `templates`,
  notifications = `notifications`,
}

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: `select_account` });
export const googleProvider = provider;

const firebaseConfig = {
  appId: process.env.NEXT_PUBLIC_appId,
  apiKey: process.env.NEXT_PUBLIC_apiKey,
  projectId: process.env.NEXT_PUBLIC_projectId,
  authDomain: process.env.NEXT_PUBLIC_authDomain,
  storageBucket: process.env.NEXT_PUBLIC_storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

export const environment = Environments.production;
export const isProduction = process.env.NODE_ENV == `production`;
// export const environment = isProduction ? Environments.alpha : Environments.beta;

export const usersTable = environment + Tables.users;
export const gridsTable = environment + Tables.grids;
export const boardsTable = environment + Tables.boards;
export const listsTable = environment + Tables.lists;
export const itemsTable = environment + Tables.items;
export const tasksTable = environment + Tables.tasks;

export const userConverter = {
  toFirestore: (usr: User) => {
    return JSON.parse(JSON.stringify(usr));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new User(data);
  }
}

export const addUserToDatabase = async (usr: User) => {
  try {
    const userReference = await doc(db, usersTable, usr?.id).withConverter(userConverter);
    await setDoc(userReference, usr as User);
  } catch (error) {
    dev() && console.log(`Error Adding User to Database ${usersTable}`, error);
  }
}

export const updateUserFields = async (userID: string, updates: Partial<User>, logResult = true) => {
  try {
    const userRef = await doc(db, usersTable, userID).withConverter(userConverter);
    await updateDoc(userRef, updates);
    if (logResult) console.log(`User Fields Updated in Database`, updates);
  } catch (error) {
    console.log(`Error Updating User ${userID} Fields`, { error, updates });
  }
}

export const updateUserFieldsInDatabase = async (userID: string, updates: Partial<User>, logResult = true) => {
  const now = formatDate(new Date());
  const fields = { ...updates, meta: { updated: now } };
  try {
    const userRef = await doc(db, usersTable, userID).withConverter(userConverter);
    await updateDoc(userRef, fields);
    if (logResult) console.log(`User Fields Updated in Database`, fields);
  } catch (error) {
    console.log(`Error Updating User ${userID} Fields`, { error, fields });
  }
}

export default firebaseApp;