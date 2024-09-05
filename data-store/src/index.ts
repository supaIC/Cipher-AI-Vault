import { blob, nat, int, Principal, Vec, Opt, $query, $update, nat8, StableBTreeMap, $init, ic, Variant, Record, Tuple } from 'azle';

//================================//
// Data structures / Custom types //
//================================//

// A single entry of an entire user.
export type UserData = Record<{
    user: string,
    allFiles: Vec<FileData> // Array of files each with their own data (FileData).
}>;

// A single file data entry that includes an array of data for each file.
export type FileData = Record<{
    fileID: string, // UUID of each single file.
    fileName: string, // File name.
    fileData: Vec<SingleFileData>
}>;

// A single data entry as part of an array that makes up the total data of a single file.
export type SingleFileData = Record<{
    id: string,
    name: string,
    description: string,
}>;

// 
export type FileDataQuery = Variant<{
    fileData: FileData,
    error: string
}>;

export type SingleDataQuery = Variant<{
    data: SingleFileData,
    error: string
}>;

// Canister authorization.

let owner = "";

// Initializes the data store.
$init
export function init(): void {
    owner = ic.caller().toText();
}

// Checks if the caller is the owner.
$query
export function isAuthorized(): boolean {
    return ic.caller().toText() === owner;
}

// Key is the user's principal ID.
let dataRecordMap = new StableBTreeMap<string, UserData>(0, 10000, 100000);

$query
export function isDataMapEmpty (): boolean {
    return dataRecordMap.isEmpty();
}

$query
export function getAllUserData(): Vec<Tuple<[string, UserData]>> {
    return dataRecordMap.items();
}

// Gives you the user's data including an array of all of the file data.
$query
export function getSingleUser(key: string): Opt<UserData> {
    return dataRecordMap.get(key);
}

// Gets all of the data for a single file.
$query
export function getFileData(key: string, fileName: string): FileDataQuery {
    const user = dataRecordMap.get(key);
    if (user === null) {
        return { error: "User not found."};
    }
    const fileData = user?.Some?.allFiles.find(f => f.fileID === fileName);
    return fileData? { fileData: fileData } : { error: "File not found." };
}

// Checks if a user exists.
$query
export function doesUserExist(user: string): boolean {
    const allUsers = dataRecordMap.items();
    const userExists = allUsers.some(u => u[1].user === user);
    return userExists;
}

// Creates a user entry.
$update
export async function createUserEntry(): Promise<string> {
    const key = ic.caller().toText();
    const userExists = doesUserExist(key);
    if (userExists) {
        return 'User already exists.';
    }
    const newUser: UserData = {
        user: key,
        allFiles: []
    };
    try {
        await dataRecordMap.insert(key, newUser);
        return 'Success';
    } catch (e) {
        return 'Failed';
    }
}

// > Todo: Test this thing.
$update
export async function addFileToUser(key: string, data: FileData): Promise<string> {
    const user = dataRecordMap.get(key);
    if (user === null) {
        return 'User not found';
    }
    user?.Some?.allFiles.push(data);
    try {
        await dataRecordMap.insert(key, user?.Some!);
        return 'Success';
    } catch (e) {
        return 'Failed';
    }
}

// Updates a file for a user.
$update
export async function updateFileForUser(key: string, fileData: FileData): Promise<string> {
    const user = dataRecordMap.get(key);
    if (user === null || user.Some === undefined) {
        return 'User not found';
    }
    const index = user.Some.allFiles.findIndex(f => f.fileID === fileData.fileID);
    if (index === -1) {
        return 'File not found';
    }
    user.Some.allFiles[index] = fileData;
    try {
        await dataRecordMap.insert(key, user.Some);
        return 'Success';
    } catch (e) {
        return 'Failed';
    }
}

// Removes a file for a user.
$update
export async function removeFileFromUser(key: string, fileName: string): Promise<string> {
    const user = dataRecordMap.get(key);
    if (user === null) {
        return 'User not found';
    }
    const index = user?.Some?.allFiles.findIndex(f => f.fileID === fileName);
    if (index === -1) {
        return 'File not found';
    }
    user?.Some?.allFiles.splice(index!, 1);
    try {
        await dataRecordMap.insert(key, user?.Some!);
        return 'Success';
    } catch (e) {
        return 'Failed';
    }
}

//====================================================//
// Functions for the data inside each FileData object //
//====================================================//

$update
export async function addDataToFile(key: string, fileID: string, data: SingleFileData): Promise<string> {
    const user = dataRecordMap.get(key);
    if (user === null) {
        return 'User not found';
    }
    const file = user?.Some?.allFiles.find(f => f.fileID === fileID);
    if (file === undefined) {
        return 'File not found';
    }
    file.fileData.push(data);
    try {
        await dataRecordMap.insert(key, user?.Some!);
        return 'Success';
    } catch (e) {
        return 'Failed';
    }
}

$update
export async function updateDataForFile(key: string, fileID: string, data: SingleFileData): Promise<string> {
    const user = dataRecordMap.get(key);
    if (user === null) {
        return 'User not found';
    }
    const file = user?.Some?.allFiles.find(f => f.fileID === fileID);
    if (file === undefined) {
        return 'File not found';
    }
    const index = file.fileData.findIndex(d => d.id === data.id);
    if (index === -1) {
        return 'Data not found';
    }
    file.fileData[index] = data;
    try {
        await dataRecordMap.insert(key, user?.Some!);
        return 'Success';
    } catch (e) {
        return 'Failed';
    }
}
//============================//
// Canister management stuffs //
//============================//

$update
export async function deleteUserData(key: string): Promise<string> {
    const auth = isAuthorized();
    if (!auth) {
        return 'Unauthorized';
    } else {
        try {
            await dataRecordMap.remove(key);
            return 'Success';
        } catch (e) {
            return 'Failed';
        }
    }
}

$update
export async function resetCanister(): Promise<string> {
    const auth = isAuthorized();
    if (!auth) {
        return 'Unauthorized';
    } else {
        try {
            for (const [key, _] of dataRecordMap.items()) {
                await dataRecordMap.remove(key);
            }
            return 'Success';
        } catch (e) {
            return 'Failed';
        }
    }
}