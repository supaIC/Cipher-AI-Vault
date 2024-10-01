import { useDataActor } from '../../actors';
import { useRef, useCallback } from 'react';

// Data structures / Custom types
export type UserData = {
    user: string,
    allFiles: Array<FileData>
};

export type FileData = {
    fileID: string,
    fileName: string,
    fileData: Array<SingleFileData>
};

export type SingleFileData = {
    id: string,
    name: string,
    description: string,
};

// Query result types
export type FileDataQuery = FileData | string;
export type SingleDataQuery = SingleFileData | string;
export type FullDataQuery = Array<Map<string, UserData>>;

export const useDataManager = () => {
  const { createDataActor } = useDataActor();
  const dataActorRef = useRef<any>(null);

  const getDataActor = useCallback(async (currentUser: any) => {
    if (!dataActorRef.current) {
      dataActorRef.current = await createDataActor(currentUser.agent);
    }
    return dataActorRef.current;
  }, [createDataActor]);

  const getAllUserData = useCallback(async (currentUser: any): Promise<FullDataQuery> => {
    const dataActor = await getDataActor(currentUser);
    return await dataActor.getAllUserData() as FullDataQuery;
  }, [getDataActor]);

  const createUser = useCallback(async (currentUser: any): Promise<string> => {
    const dataActor = await getDataActor(currentUser);
    const result = await dataActor.createUserEntry() as string;
    console.log(result);
    return result;
  }, [getDataActor]);

  const getSingleUser = useCallback(async (currentUser: any, user: string): Promise<any> => {
    const dataActor = await getDataActor(currentUser);
    return await dataActor.getSingleUser(user);
  }, [getDataActor]);

  const addFileToUser = useCallback(async (currentUser: any, user: string, fileData: FileData): Promise<string> => {
    const dataActor = await getDataActor(currentUser);
    const result = await dataActor.addFileToUser(user, fileData) as string;
    console.log("Add file result: ", result);
    return result;
  }, [getDataActor]);

  const removeFileFromUser = useCallback(async (currentUser: any, user: string, fileName: string): Promise<string> => {
    const dataActor = await getDataActor(currentUser);
    const result = await dataActor.removeFileFromUser(user, fileName) as string;
    console.log("Remove file result: ", result);
    return result;
  }, [getDataActor]);

  const getFileData = useCallback(async (currentUser: any, user: string, fileName: string): Promise<FileData> => {
    const dataActor = await getDataActor(currentUser);
    const result = await dataActor.getFileData(user, fileName) as FileData;
    console.log("Get file data result: ", result);
    return result;
  }, [getDataActor]);

  return {
    getAllUserData,
    createUser,
    getSingleUser,
    addFileToUser,
    removeFileFromUser,
    getFileData
  };
};