import { HttpAgent, Agent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import * as dataIDL from '../../interfaces/backend';

// IDL and canister ID for the data canister
const IDL = dataIDL.idlFactory;
const canisterID = "olf36-uaaaa-aaaan-qmu5q-cai";

// Move to Actor Context
// Create a data actor for interacting with the canister
export const getDataActor = async(agent: HttpAgent | Agent) => {
    const dataActor = Actor.createActor(dataIDL.idlFactory, { agent, canisterId: canisterID });
    return dataActor;
}

// Data structures / Custom types

// Represents all data for a single user
export type UserData = {
    user: string,
    allFiles: Array<FileData> // Array of files each with their own data
};

// Represents data for a single file
export type FileData = {
    fileID: string, // UUID of each single file
    fileName: string, // File name
    fileData: Array<SingleFileData>
};

// Represents a single data entry within a file
export type SingleFileData = {
    id: string,
    name: string,
    description: string,
};

// Query result types
export type FileDataQuery = FileData | string;
export type SingleDataQuery = SingleFileData | string;
export type FullDataQuery = Array<Map<string, UserData>>;

// Canister interaction functions

// Function to get all files for all users
export const getAllUserData = async(dataActor: any): Promise<FullDataQuery> => {
    return await dataActor.getAllUserData() as FullDataQuery;
}

// Function to create a new user
export const createUser = async(dataActor: any): Promise<string> => {
    const result = await dataActor.createUserEntry() as string;
    console.log(result);
    return result;
}

// Function to get all files for a single user
export const getSingleUser = async(user: string, dataActor: any): Promise<any> => {
    const userData = await dataActor.getSingleUser(user);
    return userData;
}

// Function to add a file to a user's data
export const addFileToUser = async (user: string, fileData: FileData, dataActor: any): Promise<string> => {
    const result = await dataActor.addFileToUser(user, fileData) as string;
    console.log("Add file result: ", result);
    return result;
};

// Function to remove a file from a user's data
export const removeFileFromUser = async (user: string, fileName: string, dataActor: any): Promise<string> => {
    const result = await dataActor.removeFileFromUser(user, fileName) as string;
    console.log("Remove file result: ", result);
    return result;
};

// Function to fetch data for a specific file of a user
export const getFileData = async (user: string, fileName: string, dataActor: any): Promise<FileData> => {
    const result = await dataActor.getFileData(user, fileName) as FileData;
    console.log("Get file data result: ", result);
    return result;
};