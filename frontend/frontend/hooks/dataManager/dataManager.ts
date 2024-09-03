// hooks/dataManager/dataManager.ts
import {
    Canister,
    Err,
    ic,
    nat32,
    Ok,
    Principal,
    query,
    Record,
    StableBTreeMap,
    text,
    Tuple,
    update,
    Vec,
    Result,
    Void
} from 'azle/experimental';
import { v4 } from 'uuid';

const DataRecord = Record({
    id: text,
    name: text,
    description: text,
    owner: Principal,
});
type DataRecord = typeof DataRecord.tsType;

let dataRecordMap = StableBTreeMap<string, DataRecord>(0);

const dataManagerCanister = Canister({
    insertDataRecord: update([text, text], Result(DataRecord, text), (name, description) => {
        const caller = ic.caller();
        const id = v4();
        const newRecord: DataRecord = { id, name, description, owner: caller };
        dataRecordMap.insert(id, newRecord);
        return Ok(newRecord);
    }),

    keysDataRecord: query([nat32], Vec(text), (numToReturn) => {
        const caller = ic.caller();
        const allKeys = dataRecordMap.keys(0, numToReturn);
        return allKeys.filter((key) => {
            const record = dataRecordMap.get(key);
            return record && record.owner.toText() === caller.toText();
        });
    }),

    valuesDataRecord: query([nat32], Vec(DataRecord), (numToReturn) => {
        const caller = ic.caller();
        const allValues = dataRecordMap.values(0, numToReturn);
        return allValues.filter((record) => record.owner.toText() === caller.toText());
    }),

    itemsDataRecord: query([nat32], Vec(Tuple(text, DataRecord)), (numToReturn) => {
        const caller = ic.caller();
        const allItems = dataRecordMap.items(0, numToReturn);
        return allItems.filter(([key, record]) => record.owner.toText() === caller.toText());
    }),

    deleteDataRecord: update([text], Result(Void, text), (id) => {
        const caller = ic.caller();
        const record = dataRecordMap.get(id);
        if (!record) {
            return Err(`Record with ID ${id} not found`);
        }

        if (record.owner.toText() !== caller.toText()) {
            return Err(`Unauthorized: You do not own this record`);
        }

        dataRecordMap.remove(id);
        return Ok(null);
    }),

    getDataRecord: query([text], Result(DataRecord, text), (id) => {
        const caller = ic.caller();
        const record = dataRecordMap.get(id);
        if (!record) {
            return Err(`Record with ID ${id} not found`);
        }

        if (record.owner.toText() !== caller.toText()) {
            return Err(`Unauthorized: You do not own this record`);
        }

        return Ok(record);
    }),
});

export default dataManagerCanister;
