export const idlFactory = ({ IDL }) => {
  const ManualReply = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text });
  return IDL.Service({
    'cyclesBalance' : IDL.Func([], [IDL.Int], ['query']),
    'topUp' : IDL.Func([IDL.Principal, IDL.Nat], [ManualReply], []),
  });
};
export const init = ({ IDL }) => { return []; };
