export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addLog' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Principal,
              'action' : IDL.Text,
              'dataId' : IDL.Text,
              'userId' : IDL.Text,
              'createdAt' : IDL.Nat64,
              'dataName' : IDL.Text,
              'serviceId' : IDL.Principal,
            }),
            'Err' : IDL.Variant({
              'InvalidPayload' : IDL.Text,
              'NotFound' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        [],
      ),
    'generateId' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Principal,
            'Err' : IDL.Variant({
              'InvalidPayload' : IDL.Text,
              'NotFound' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        ['query'],
      ),
    'getLogs' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Principal,
                'action' : IDL.Text,
                'dataId' : IDL.Text,
                'userId' : IDL.Text,
                'createdAt' : IDL.Nat64,
                'dataName' : IDL.Text,
                'serviceId' : IDL.Principal,
              })
            ),
            'Err' : IDL.Variant({
              'InvalidPayload' : IDL.Text,
              'NotFound' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        ['query'],
      ),
    'getLogsByAction' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Principal,
                'action' : IDL.Text,
                'dataId' : IDL.Text,
                'userId' : IDL.Text,
                'createdAt' : IDL.Nat64,
                'dataName' : IDL.Text,
                'serviceId' : IDL.Principal,
              })
            ),
            'Err' : IDL.Variant({
              'InvalidPayload' : IDL.Text,
              'NotFound' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        ['query'],
      ),
    'getLogsByDataIdAndAction' : IDL.Func(
        [IDL.Text, IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Principal,
                'action' : IDL.Text,
                'dataId' : IDL.Text,
                'userId' : IDL.Text,
                'createdAt' : IDL.Nat64,
                'dataName' : IDL.Text,
                'serviceId' : IDL.Principal,
              })
            ),
            'Err' : IDL.Variant({
              'InvalidPayload' : IDL.Text,
              'NotFound' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        ['query'],
      ),
    'initializeCanister' : IDL.Func(
        [IDL.Principal],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Principal,
              'createdAt' : IDL.Nat64,
            }),
            'Err' : IDL.Variant({
              'InvalidPayload' : IDL.Text,
              'NotFound' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        [],
      ),
    'verifyDocument' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Principal,
                'action' : IDL.Text,
                'dataId' : IDL.Text,
                'userId' : IDL.Text,
                'createdAt' : IDL.Nat64,
                'dataName' : IDL.Text,
                'serviceId' : IDL.Principal,
              })
            ),
            'Err' : IDL.Variant({
              'InvalidPayload' : IDL.Text,
              'NotFound' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
