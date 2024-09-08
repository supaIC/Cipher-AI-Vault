import { blob, nat, int, Principal, Vec, Opt, $query, $update, nat8, StableBTreeMap, $init, ic, Variant, Record, Tuple } from 'azle';

//================================//
// Data structures / Custom types //
//================================//

// Represents all data for a single user
export type UserData = Record<{
    user: string,
    allFiles: Vec<FileData> // Array of files each with their own data
}>;

// Represents data for a single file
export type FileData = Record<{
    fileID: string, // UUID of each single file
    fileName: string, // File name
    fileData: Vec<SingleFileData>
}>;

// Represents a single data entry within a file
export type SingleFileData = Record<{
    id: string,
    name: string,
    description: string,
}>;

// Query result types
export type FileDataQuery = Variant<{
    fileData: FileData,
    error: string
}>;

export type SingleDataQuery = Variant<{
    data: SingleFileData,
    error: string
}>;

// Canister authorization
let owner = "";

// Initialize the canister
// Sets the owner to the principal of the entity deploying the canister
$init
export function init(): void {
    owner = ic.caller().toText();
}

// Check if the caller is authorized
// Returns true if the caller is the owner, false otherwise
$query
export function isAuthorized(): boolean {
    return ic.caller().toText() === owner;
}

// Main data store: a map of user principals to their data
let dataRecordMap = new StableBTreeMap<string, UserData>(0, 10000, 100000);

// Query functions

// Check if the data map is empty
// Returns true if there are no entries in the map, false otherwise
$query
export function isDataMapEmpty (): boolean {
    return dataRecordMap.isEmpty();
}

// Get all user data
// Returns an array of tuples, each containing a user's principal and their data
$query
export function getAllUserData(): Vec<Tuple<[string, UserData]>> {
    return dataRecordMap.items();
}

// Get data for a single user
// Returns the UserData for the specified user principal, or null if not found
$query
export function getSingleUser(key: string): Opt<UserData> {
    return dataRecordMap.get(key);
}

// Get data for a specific file of a user
// Returns the FileData for the specified file, or an error message if not found
$query
export function getFileData(key: string, fileName: string): FileDataQuery {
    const user = dataRecordMap.get(key);
    if (user === null) {
        return { error: "User not found."};
    }
    const fileData = user?.Some?.allFiles.find(f => f.fileID === fileName);
    return fileData? { fileData: fileData } : { error: "File not found." };
}

// Check if a user exists
// Returns true if the user exists in the data map, false otherwise
$query
export function doesUserExist(user: string): boolean {
    const allUsers = dataRecordMap.items();
    const userExists = allUsers.some(u => u[1].user === user);
    return userExists;
}

// Update functions

// Create a new user entry
// Returns 'Success' if the user is created, 'User already exists' if the user already exists, or 'Failed' on error
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

// Add a new file to a user's data
// Returns 'Success' if the file is added, 'User not found' if the user doesn't exist, or 'Failed' on error
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

// Update an existing file for a user
// Returns 'Success' if the file is updated, 'User not found' if the user doesn't exist, 
// 'File not found' if the file doesn't exist, or 'Failed' on error
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

// Remove a file from a user's data
// Returns 'Success' if the file is removed, 'User not found' if the user doesn't exist, 
// 'File not found' if the file doesn't exist, or 'Failed' on error
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

// Add new data to a specific file
// Returns 'Success' if the data is added, 'User not found' if the user doesn't exist, 
// 'File not found' if the file doesn't exist, or 'Failed' on error
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

// Update existing data in a specific file
// Returns 'Success' if the data is updated, 'User not found' if the user doesn't exist, 
// 'File not found' if the file doesn't exist, 'Data not found' if the specific data entry doesn't exist, 
// or 'Failed' on error
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

//===========================//
// Canister management stuff //
//===========================//

// Delete all data for a specific user
// Returns 'Success' if the user data is deleted, 'Unauthorized' if the caller is not the owner, 
// or 'Failed' on error
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

// Reset the entire canister by removing all user data
// Returns 'Success' if all data is cleared, 'Unauthorized' if the caller is not the owner, 
// or 'Failed' on error
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