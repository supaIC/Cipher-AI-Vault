/*
 * hooks/dataManager/dataManager.ts
 *
 * This module defines a canister that manages data records within a stable storage solution.
 * It provides CRUD (Create, Read, Update, Delete) operations for data records.
 * It may need to have a separate canister that manages the stable storage solution.
 *
 * TODO: Replace data storage within the Data Store with this stable storage solution.
 */

// Import necessary modules from the 'azle' package
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
// Import the UUID library for generating unique IDs
import { v4 } from 'uuid';

// Define the data structure for a record
const DataRecord = Record({
    id: text,            // Record ID
    name: text,          // Record name
    description: text,   // Record description
    owner: Principal,    // Owner's Principal ID
});
type DataRecord = typeof DataRecord.tsType;

// Initialize storage for data records
let dataRecordMap = StableBTreeMap<string, DataRecord>(0);

// Define the canister methods
const dataManager = Canister({
    // Insert a new record
    insertDataRecord: update([text, text], Result(DataRecord, text), (name, description) => {
        const caller = ic.caller();
        const id = v4();
        const newRecord: DataRecord = { id, name, description, owner: caller };
        dataRecordMap.insert(id, newRecord);
        return Ok(newRecord);
    }),

    // Get keys of records owned by the caller
    keysDataRecord: query([nat32], Vec(text), (numToReturn) => {
        const caller = ic.caller();
        const allKeys = dataRecordMap.keys(0, numToReturn);
        return allKeys.filter((key) => {
            const record = dataRecordMap.get(key);
            return record && record.owner.toText() === caller.toText();
        });
    }),

    // Get records owned by the caller
    valuesDataRecord: query([nat32], Vec(DataRecord), (numToReturn) => {
        const caller = ic.caller();
        const allValues = dataRecordMap.values(0, numToReturn);
        return allValues.filter((record) => record.owner.toText() === caller.toText());
    }),

    // Get key-value pairs of records owned by the caller
    itemsDataRecord: query([nat32], Vec(Tuple(text, DataRecord)), (numToReturn) => {
        const caller = ic.caller();
        const allItems = dataRecordMap.items(0, numToReturn);
        return allItems.filter(([key, record]) => record.owner.toText() === caller.toText());
    }),

    // Delete a record by ID
    deleteDataRecord: update([text], Result(Void, text), (id) => {
        const caller = ic.caller();
        const record = dataRecordMap.get(id);
        if (!record) return Err(`Record not found`);
        if (record.owner.toText() !== caller.toText()) return Err(`Unauthorized`);
        dataRecordMap.remove(id);
        return Ok(null);
    }),

    // Get a single record by ID
    getDataRecord: query([text], Result(DataRecord, text), (id) => {
        const caller = ic.caller();
        const record = dataRecordMap.get(id);
        if (!record) return Err(`Record not found`);
        if (record.owner.toText() !== caller.toText()) return Err(`Unauthorized`);
        return Ok(record);
    }),
});

export default dataManager;