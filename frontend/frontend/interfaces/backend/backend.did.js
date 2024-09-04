export const idlFactory = ({ IDL }) => {
  const SingleFileData = IDL.Record({
    'id' : IDL.Text,
    'name' : IDL.Text,
    'description' : IDL.Text,
  });
  const FileData = IDL.Record({
    'fileData' : IDL.Vec(SingleFileData),
    'fileName' : IDL.Text,
    'fileID' : IDL.Text,
  });
  const UserData = IDL.Record({
    'user' : IDL.Text,
    'allFiles' : IDL.Vec(FileData),
  });
  const FileDataQuery = IDL.Variant({
    'fileData' : FileData,
    'error' : IDL.Text,
  });
  return IDL.Service({
    'addDataToFile' : IDL.Func(
        [IDL.Text, IDL.Text, SingleFileData],
        [IDL.Text],
        [],
      ),
    'addFileToUser' : IDL.Func([IDL.Text, FileData], [IDL.Text], []),
    'createUserEntry' : IDL.Func([], [IDL.Text], []),
    'deleteUserData' : IDL.Func([IDL.Text], [IDL.Text], []),
    'doesUserExist' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'getAllUserData' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, UserData))],
        ['query'],
      ),
    'getFileData' : IDL.Func([IDL.Text, IDL.Text], [FileDataQuery], ['query']),
    'getSingleUser' : IDL.Func([IDL.Text], [IDL.Opt(UserData)], ['query']),
    'isAuthorized' : IDL.Func([], [IDL.Bool], ['query']),
    'isDataMapEmpty' : IDL.Func([], [IDL.Bool], ['query']),
    'removeFileFromUser' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'resetCanister' : IDL.Func([], [IDL.Text], []),
    'updateDataForFile' : IDL.Func(
        [IDL.Text, IDL.Text, SingleFileData],
        [IDL.Text],
        [],
      ),
    'updateFileForUser' : IDL.Func([IDL.Text, FileData], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
