import { HttpAgent, Agent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import * as dataIDL from './interfaces/backend';

// Data structures / Custom types.

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

export type FileDataQuery = FileData | string;
export type SingleDataQuery = SingleFileData | string;
export type FullDataQuery = Array<Map<string, UserData>>;

export const getAllUserData = async(dataActor: any): Promise<FullDataQuery> => {
    return await dataActor.getAllUserData() as FullDataQuery;
}

export const createUser = async(dataActor: any): Promise<string> => {
    const result = await dataActor.createUserEntry() as string;
    console.log(result);
    return result;
}

export const getSingleUser = async(user: string, dataActor: any): Promise<any> => {
    const userData = await dataActor.getSingleUser(user);
    return userData;
}

export function getDataActor(arg0: any) {
  throw new Error("Function not implemented.");
}