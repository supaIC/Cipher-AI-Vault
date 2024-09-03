export const idlFactory = ({ IDL }) => {
  const DataRecord = IDL.Record({
    'id' : IDL.Text,
    'name' : IDL.Text,
    'description' : IDL.Text,
  });
  const UserData = IDL.Record({
    'data' : IDL.Vec(DataRecord),
    'user' : IDL.Text,
  });
  return IDL.Service({
    'addDataRecordToUser' : IDL.Func([IDL.Text, DataRecord], [IDL.Text], []),
    'createUserEntry' : IDL.Func([], [IDL.Text], []),
    'deleteUserData' : IDL.Func([IDL.Text], [IDL.Text], []),
    'getAllUserData' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, UserData))],
        ['query'],
      ),
    'getSingleRecordFromUser' : IDL.Func(
        [IDL.Text, IDL.Text],
        [DataRecord],
        ['query'],
      ),
    'getSingleUser' : IDL.Func([IDL.Text], [IDL.Opt(UserData)], ['query']),
    'isAuthorized' : IDL.Func([], [IDL.Bool], ['query']),
    'isDataMapEmpty' : IDL.Func([], [IDL.Bool], ['query']),
    'removeDataRecordFromUser' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'updateDataRecordFromUser' : IDL.Func(
        [IDL.Text, DataRecord],
        [IDL.Text],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
