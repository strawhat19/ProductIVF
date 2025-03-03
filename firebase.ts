import { getIDParts } from './shared/ID';
import { formatDate } from './pages/_app';
import { User } from './shared/models/User';
import { Grid } from './shared/models/Grid';
import { List } from './shared/models/List';
import { Item } from './shared/models/Item';
import { Task } from './shared/models/Task';
import { initializeApp } from 'firebase/app';
import { Types } from './shared/types/types';
import { Board } from './shared/models/Board';
import { Feature } from './shared/admin/features';
import { countPropertiesInObject, logToast } from './shared/constants';
import { GoogleAuthProvider, browserLocalPersistence, deleteUser, getAuth, setPersistence } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where, WhereFilterOp, writeBatch } from 'firebase/firestore';

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
  features = `features`,
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
export const featuresTable = environment + Tables.features;

export const boardDataCollections = {
  lists: listsTable,
  items: itemsTable,
  tasks: tasksTable,
}

export const gridDataCollections = {
  boards: boardsTable,
  ...boardDataCollections,
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

export const featureConverter = {
  toFirestore: (feat: Feature) => {
    return JSON.parse(JSON.stringify(feat));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new Feature(data);
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
  [Types.Feature]: {
    tableName: featuresTable,
    converter: featureConverter,
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

export const addBoardToDatabase = async (board: Board, gridID: string, userID: string, newestBoardsOnTop: boolean = true) => {
  const { date } = getIDParts();
  const addBoardBatchOperation = await writeBatch(db);
  try {
    const boardRef = await doc(db, boardsTable, board.id);
    const userRef = await doc(db, usersTable, userID);
    const gridRef = await doc(db, gridsTable, gridID);

    await addBoardBatchOperation.set(boardRef, { ...board });

    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userBoardIDsToUse = userData.data?.boardIDs ?? [];
      const updatedUsersBoardIDs = newestBoardsOnTop
        ? [board.id, ...userBoardIDsToUse]
        : [...userBoardIDsToUse, board.id];
      addBoardBatchOperation.update(userRef, {
        [`meta.updated`]: date,
        [`data.boardIDs`]: updatedUsersBoardIDs,
        properties: countPropertiesInObject({ ...userData, data: { ...userData?.data, boardIDs: updatedUsersBoardIDs } }),
      });
    }

    const gridDoc = await getDoc(gridRef);
    if (gridDoc.exists()) {
      const gridData = gridDoc.data();
      const gridBoardIDsToUse = gridData.data?.boardIDs ?? [];
      const updatedGridsBoardIDs = newestBoardsOnTop
        ? [board.id, ...gridBoardIDsToUse]
        : [...gridBoardIDsToUse, board.id];
      addBoardBatchOperation.update(gridRef, {
        [`meta.updated`]: date,
        [`data.boardIDs`]: updatedGridsBoardIDs,
        properties: countPropertiesInObject({ ...gridData, data: { ...gridData?.data, boardIDs: updatedGridsBoardIDs } }),
      });
    }

    await addBoardBatchOperation.commit();
    return board;
  } catch (addBoardError) {
    await logToast(`Error Adding Board ${board?.name}`, addBoardError, true);
    return addBoardError;
  }
}

export const deleteBoardFromDatabase = async (board: Board) => {
  const { date } = getIDParts();
  const deleteBoardBatchOperation = await writeBatch(db);
  try {
    const boardRef = await doc(db, boardsTable, board?.id);

    const listsQuery = query(collection(db, listsTable), where(`boardID`, `==`, board.id));
    const listsSnapshot = await getDocs(listsQuery);

    for (const listDoc of listsSnapshot.docs) {
      const listRef = doc(db, listsTable, listDoc.id);
      deleteBoardBatchOperation.delete(listRef);
    }
    
    const itemsQuery = query(collection(db, itemsTable), where(`boardID`, `==`, board.id));
    const itemsSnapshot = await getDocs(itemsQuery);

    for (const itemDoc of itemsSnapshot.docs) {
      const itemRef = doc(db, itemsTable, itemDoc.id);
      deleteBoardBatchOperation.delete(itemRef);
    }

    const tasksQuery = query(collection(db, tasksTable), where(`boardID`, `==`, board.id));
    const tasksSnapshot = await getDocs(tasksQuery);

    for (const taskDoc of tasksSnapshot.docs) {
      const taskRef = doc(db, tasksTable, taskDoc.id);
      deleteBoardBatchOperation.delete(taskRef);
    }

    const usersRef = await collection(db, usersTable);
    const gridsRef = await collection(db, gridsTable);

    const usersQuery = await query(usersRef, where(`data.boardIDs`, `array-contains`, board.id));
    const usersSnapshot = await getDocs(usersQuery);

    usersSnapshot.forEach(userDoc => {
      const userRef = doc(db, usersTable, userDoc.id);
      const userData = userDoc.data();
      const updatedUsersBoardIDs = userData.data.boardIDs.filter((id: string) => id !== board.id);
      deleteBoardBatchOperation?.update(userRef, {
        [`meta.updated`]: date,
        [`data.boardIDs`]: updatedUsersBoardIDs,
        properties: countPropertiesInObject({ ...userData, data: { ...userData?.data, boardIDs: updatedUsersBoardIDs } }),
      });
    });

    const gridsQuery = query(gridsRef, where(`data.boardIDs`, `array-contains`, board.id));
    const gridsSnapshot = await getDocs(gridsQuery);

    gridsSnapshot.forEach(gridDoc => {
      const gridRef = doc(db, gridsTable, gridDoc.id);
      const gridData = gridDoc.data();
      const updatedGridsBoardIDs = gridData.data.boardIDs.filter((id: string) => id !== board.id);
      deleteBoardBatchOperation?.update(gridRef, {
        [`meta.updated`]: date,
        [`data.boardIDs`]: updatedGridsBoardIDs,
        properties: countPropertiesInObject({ ...gridData, data: { ...gridData?.data, boardIDs: updatedGridsBoardIDs } }),
      });
    });

    await deleteBoardBatchOperation?.delete(boardRef);
    await deleteBoardBatchOperation?.commit();
    return board;
  } catch (deleteBoardError) {
    await logToast(`Error Deleting Board ${board?.name}`, deleteBoardError, true);
    return deleteBoardError;
  }
}

export const addListToDatabase = async (list: List, boardID: string) => {
  const { date } = getIDParts();
  const addListBatchOperation = await writeBatch(db);
  try {
    const listsRef = await collection(db, listsTable);
    const listRef = await doc(db, listsTable, list?.id);
    const boardRef = await doc(db, boardsTable, boardID);

    const listsSnapshot = await getDocs(listsRef);
    const listsCount = listsSnapshot.size;

    await addListBatchOperation.set(listRef, { ...list, number: listsCount + 1 });
    
    const boardDoc = await getDoc(boardRef);
    if (boardDoc.exists()) {
      const boardData = boardDoc.data();
      const boardListIDsToUse = boardData.data?.listIDs ?? [];
      const updatedBoardsListIDs = [...boardListIDsToUse, list.id];
      addListBatchOperation.update(boardRef, {
        [`meta.updated`]: date,
        [`data.listIDs`]: updatedBoardsListIDs,
        properties: countPropertiesInObject({ ...boardData, data: { ...boardData?.data, listIDs: updatedBoardsListIDs } }),
      });
    }

    await addListBatchOperation.commit();
    return list;
  } catch (addListError) {
    await logToast(`Error Adding List ${list?.name}`, addListError, true);
    return addListError;
  }
}

export const deleteListFromDatabase = async (list: List) => {
  const { date } = getIDParts();
  const deleteListBatchOperation = await writeBatch(db);
  try {
    const boardsRef = await collection(db, boardsTable);
    const listRef = await doc(db, listsTable, list?.id);

    const itemsQuery = query(collection(db, itemsTable), where(`listID`, `==`, list.id));
    const itemsSnapshot = await getDocs(itemsQuery);

    for (const itemDoc of itemsSnapshot.docs) {
      const itemRef = doc(db, itemsTable, itemDoc.id);
      deleteListBatchOperation.delete(itemRef);
    }

    const tasksQuery = query(collection(db, tasksTable), where(`listID`, `==`, list.id));
    const tasksSnapshot = await getDocs(tasksQuery);

    for (const taskDoc of tasksSnapshot.docs) {
      const taskRef = doc(db, tasksTable, taskDoc.id);
      deleteListBatchOperation.delete(taskRef);
    }

    const boardsQuery = query(boardsRef, where(`data.listIDs`, `array-contains`, list.id));
    const boardsSnapshot = await getDocs(boardsQuery);

    boardsSnapshot.forEach(boardDoc => {
      const boardRef = doc(db, boardsTable, boardDoc.id);
      const boardData = boardDoc.data();
      const updatedBoardsListIDs = boardData.data.listIDs.filter((id: string) => id !== list.id);
      deleteListBatchOperation.update(boardRef, {
        [`meta.updated`]: date,
        [`data.listIDs`]: updatedBoardsListIDs,
        properties: countPropertiesInObject({ ...boardData, data: { ...boardData?.data, listIDs: updatedBoardsListIDs } }),
      });
    });

    await deleteListBatchOperation.delete(listRef);
    await deleteListBatchOperation.commit();
    return list;
  } catch (deleteListError) {
    await logToast(`Error Deleting List ${list?.name}`, deleteListError, true);
    return deleteListError;
  }
}

export const addItemToDatabase = async (item: Item, listID: string, boardID: string, updatedIDs: string[]) => {
  const { date } = getIDParts();
  const addItemBatchOperation = await writeBatch(db);
  try {
    const itemRef = await doc(db, itemsTable, item?.id);
    const itemsRef = await collection(db, itemsTable);
    const listRef = await doc(db, listsTable, listID);
    const boardRef = doc(db, boardsTable, boardID);

    const itemsSnapshot = await getDocs(itemsRef);
    const itemsCount = itemsSnapshot.size;

    await addItemBatchOperation.set(itemRef, { ...item, number: itemsCount + 1 });

    const boardDoc = await getDoc(boardRef);
    if (boardDoc.exists()) {
      const boardData = boardDoc.data();
      const boardItemIDsToUse = boardData.data?.itemIDs ?? [];
      const updatedBoardsItemIDs = [...boardItemIDsToUse, item?.id];
      addItemBatchOperation.update(boardRef, {
        [`meta.updated`]: date,
        [`data.itemIDs`]: updatedBoardsItemIDs,
        properties: countPropertiesInObject({ ...boardData, data: { ...boardData?.data, itemIDs: updatedBoardsItemIDs } }),
      });
    }
    
    const listDoc = await getDoc(listRef);
    if (listDoc.exists()) {
      const listData = listDoc.data();
      const updatedListItemIDs = updatedIDs;
      addItemBatchOperation.update(listRef, {
        [`meta.updated`]: date,
        [`data.itemIDs`]: updatedListItemIDs,
        properties: countPropertiesInObject({ ...listData, data: { ...listData?.data, itemIDs: updatedListItemIDs } }),
      });
    }

    await addItemBatchOperation.commit();
    return item;
  } catch (addItemError) {
    await logToast(`Error Adding Item ${item?.name}`, addItemError, true);
    return addItemError;
  }
}

export const dragItemToNewList = async (item: Item, sourceList: List, destinationList: List, updatedDestinationListItemIDs: string[]) => {
  const { date } = getIDParts();
  const dragItemToNewListBatchOperation = await writeBatch(db);
  try {
    const itemRef = await doc(db, itemsTable, item?.id);
    const sourceListRef = await doc(db, listsTable, sourceList?.id);
    const destinationListRef = await doc(db, listsTable, destinationList?.id);

    const itemDoc = await getDoc(itemRef);
    if (itemDoc.exists()) {
      dragItemToNewListBatchOperation.update(itemRef, {
        [`meta.updated`]: date,
        listID: destinationList?.id,
      })
    }

    const sourceListDoc = await getDoc(sourceListRef);
    if (sourceListDoc.exists()) {
      const sourceListData = sourceListDoc.data();
      const sourceListItemIDs = [...sourceListData?.data?.itemIDs];
      const updatedSourceListItemIDs = sourceListItemIDs?.filter(itmID => itmID != item?.id);
      dragItemToNewListBatchOperation.update(sourceListRef, {
        [`meta.updated`]: date,
        [`data.itemIDs`]: updatedSourceListItemIDs,
        properties: countPropertiesInObject({ ...sourceListData, data: { ...sourceListData?.data, itemIDs: updatedSourceListItemIDs } }),
      });
    }
    
    const destinationListDoc = await getDoc(destinationListRef);
    if (destinationListDoc.exists()) {
      const destinationListData = destinationListDoc.data();
      dragItemToNewListBatchOperation.update(destinationListRef, {
        [`meta.updated`]: date,
        [`data.itemIDs`]: updatedDestinationListItemIDs,
        properties: countPropertiesInObject({ ...destinationListData, data: { ...destinationListData?.data, itemIDs: updatedDestinationListItemIDs } }),
      });
    }

    const tasksQuery = query(collection(db, tasksTable), where(`itemID`, `==`, item.id));
    const tasksSnapshot = await getDocs(tasksQuery);
    for (const taskDoc of tasksSnapshot.docs) {
      const taskRef = doc(db, tasksTable, taskDoc.id);
      dragItemToNewListBatchOperation.update(taskRef, {
        listID: destinationList?.id,
      });
    }

    await dragItemToNewListBatchOperation.commit();
    return item;
  } catch (dragItemToNewListError) {
    await logToast(`Error Dragging Item ${item?.name}`, dragItemToNewListError, true);
    return dragItemToNewListError;
  }
}

export const deleteItemFromDatabase = async (item: Item) => {
  const { date } = getIDParts();
  const deleteItemBatchOperation = await writeBatch(db);
  try {
    const listsRef = await collection(db, listsTable);
    const boardsRef = await collection(db, boardsTable);
    const itemRef = await doc(db, itemsTable, item?.id);

    const tasksQuery = query(collection(db, tasksTable), where(`itemID`, `==`, item.id));
    const tasksSnapshot = await getDocs(tasksQuery);

    for (const taskDoc of tasksSnapshot.docs) {
      const taskRef = doc(db, tasksTable, taskDoc.id);
      deleteItemBatchOperation.delete(taskRef);
    }

    const listsQuery = query(listsRef, where(`data.itemIDs`, `array-contains`, item.id));
    const listsSnapshot = await getDocs(listsQuery);

    listsSnapshot.forEach(listDoc => {
      const listRef = doc(db, listsTable, listDoc.id);
      const listData = listDoc.data();
      const updatedListItemIDs = listData.data.itemIDs.filter((id: string) => id !== item.id);
      deleteItemBatchOperation.update(listRef, {
        [`meta.updated`]: date,
        [`data.itemIDs`]: updatedListItemIDs,
        properties: countPropertiesInObject({ ...listData, data: { ...listData?.data, itemIDs: updatedListItemIDs } }),
      });
    });

    const boardsQuery = query(boardsRef, where(`data.itemIDs`, `array-contains`, item.id));
    const boardsSnapshot = await getDocs(boardsQuery);

    boardsSnapshot.forEach(boardDoc => {
      const boardRef = doc(db, boardsTable, boardDoc.id);
      const boardData = boardDoc.data();
      const updatedBoardItemIDs = boardData.data.itemIDs.filter((id: string) => id !== item.id);
      deleteItemBatchOperation.update(boardRef, {
        [`meta.updated`]: date,
        [`data.itemIDs`]: updatedBoardItemIDs,
        properties: countPropertiesInObject({ ...boardData, data: { ...boardData?.data, itemIDs: updatedBoardItemIDs } }),
      });
    });

    await deleteItemBatchOperation.delete(itemRef);
    await deleteItemBatchOperation.commit();
    return item;
  } catch (deleteItemError) {
    await logToast(`Error Deleting Item ${item?.name}`, deleteItemError, true);
    return deleteItemError;
  }
}

export const addTaskToDatabase = async (task: Task, itemID: string, listID: string, updatedTaskIDs: string[]) => {
  const { date } = getIDParts();
  const addTaskBatchOperation = await writeBatch(db);
  try {
    const tasksRef = await collection(db, tasksTable);
    const taskRef = await doc(db, tasksTable, task?.id);
    const itemRef = await doc(db, itemsTable, itemID);
    const listRef = await doc(db, listsTable, listID);

    const tasksSnapshot = await getDocs(tasksRef);
    const tasksCount = tasksSnapshot.size;

    await addTaskBatchOperation.set(taskRef, { ...task, number: tasksCount + 1 });

    const listDoc = await getDoc(listRef);
    if (listDoc.exists()) {
      const listData = listDoc.data();
      addTaskBatchOperation.update(listRef, {
        [`meta.updated`]: date,
        [`data.taskIDs`]: updatedTaskIDs,
        properties: countPropertiesInObject({ ...listData, data: { ...listData?.data, taskIDs: updatedTaskIDs } }),
      });
    }

    const itemDoc = await getDoc(itemRef);
    if (itemDoc.exists()) {
      const itemData = itemDoc.data();
      addTaskBatchOperation.update(itemRef, {
        [`meta.updated`]: date,
        [`data.taskIDs`]: updatedTaskIDs,
        properties: countPropertiesInObject({ ...itemData, data: { ...itemData?.data, taskIDs: updatedTaskIDs } }),
      });
    }

    await addTaskBatchOperation.commit();
    return task;
  } catch (addTaskError) {
    await logToast(`Error Adding Task ${task?.name}`, addTaskError, true);
    return addTaskError;
  }
}

export const deleteTaskFromDatabase = async (task: Task) => {
  const { date } = getIDParts();
  const deleteTaskBatchOperation = await writeBatch(db);
  try {
    const itemsRef = await collection(db, itemsTable);
    const listsRef = await collection(db, listsTable);
    const taskRef = await doc(db, tasksTable, task?.id);

    const listsQuery = query(listsRef, where(`data.taskIDs`, `array-contains`, task?.id));
    const listsSnapshot = await getDocs(listsQuery);

    listsSnapshot.forEach(listDoc => {
      const listRef = doc(db, listsTable, listDoc.id);
      const listData = listDoc.data();
      const updatedListTaskIDs = listData.data.taskIDs.filter((id: string) => id !== task?.id);
      deleteTaskBatchOperation.update(listRef, {
        [`meta.updated`]: date,
        [`data.taskIDs`]: updatedListTaskIDs,
        properties: countPropertiesInObject({ ...listData, data: { ...listData?.data, taskIDs: updatedListTaskIDs } }),
      });
    });

    const itemsQuery = query(itemsRef, where(`data.taskIDs`, `array-contains`, task?.id));
    const itemsSnapshot = await getDocs(itemsQuery);

    itemsSnapshot.forEach(itemDoc => {
      const itemRef = doc(db, itemsTable, itemDoc.id);
      const itemData = itemDoc.data();
      const updatedItemTaskIDs = itemData.data.taskIDs.filter((id: string) => id !== task?.id);
      deleteTaskBatchOperation.update(itemRef, {
        [`meta.updated`]: date,
        [`data.taskIDs`]: updatedItemTaskIDs,
        properties: countPropertiesInObject({ ...itemData, data: { ...itemData?.data, taskIDs: updatedItemTaskIDs } }),
      });
    });

    await deleteTaskBatchOperation.delete(taskRef);
    await deleteTaskBatchOperation.commit();
    return task;
  } catch (deleteTaskError) {
    await logToast(`Error Deleting Task ${task?.name}`, deleteTaskError, true);
    return deleteTaskError;
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
      [`meta.updated`]: now,
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