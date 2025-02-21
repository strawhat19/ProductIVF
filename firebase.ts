import { formatDate } from './pages/_app';
import { User } from './shared/models/User';
import { Grid } from './shared/models/Grid';
import { List } from './shared/models/List';
import { Item } from './shared/models/Item';
import { Task } from './shared/models/Task';
import { initializeApp } from 'firebase/app';
import { countPropertiesInObject, logToast } from './shared/constants';
import { Board } from './shared/models/Board';
import { GoogleAuthProvider, browserLocalPersistence, deleteUser, getAuth, setPersistence } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, getFirestore, query, setDoc, updateDoc, where, WhereFilterOp, writeBatch } from 'firebase/firestore';
import { Types } from './shared/types/types';

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
  profiles = `profiles`,
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
export const profilesTable = environment + Tables.profiles;
export const gridsTable = environment + Tables.grids;
export const boardsTable = environment + Tables.boards;
export const listsTable = environment + Tables.lists;
export const itemsTable = environment + Tables.items;
export const tasksTable = environment + Tables.tasks;

export const gridDataCollections = {
  boards: boardsTable,
  lists: listsTable,
  items: itemsTable,
  tasks: tasksTable,
}

export const userDataCollections = {
  grids: gridsTable,
  ...gridDataCollections,
}

export const usingCollections = {
  users: usersTable,
  ...userDataCollections,
}

export const dbCollections = {
  ...usingCollections,
  emails: emailsTable,
  profiles: profilesTable,
}

export const collectionNames = Object.values(usingCollections);
export const userDataCollectionNames = Object.values(userDataCollections);
export const gridDataCollectionNames = Object.values(gridDataCollections);

export const userConverter = {
  toFirestore: (usr: User) => {
    return JSON.parse(JSON.stringify(usr));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new User(data);
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

export const documentTypes = {
  [Types.User]: {
    tableName: usersTable,
    converter: userConverter,
  },
  [Types.Grid]: {
    tableName: gridsTable,
    converter: gridConverter,
  },
  [Types.Board]: {
    tableName: boardsTable,
    converter: boardConverter,
  },
  [Types.List]: {
    tableName: listsTable,
    converter: listConverter,
  },
  [Types.Item]: {
    tableName: itemsTable,
    converter: itemConverter,
  },
  [Types.Task]: {
    tableName: tasksTable,
    converter: taskConverter,
  },
}

export const addUserToDatabase = async (usr: User) => {
  try {
    const userReference = await doc(db, usersTable, usr?.id).withConverter(userConverter);
    await setDoc(userReference, usr as User);
  } catch (addUserError) {
    logToast(`Error Adding User to Database ${usersTable}`, addUserError, true);
  }
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

export const deleteDatabaseData = async (
  queryField: string, 
  operator: WhereFilterOp, 
  value: any, 
  tablesToUse: string[] = collectionNames,
) => {
  try {
    let deletedDocumentIds = [];
    for (const collectionName of tablesToUse) {
      const dataFieldQuery = query(collection(db, collectionName), where(queryField, operator, value));
      const dataQuerySnapshots = await getDocs(dataFieldQuery);
      if (!dataQuerySnapshots.empty) {
        const batchDeleteJob = writeBatch(db);
        dataQuerySnapshots.forEach(document => {
          deletedDocumentIds.push(document?.id);
          batchDeleteJob.delete(document?.ref);
        });
        await batchDeleteJob.commit();
      }
    }
    return deletedDocumentIds;
  } catch (deleteUserDataError) {
    await logToast(`Error Deleting Data for ${value}`, deleteUserDataError, true);
  }
}

export const updateDocFieldsWTimeStamp = async (
  document: Partial<User> | Partial<Grid> | Partial<Board> | Partial<List> | Partial<Item> | Partial<Task>, 
  updates: Partial<User> | Partial<Grid> | Partial<Board> | Partial<List> | Partial<Item> | Partial<Task> | any, 
  log = false,
) => {
  const now = formatDate(new Date());
  let { tableName, converter } = documentTypes[document?.type];
  try {
    const docRef = await doc(db, tableName, document?.id).withConverter(converter);
    const dataUpdate = JSON.stringify(updates)?.includes(`data.`);
    await updateDoc(docRef, {
      ...updates,
      'meta.updated': now,
      ...(dataUpdate && {
        properties: countPropertiesInObject(document),
      }),
    });
    if (log) console.log(`Fields Updated`, updates);
  } catch (updateDocFieldsWTimeStampError) {
    logToast(
      `Error Updating ${document?.type} ${document?.id} Fields w/ Timestamp ${now}`, 
      updateDocFieldsWTimeStampError, 
      true, 
      updates,
    );
  }
}

export default firebaseApp;