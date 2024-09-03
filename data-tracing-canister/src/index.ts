import {
  Canister,
  Err,
  ic,
  nat64,
  Ok,
  Principal,
  query,
  Record,
  Result,
  StableBTreeMap,
  text,
  update,
  Variant,
  Vec,
} from "azle";

import { POSSIBLE_ACTIONS } from "./constants";
import { generateId } from "./utils";

const Service = Record({
  id: Principal,
  createdAt: nat64,
});

const Log = Record({
  id: Principal,
  serviceId: Principal,
  userId: text,
  action: text,
  dataId: text,
  dataName: text,
  createdAt: nat64,
});

const Error = Variant({
  NotFound: text,
  Conflict: text,
  Unauthorized: text,
  InvalidPayload: text,
});

const serviceStorage = StableBTreeMap(Principal, Service, 0);
const logStorage = StableBTreeMap(Principal, Log, 1);

export default Canister({
  /**
   * Initializes the canister by adding a new user during deployment.
   * @param userId - The Principal ID of the new user.
   */
  initializeCanister: update(
    [Principal],
    Result(Service, Error),
    (serviceId) => {
      if (!ic.caller().compareTo(ic.id())) {
        return Err({ Unauthorized: "Unauthorized access!" });
      }

      if (serviceStorage.containsKey(serviceId)) {
        return Err({ Conflict: "User already exists!" });
      }

      const newService: typeof Service = {
        id: serviceId,
        createdAt: ic.time(),
      };

      serviceStorage.insert(serviceId, newService);

      return Ok(newService);
    },
  ),

  /**
   * Adds a log entry with the provided details.
   * @param userId - The ID of the user performing the action.
   * @param action - The action performed.
   * @param dataId - The ID of the data.
   * @param dataName - The name of the data.
   * @returns The log entry.
   */
  addLog: update(
    [text, text, text, text],
    Result(Log, Error),
    (userId, action, dataId, dataName) => {
      if (!serviceStorage.containsKey(ic.caller())) {
        return Err({ Unauthorized: "Unauthorized access!" });
      }

      // Check if the action is supported
      if (!POSSIBLE_ACTIONS.includes(action.toLowerCase())) {
        return Err({
          InvalidPayload: `'${action}' is not supported, please select one of: ${POSSIBLE_ACTIONS}`,
        });
      }

      const log: typeof Log = {
        id: generateId(),
        serviceId: ic.caller(),
        userId,
        dataId,
        dataName,
        action: action.toLowerCase(),
        createdAt: ic.time(),
      };

      logStorage.insert(log.id, log);

      return Ok(log);
    },
  ),

  /**
   * Retrieves all logs stored in the canister.
   * @returns A list of log entries.
   */
  getLogs: query([], Result(Vec(Log), Error), () => {
    if (!serviceStorage.containsKey(ic.caller())) {
      return Err({ Unauthorized: "Unauthorized access!" });
    }

    return Ok(logStorage.values());
  }),

  /**
   * Retrieves logs filtered by a specific action.
   * @param action - The action to filter logs by.
   * @returns A list of log entries matching the specified action.
   */
  getLogsByAction: query([text], Result(Vec(Log), Error), (action) => {
    if (!serviceStorage.containsKey(ic.caller())) {
      return Err({ Unauthorized: "Unauthorized access!" });
    }

    // Check if the provided action is supported
    if (!POSSIBLE_ACTIONS.includes(action.toLowerCase())) {
      return Err({
        InvalidPayload: `'${action}' is not supported, please select one of: ${POSSIBLE_ACTIONS}`,
      });
    }

    const filteredLogs = logStorage
      .values()
      .filter(
        (x: typeof Log) => x.action.toLowerCase() === action.toLowerCase(),
      );

    return Ok(filteredLogs);
  }),

  /**
   * Verifies a document by finding every log with the given dataId.
   * @param dataId - The ID of the data to verify.
   * @returns A list of log entries for the specified dataId.
   */
  verifyDocument: query([text], Result(Vec(Log), Error), (dataId) => {
    if (!serviceStorage.containsKey(ic.caller())) {
      return Err({ Unauthorized: "Unauthorized access!" });
    }

    const logsForDataId = logStorage
      .values()
      .filter((x: typeof Log) => x.dataId === dataId);

    return Ok(logsForDataId);
  }),

  /**
   * Gets records by a given dataId and action.
   * @param dataId - The ID of the data to filter by.
   * @param action - The action to filter by.
   * @returns A list of log entries matching the specified dataId and action.
   */
  getLogsByDataIdAndAction: query(
    [text, text],
    Result(Vec(Log), Error),
    (dataId, action) => {
      if (!serviceStorage.containsKey(ic.caller())) {
        return Err({ Unauthorized: "Unauthorized access!" });
      }

      // Check if the provided action is supported
      if (!POSSIBLE_ACTIONS.includes(action.toLowerCase())) {
        return Err({
          InvalidPayload: `'${action}' is not supported, please select one of: ${POSSIBLE_ACTIONS}`,
        });
      }

      const filteredLogs = logStorage
        .values()
        .filter(
          (x: typeof Log) =>
            x.dataId === dataId &&
            x.action.toLowerCase() === action.toLowerCase(),
        );

      return Ok(filteredLogs);
    },
  ),

  /**
   * Generates an ID of type Principal using UUID.
   * @returns a Principal ID.
   */
  generateId: query([], Result(Principal, Error), () => {
    if (!serviceStorage.containsKey(ic.caller())) {
      return Err({ Unauthorized: "Unauthorized access!" });
    }

    return Ok(generateId());
  }),
});
