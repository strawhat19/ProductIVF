export enum Types {
    Data = `Data`,
    User = `User`,
    Email = `Email`,
    Profile = `Profile`,

    Grid = `Grid`,
    Board = `Board`,
    Column = `Column`,
    List = `List`,
    Item = `Item`,
    Task = `Task`,

    Feature = `Feature`,
    Preference = `Preference`,
    Notification = `Notification`,

    Chat = `Chat`,
    Post = `Post`,
    Upload = `Upload`,
    Message = `Message`,
}

export enum GridTypes {
    Personal = `Personal`,
    Work = `Work`,
    Shared = `Shared`,
    Public = `Public`,
    Private = `Private`,
    Archived = `Archived`,
}

export const AuthGrids = [GridTypes.Private];

export enum Views {
    Details = `Details`,
    Context = `Context Menu`,
}

export enum TasksFilterStates {
    All_On = `All On`,
    Tasks = `Tasks`,
    All_Off = `All Off`,
}

export enum AuthStates {
    Next = `Next`,
    Back = `Back`,
    Save = `Save`,
    Edit = `Edit`,
    Cancel = `Cancel`,
    Delete = `Delete`,
    Sign_In = `Sign In`,
    Sign_Up = `Sign Up`,
    Sign_Out = `Sign Out`,
    Register = `Register`,
    Forgot_Password = `Forgot Password`,
    Reset_Password = `Reset Password`,
}