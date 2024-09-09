import { useDataActor } from '../../actors';

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

  const getAllUserData = async (currentUser: any): Promise<FullDataQuery> => {
    const dataActor = await createDataActor(currentUser.agent);
    return await dataActor.getAllUserData() as FullDataQuery;
  };

  const createUser = async (currentUser: any): Promise<string> => {
    const dataActor = await createDataActor(currentUser.agent);
    const result = await dataActor.createUserEntry() as string;
    console.log(result);
    return result;
  };

  const getSingleUser = async (currentUser: any, user: string): Promise<any> => {
    const dataActor = await createDataActor(currentUser.agent);
    const userData = await dataActor.getSingleUser(user);
    return userData;
  };

  const addFileToUser = async (currentUser: any, user: string, fileData: FileData): Promise<string> => {
    const dataActor = await createDataActor(currentUser.agent);
    const result = await dataActor.addFileToUser(user, fileData) as string;
    console.log("Add file result: ", result);
    return result;
  };

  const removeFileFromUser = async (currentUser: any, user: string, fileName: string): Promise<string> => {
    const dataActor = await createDataActor(currentUser.agent);
    const result = await dataActor.removeFileFromUser(user, fileName) as string;
    console.log("Remove file result: ", result);
    return result;
  };

  const getFileData = async (currentUser: any, user: string, fileName: string): Promise<FileData> => {
    const dataActor = await createDataActor(currentUser.agent);
    const result = await dataActor.getFileData(user, fileName) as FileData;
    console.log("Get file data result: ", result);
    return result;
  };

  return {
    getAllUserData,
    createUser,
    getSingleUser,
    addFileToUser,
    removeFileFromUser,
    getFileData
  };
};