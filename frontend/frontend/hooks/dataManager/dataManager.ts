import { HttpAgent, Agent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import * as dataIDL from '../../interfaces/backend';

// IDL and canister ID.
const IDL = dataIDL.idlFactory;
const canisterID = "olf36-uaaaa-aaaan-qmu5q-cai";

// Create a data actor.
export const getDataActor = async(agent: HttpAgent | Agent) => {
    const dataActor = Actor.createActor(dataIDL.idlFactory, { agent, canisterId: canisterID });
    return dataActor;
}

//=================================//
// Data structures / Custom types. //
//=================================//

// A single entry of an entire user.
export type UserData = {
    user: string,
    allFiles: Array<FileData> // Array of files each with their own data (FileData).
};

// A single file data entry that includes an array of data for each file.
export type FileData = {
    fileID: string, // UUID of each single file.
    fileName: string, // File name.
    fileData: Array<SingleFileData>
};

// A single data entry as part of an array that makes up the total data of a single file.
export type SingleFileData = {
    id: string,
    name: string,
    description: string,
};

// Query types.
export type FileDataQuery = FileData | string;
export type SingleDataQuery = SingleFileData | string;
export type FullDataQuery = Array<Map<string, UserData>>;

// Gets all files for all users.
export const getAllUserData = async(dataActor: any): Promise<FullDataQuery> => {
    return await dataActor.getAllUserData() as FullDataQuery;
}

// Creates a new user.
export const createUser = async(dataActor: any): Promise<string> => {
    const result = await dataActor.createUserEntry() as string;
    console.log(result);
    return result;
}

// Gets all files for a single user.
export const getSingleUser = async(user: string, dataActor: any): Promise<any> => {
    const userData = await dataActor.getSingleUser(user);
    return userData;
}

// Adds a file to a user.
export const addFileToUser = async (user: string, fileData: FileData, dataActor: any): Promise<string> => {
    const result = await dataActor.addFileToUser(user, fileData) as string;
    console.log("Add file result: ", result);
    return result;
};

// Removes a file for a user.
export const removeFileFromUser = async (user: string, fileName: string, dataActor: any): Promise<string> => {
    const result = await dataActor.removeFileFromUser(user, fileName) as string;
    console.log("Remove file result: ", result);
    return result;
};

// Fetches data for a specific file of a user.
export const getFileData = async (user: string, fileName: string, dataActor: any): Promise<FileData> => {
    const result = await dataActor.getFileData(user, fileName) as FileData;
    console.log("Get file data result: ", result);
    return result;
};

