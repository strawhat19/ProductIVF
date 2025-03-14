import { getIDParts } from './ID';
import { User } from './models/User';
import { GridTypes } from './types/types';
import { createGrid, Grid } from './models/Grid';
import { Board, createBoard } from './models/Board';
import { countPropertiesInObject } from './constants';

export const seedUserData = (user: User | any) => {
    let { uuid } = getIDParts();

    user = {
        ...user,
        uuid,
        id: user?.id + `_${uuid}`,
        ID: user?.ID + `_${uuid}`,
    }

    let board1 = createBoard(1, `Daily Tasks`, user, `135px`, 1);
    let board2 = createBoard(2, `Goals`, user, `85px`, 2);

    let board3 = createBoard(3, GridTypes.Work, user, `80px`, 3);
    let board4 = createBoard(4, `Reminders`, user, `145px`, 4);

    let board5 = createBoard(5, `Bills`, user, `80px`, 5);
    let board6 = createBoard(6, `Passwords`, user, `132.5px`, 6);

    let grid1 = createGrid(1, GridTypes.Personal, user, GridTypes.Personal, [
        board1?.id, 
        board2?.id,
    ], 1);

    let grid2 = createGrid(2, GridTypes.Work, user, GridTypes.Work, [
        board3?.id,
        board4?.id,
    ], 2);

    let grid3 = createGrid(3, GridTypes.Private, user, GridTypes.Private, [
        board5?.id, 
        board6?.id,
    ], 3);

    let grid4 = createGrid(4, GridTypes.Archived, user, GridTypes.Archived, [], 4);

    board1 = new Board({ ...board1, gridID: grid1?.id });
    board2 = new Board({ ...board2, gridID: grid1?.id });

    board3 = new Board({ ...board3, gridID: grid2?.id });
    board4 = new Board({ ...board4, gridID: grid2?.id });
    
    board5 = new Board({ ...board5, gridID: grid3?.id });
    board6 = new Board({ ...board6, gridID: grid3?.id });

    let grids = [grid1, grid2, grid3, grid4]?.map(grd => new Grid(grd));
    let boards = [board1, board2, board3, board4, board5, board6];

    let updatedUser = {
        ...user,
        ownerID: user?.id,
        lastSelectedGridID: grid1?.id,
        auth: {
            ...user?.auth,
            signedIn: true,
            lastSignIn: user?.meta?.updated,
            lastAttempt: user?.meta?.updated,
            lastAuthenticated: user?.meta?.updated,
        },
        data: {
            ...user?.data,
            users: [user?.email],
            selectedGridIDs: [grid1?.id],
            gridIDs: grids.map(gr => gr?.id),
            boardIDs: boards.map(br => br?.id),
        }
    }

    updatedUser.properties = countPropertiesInObject(updatedUser);

    let seedUserData = {
        grids,
        boards,
        user: updatedUser,
    }
    
    return seedUserData;
}

export const dbBoards = [{"created":"6:03 PM 5/27/2023","expanded":true,"name":"Example Draggable Board","columnOrder":["column_1_6_03_PM_5_27_2023_vua19vc5d","column_2_6_03_PM_5_27_2023_z6mtlms7c"],"columns":{"column_1_6_03_PM_5_27_2023_vua19vc5d":{"id":"column_1_6_03_PM_5_27_2023_vua19vc5d","title":"active","itemIds":["item_3_6_13_PM_5_27_2023_27vnmb2j2","item_3_6_15_PM_5_27_2023_lvza6sitz"],"itemType":"Item"},"column_2_6_03_PM_5_27_2023_z6mtlms7c":{"id":"column_2_6_03_PM_5_27_2023_z6mtlms7c","title":"complete","itemIds":["item_3_6_13_PM_5_27_2023_942tumtrc","item_1_6_08_PM_5_27_2023_s2egf8yu6","item_1_6_06_PM_5_27_2023_gqfn5z8cr"],"itemType":"Image"}},"id":"board_1_6_03_PM_5_27_2023_q1nmnvrpp","titleWidth":"207.5px","items":{"item_1_6_06_PM_5_27_2023_gqfn5z8cr":{"image":"","video":"","id":"item_1_6_06_PM_5_27_2023_gqfn5z8cr","subtasks":[{"id":"subtask_1_6_06_PM_5_27_2023_20jn2tf20","complete":true,"task":"Netflix","created":"6:06 PM 5/27/2023","updated":"6:08 PM 5/27/2023"},{"id":"subtask_4_6_06_PM_5_27_2023_fslx5f05w","complete":true,"task":"Car","created":"6:06 PM 5/27/2023","updated":"6:08 PM 5/27/2023"},{"id":"subtask_5_6_06_PM_5_27_2023_b7ji8l1se","complete":true,"task":"House","created":"6:06 PM 5/27/2023","updated":"6:08 PM 5/27/2023"}],"complete":true,"type":"Task","created":"6:06 PM 5/27/2023","content":"Pay Bills","updated":"6:08 PM 5/27/2023"},"item_1_6_08_PM_5_27_2023_s2egf8yu6":{"image":"","video":"","id":"item_1_6_08_PM_5_27_2023_s2egf8yu6","subtasks":[],"complete":true,"type":"Item","created":"6:08 PM 5/27/2023","content":"Testing New Board","updated":"6:08 PM 5/27/2023"},"item_3_6_13_PM_5_27_2023_942tumtrc":{"image":"","video":"","id":"item_3_6_13_PM_5_27_2023_942tumtrc","subtasks":[{"id":"subtask_1_6_13_PM_5_27_2023_w3ddkmv48","complete":false,"task":"Sub Task One","created":"6:13 PM 5/27/2023"},{"id":"subtask_2_6_17_PM_5_27_2023_3970zp8nd","complete":true,"task":"Completed Subtask","created":"6:17 PM 5/27/2023","updated":"6:17 PM 5/27/2023"}],"complete":false,"type":"Task","created":"6:13 PM 5/27/2023","content":"Create Subtasks","updated":"6:17 PM 5/27/2023"},"item_3_6_13_PM_5_27_2023_27vnmb2j2":{"image":"","video":"","id":"item_3_6_13_PM_5_27_2023_27vnmb2j2","subtasks":[],"complete":false,"type":"Item","created":"6:13 PM 5/27/2023","content":"Try Dragging Me","updated":"6:17 PM 5/27/2023"},"item_3_6_15_PM_5_27_2023_lvza6sitz":{"image":"https://user-images.githubusercontent.com/2182637/53614150-efbed780-3c2c-11e9-9204-a5d2e746faca.gif","video":"","id":"item_3_6_15_PM_5_27_2023_lvza6sitz","subtasks":[],"complete":false,"type":"Image","created":"6:15 PM 5/27/2023","content":"Or Add An Image","updated":"6:17 PM 5/27/2023"}},"updated":"6:17 PM 5/27/2023"},{"created":"6:09 PM 5/27/2023","expanded":false,"name":"Draggable Board 2","columnOrder":["column_1_6_09_PM_5_27_2023_zpcan4deb","list_3_6_10_PM_5_27_2023_wlcimzlua"],"columns":{"column_1_6_09_PM_5_27_2023_zpcan4deb":{"id":"column_1_6_09_PM_5_27_2023_zpcan4deb","title":"You Can Drag Columns","itemIds":["item_1_6_11_PM_5_27_2023_y2vtop14o","item_2_6_18_PM_5_27_2023_n458lp2jj","item_3_6_19_PM_5_27_2023_58qpoeyi0"],"itemType":"Item","updated":"6:10 PM 5/27/2023"},"list_3_6_10_PM_5_27_2023_wlcimzlua":{"id":"list_3_6_10_PM_5_27_2023_wlcimzlua","title":"And Make New Ones","itemIds":["item_2_6_14_PM_5_27_2023_wie8q2ts3","item_2_6_18_PM_5_27_2023_cl6xfeisp","item_3_6_19_PM_5_27_2023_jx025dtp9"],"itemType":"Item","updated":"6:15 PM 5/27/2023"}},"id":"board_2_6_09_PM_5_27_2023_op1nautzv","titleWidth":"258.5px","items":{"item_1_6_11_PM_5_27_2023_y2vtop14o":{"image":"","video":"","id":"item_1_6_11_PM_5_27_2023_y2vtop14o","subtasks":[],"complete":true,"type":"Item","created":"6:11 PM 5/27/2023","content":"You Can Have Completed Items In Any Column","updated":"6:14 PM 5/27/2023"},"item_2_6_14_PM_5_27_2023_wie8q2ts3":{"image":"","video":"","id":"item_2_6_14_PM_5_27_2023_wie8q2ts3","subtasks":[],"complete":false,"type":"Item","created":"6:14 PM 5/27/2023","content":"Click Me To Manage An Item Or To Rename","updated":"6:14 PM 5/27/2023"},"item_2_6_18_PM_5_27_2023_n458lp2jj":{"image":"","video":"","id":"item_2_6_18_PM_5_27_2023_n458lp2jj","subtasks":[],"complete":false,"type":"Item","created":"6:18 PM 5/27/2023","content":"You Can Manage Tasks Or Create Lists In Any Order You Prefer!"},"item_2_6_18_PM_5_27_2023_cl6xfeisp":{"image":"","video":"","id":"item_2_6_18_PM_5_27_2023_cl6xfeisp","subtasks":[],"complete":false,"type":"Image","created":"6:18 PM 5/27/2023","content":"You Can Click A Board To Expand That Board Or Focus On It"},"item_3_6_19_PM_5_27_2023_jx025dtp9":{"image":"","video":"","id":"item_3_6_19_PM_5_27_2023_jx025dtp9","subtasks":[],"complete":false,"type":"Item","created":"6:19 PM 5/27/2023","content":"Also You Can Click To Collapse A Board Entirely Until You Are Ready To Open It Back Up Again"},"item_3_6_19_PM_5_27_2023_58qpoeyi0":{"image":"","video":"","id":"item_3_6_19_PM_5_27_2023_58qpoeyi0","subtasks":[],"complete":false,"type":"Item","created":"6:19 PM 5/27/2023","content":"Create Rankings And Reorder Them With Dynamic Sorting Indexes"}},"updated":"6:19 PM 5/27/2023"}];