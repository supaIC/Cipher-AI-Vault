import { HttpAgent, Agent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import * as dataIDL from '../../interfaces/backend';

const IDL = dataIDL.idlFactory;

const canisterID = "aaaaa-aa";
// change to https://ic0.app/ if you are using the internet computer or replace with agent from ic-auth's UserObject.
const agent = new HttpAgent({ host: "http://localhost:8000" });
const dataActor = Actor.createActor(dataIDL.idlFactory, { agent, canisterId: canisterID });

export type DataRecord = {
    id: string,
    name: string,
    description: string,
};

export type UserData = {
    user: string,
    data: Array<DataRecord>
};

export type FullDataQuery = Array<Map<string, UserData>>;

export const getAllUserData = async(): Promise<FullDataQuery> => {
    return await dataActor.getAllUserData() as FullDataQuery;
}

export const createUser = async(): Promise<string> => {
    const result = await dataActor.createUserEntry() as string;
    console.log(result);
    return result;
}

export const getSingleUser = async(user: string): Promise<any> => {
    const userData = await dataActor.getSingleUser(user);
    return userData;
}