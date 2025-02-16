import { User } from './shared/models/User';
import { Grid } from './shared/models/Grid';
import { Board } from './shared/models/Board';
import { List } from './shared/models/List';
import { Item } from './shared/models/Item';
import { Task } from './shared/models/Task';
import { initializeApp } from 'firebase/app';
import { dev, formatDate } from './pages/_app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, onSnapshot, orderBy, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { logToast, userQueryFields } from './shared/constants';
import { Email } from './shared/models/Email';

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
  emails = `emails`,
  counts = `counts`,
  boards = `boards`,
  events = `events`,
  visits = `visits`,
  metrics = `metrics`,
  columns = `columns`,
  comments = `comments`,
  templates = `templates`,
  preferences = `preferences`,
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
export const emailsTable = environment + Tables.emails;
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

export const emailConverter = {
  toFirestore: (eml: Email) => {
    return JSON.parse(JSON.stringify(eml));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new Email(data);
  }
}

export const gridConverter = {
  toFirestore: (grd: Grid) => {
    return JSON.parse(JSON.stringify(grd));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new Grid(data);
  }
}

export const boardConverter = {
  toFirestore: (brd: Board) => {
    return JSON.parse(JSON.stringify(brd));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new Board(data);
  }
}

export const listConverter = {
  toFirestore: (lst: List) => {
    return JSON.parse(JSON.stringify(lst));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new List(data);
  }
}

export const itemConverter = {
  toFirestore: (itm: Item) => {
    return JSON.parse(JSON.stringify(itm));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new Item(data);
  }
}

export const taskConverter = {
  toFirestore: (tsk: Task) => {
    return JSON.parse(JSON.stringify(tsk));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new Task(data);
  }
}

export const getUsersFromDatabase = async (search: string | number) => {
  try {
    let foundUsers = [];
    const usersRef = collection(db, usersTable)?.withConverter(userConverter);
    const searchTerm = String(search).toLowerCase();
    const snapshot = await getDocs(query(usersRef, orderBy(`rank`))); 
    snapshot.forEach((doc) => {
      const userData = doc.data();
      const matches = userQueryFields.some(field => 
        userData[field] && String(userData[field]).toLowerCase() === searchTerm
      );
      if (matches) {
        foundUsers.push(new User({ ...userData }));
      }
    })
    return foundUsers.sort((a, b) => a.rank - b.rank);
  } catch (getUserError) {
    logToast(`Error Getting User from Database ${usersTable}`, getUserError, true);
  }
}

export const addUserToDatabase = async (usr: User) => {
  try {
    const batchUserAddOperation = writeBatch(db);
    const userReference = await doc(db, usersTable, usr?.ID)?.withConverter(userConverter);
    const emailReference = await doc(db, emailsTable, usr?.id)?.withConverter(emailConverter);
    await batchUserAddOperation.set(userReference, usr as User);
    await batchUserAddOperation.set(emailReference, new Email(usr) as Email);
    await batchUserAddOperation.commit();
  } catch (addUserError) {
    logToast(`Error Adding User to Database ${usersTable}`, addUserError, true);
  }
}

export const updateUserFields = async (userID: string, updates: Partial<User>, logResult = true) => {
  try {
    const userRef = await doc(db, usersTable, userID).withConverter(userConverter);
    await updateDoc(userRef, updates);
    if (logResult) console.log(`User Fields Updated in Database`, updates);
  } catch (updateUserError) {
    console.log(`Error Updating User ${userID} Fields`, { updateUserError, updates });
  }
}

export const updateUserFieldsInDatabase = async (userID: string, updates: Partial<User>, logResult = true) => {
  const now = formatDate(new Date());
  const fields = { ...updates, meta: { updated: now } };
  try {
    const userRef = await doc(db, usersTable, userID).withConverter(userConverter);
    await updateDoc(userRef, fields);
    if (logResult) console.log(`User Fields Updated in Database`, fields);
  } catch (updateUserFieldsError) {
    console.log(`Error Updating User ${userID} Fields`, { updateUserFieldsError, fields });
  }
}

export const listenToCollections = (arrayOfIDs, tableName, converter, Class, callback) => {
  if (!arrayOfIDs || arrayOfIDs.length === 0) return;
  const collectionQuery = query(collection(db, tableName), where(`ID`, `in`, arrayOfIDs))?.withConverter(converter);
  return onSnapshot(collectionQuery, (snapshot) => {
    const documents = snapshot.docs.map(doc => new Class({ ...doc.data() }));
    console.log(`${tableName} Updated`, documents);
    callback(documents);
  });
}

export const listenToGrid = (gridID, callback) => {
  if (!gridID) return;
  return listenToCollections([gridID], gridsTable, gridConverter, Grid, callback);
}

export const listenToBoards = (boardIDs, callback) => {
  if (!boardIDs || boardIDs.length === 0) return;
  return listenToCollections(boardIDs, boardsTable, boardConverter, Board, callback);
}

export const listenToLists = (listIDs, callback) => {
  if (!listIDs || listIDs.length === 0) return;
  return listenToCollections(listIDs, listsTable, listConverter, List, callback);
}

export const listenToItems = (itemIDs, callback) => {
  if (!itemIDs || itemIDs.length === 0) return;
  return listenToCollections(itemIDs, itemsTable, itemConverter, Item, callback);
}

export const listenToTasks = (taskIDs, callback) => {
  if (!taskIDs || taskIDs.length === 0) return;
  return listenToCollections(taskIDs, tasksTable, taskConverter, Task, callback);
}

export const getBoardsFromBoardIDs = async (boardIDs) => {
  let boardsFromBoardIDs = [];
  const boardsDatabase = await collection(db, boardsTable)?.withConverter(boardConverter);
  const boardsQuery = await query(boardsDatabase, where(`ID`, `in`, boardIDs));
  const boardsToGet = await getDocs(boardsQuery);
  if (boardsToGet) {
    boardsToGet.forEach(doc => {
      boardsFromBoardIDs.push(new Board({ ...doc.data() }));
    });
  }
  return boardsFromBoardIDs;
}

export default firebaseApp;