import { formatDate } from './pages/_app';
import { User } from './shared/models/User';
import { Grid } from './shared/models/Grid';
import { List } from './shared/models/List';
import { Item } from './shared/models/Item';
import { Task } from './shared/models/Task';
import { initializeApp } from 'firebase/app';
import { Board } from './shared/models/Board';
import { Email } from './shared/models/Email';
import { logToast, userQueryFields } from './shared/constants';
import { GoogleAuthProvider, browserLocalPersistence, deleteUser, getAuth, setPersistence } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, getFirestore, onSnapshot, orderBy, query, updateDoc, where, writeBatch } from 'firebase/firestore';

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

setPersistence(auth, browserLocalPersistence);

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

export const dbCollections = {
  users: usersTable,
  email: emailsTable,
  grids: gridsTable,
  board: boardsTable,
  lists: listsTable,
  items: itemsTable,
  tasks: tasksTable,
}

export const collectionNames = Object.values(dbCollections);

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
    const emailToSet = new Email(usr) as Email;
    const batchUserAddOperation = writeBatch(db);
    const userReference = await doc(db, usersTable, usr?.id)?.withConverter(userConverter);
    const emailReference = await doc(db, emailsTable, emailToSet?.id)?.withConverter(emailConverter);
    await batchUserAddOperation.set(userReference, usr as User);
    await batchUserAddOperation.set(emailReference, emailToSet as Email);
    await batchUserAddOperation.commit();
  } catch (addUserError) {
    logToast(`Error Adding User to Database ${usersTable}`, addUserError, true);
  }
}

export const updateUserFields = async (user_id: string, updates: Partial<User>, logResult = true) => {
  try {
    const userRef = await doc(db, usersTable, user_id).withConverter(userConverter);
    await updateDoc(userRef, updates);
    if (logResult) console.log(`User Fields Updated in Database`, updates);
  } catch (updateUserError) {
    logToast(`Error Updating User ${user_id} Fields`, updateUserError, true, updates);
  }
}

export const updateUserFieldsWTimeStamp = async (user_id: string, updates: Partial<User>, logResult = true) => {
  const now = formatDate(new Date());
  const fields = { ...updates, meta: { updated: now } };
  try {
    const userRef = await doc(db, usersTable, user_id).withConverter(userConverter);
    await updateDoc(userRef, fields);
    if (logResult) console.log(`User Fields Updated in Database`, fields);
  } catch (updateUserFieldsError) {
    logToast(`Error Updating User ${user_id} Fields w/ Timestamp`, updateUserFieldsError, true, fields);
  }
}

export const listenToCollections = (arrayOfIds, tableName, converter, Class, callback) => {
  if (!arrayOfIds || arrayOfIds.length === 0) return;
  const collectionQuery = query(collection(db, tableName), where(`id`, `in`, arrayOfIds))?.withConverter(converter);
  return onSnapshot(collectionQuery, (snapshot) => {
    const documents = snapshot.docs.map(doc => new Class({ ...doc.data() }));
    console.log(`${tableName} Updated`, documents);
    callback(documents);
  });
}

export const listenToGrid = (grid_id, callback) => {
  if (!grid_id) return;
  return listenToCollections([grid_id], gridsTable, gridConverter, Grid, callback);
}

export const listenToBoards = (board_ids, callback) => {
  if (!board_ids || board_ids.length === 0) return;
  return listenToCollections(board_ids, boardsTable, boardConverter, Board, callback);
}

export const listenToLists = (list_ids, callback) => {
  if (!list_ids || list_ids.length === 0) return;
  return listenToCollections(list_ids, listsTable, listConverter, List, callback);
}

export const listenToItems = (item_ids, callback) => {
  if (!item_ids || item_ids.length === 0) return;
  return listenToCollections(item_ids, itemsTable, itemConverter, Item, callback);
}

export const listenToTasks = (task_ids, callback) => {
  if (!task_ids || task_ids.length === 0) return;
  return listenToCollections(task_ids, tasksTable, taskConverter, Task, callback);
}

export const getBoardsFromBoardIds = async (board_ids) => {
  let boardsFromBoardIds = [];
  const boardsDatabase = await collection(db, boardsTable)?.withConverter(boardConverter);
  const boardsQuery = await query(boardsDatabase, where(`id`, `in`, board_ids));
  const boardsToGet = await getDocs(boardsQuery);
  if (boardsToGet) {
    boardsToGet.forEach(doc => {
      boardsFromBoardIds.push(new Board({ ...doc.data() }));
    });
  }
  return boardsFromBoardIds;
}

export const deleteUserAuth = async (usr: User) => {
  const currentUser = auth.currentUser;
  if (usr == null || !currentUser) {
    await logToast(`Error Deleting User Not Signed In`, ``, true);
    return;
  }
  try {
    await deleteUser(currentUser);
    return usr?.email;
  } catch (deleteUserError) {
    await logToast(`Error Deleting User ${usr?.email} from Authentication`, deleteUserError, true);
  }
}

export const deleteUserData = async (email: string) => {
  try {
    let deletedDocumentIds = [];
    for (const collectionName of collectionNames) {
      const q = query(collection(db, collectionName), where(`email`, `==`, email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (document) => {
        deletedDocumentIds.push(document?.id);
        await deleteDoc(document.ref);
      });
    }
    return deletedDocumentIds;
  } catch (deleteUserDataError) {
    await logToast(`Error Deleting User Data for ${email}`, deleteUserDataError, true);
  }
}

export default firebaseApp;