export const idlFactory = ({ IDL }) => {
  const ManualReply = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text });
  const ManualReply_1 = IDL.Record({
    'assets' : IDL.Int,
    'frontend' : IDL.Int,
  });
  const Balances = IDL.Record({ 'assets' : IDL.Int, 'frontend' : IDL.Int });
  const ManualReply_2 = IDL.Variant({ 'Ok' : Balances, 'Err' : IDL.Text });
  const ManualReply_3 = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  return IDL.Service({
    'addCycles' : IDL.Func([IDL.Int], [ManualReply], []),
    'addCyclesToAll' : IDL.Func([IDL.Int], [ManualReply_1], []),
    'getBalances' : IDL.Func([], [ManualReply_2], []),
    'getCanisterStatus' : IDL.Func([], [ManualReply_3], []),
  });
};
export const init = ({ IDL }) => { return []; };
