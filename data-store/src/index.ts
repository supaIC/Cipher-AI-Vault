import { blob, nat, int, Principal, Vec, Opt, $query, $update, nat8, StableBTreeMap, $init, ic, Variant, Record, Tuple } from 'azle';

export type UserData = Record<{
    user: string,
    data: Vec<DataRecord>
}>;

export type DataRecord = Record<{
    id: string,
    name: string,
    description: string,
}>;

let owner = "";

$init
export function init(): void {
    owner = ic.caller().toString();
}

$query
export function isAuthorized(): boolean {
    return ic.caller().toString() === owner;
}

// Key is a UUID
let dataRecordMap = new StableBTreeMap<string, UserData>(0, 10000, 100000);

$query
export function isDataMapEmpty (): boolean {
    return dataRecordMap.isEmpty();
}

$query
export function getAllUserData(): Vec<Tuple<[string, UserData]>> {
    return dataRecordMap.items();
}

$query
export function getSingleUser(key: string): Opt<UserData> {
    return dataRecordMap.get(key);
}

// If you get a fucky looking error it means the data record didn't exist.
$query
export function getSingleRecordFromUser(key: string, dataId: string): DataRecord {
    const user = dataRecordMap.get(key);
    const data = user!.Some!.data;
    const singleRecord = data.find(d => d.id === dataId)!;
    return singleRecord;
}

$update
export async function createUserEntry(): Promise<string> {
    const key = ic.caller().toText();
    const emptyRecord: DataRecord = {
        id: "0",
        name: "Empty",
        description: "Empty"
    }
    const value = {
        user: key,
        data: [emptyRecord]
    }
    try {
        await dataRecordMap.insert(key, value);
        return 'Success';
    } catch (e) {
        return 'Failed';
    }
}

$update
export async function addDataRecordToUser(key: string, data: DataRecord): Promise<string> {
    const user = dataRecordMap.get(key);
    if (user === null) {
        return 'User not found';
    }
    user!.Some!.data.push(data);
    try {
        await dataRecordMap.insert(key, user!.Some!);
        return 'Success';
    } catch (e) {
        return 'Failed';
    }
}

$update
export async function removeDataRecordFromUser(key: string, dataId: string): Promise<string> {
    const user = dataRecordMap.get(key);
    if (user === null) {
        return 'User not found';
    }
    const data = user!.Some!.data;
    const index = data.findIndex(d => d.id === dataId);
    if (index === -1) {
        return 'Data not found';
    }
    data.splice(index, 1);
    try {
        await dataRecordMap.insert(key, user!.Some!);
        return 'Success';
    } catch (e) {
        return 'Failed';
    }
}

$update
export async function updateDataRecordFromUser(key: string, data: DataRecord): Promise<string> {
    const user = dataRecordMap.get(key);
    if (user === null) {
        return 'User not found';
    }
    const dataArr = user!.Some!.data;
    const index = dataArr.findIndex(d => d.id === data.id);
    if (index === -1) {
        return 'Data not found';
    }
    dataArr[index] = data;
    try {
        await dataRecordMap.insert(key, user!.Some!);
        return 'Success';
    } catch (e) {
        return 'Failed';
    }
}

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