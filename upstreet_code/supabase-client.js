import {
  createClient,
} from '@supabase/supabase-js';
import jwt_decode from 'jwt-decode';
import {
  supabaseEndpointUrl,
} from '../endpoints.js';
import {
  SUPABASE_PUBLIC_API_KEY,
} from '../constants/auth.js';

import {
  getDefaultUser,
  getDefaultPlayerSpec,
} from '../../../packages/engine/managers/account/account-manager.js';
// import {
//   getEthereumAccountDetails,
// } from '../../../pages/components/metamask-auth-ui/MetamaskAuthUi.jsx';

//

// TODO: move to endpoints

const anonJwtUrl = `https://metamask.upstreet.ai/anon`;

const makeSupabase = (jwt) => {
  if (jwt) {
    return createClient(
      supabaseEndpointUrl,
      SUPABASE_PUBLIC_API_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      },
    );
  } else {
    return createClient(
      supabaseEndpointUrl,
      SUPABASE_PUBLIC_API_KEY,
    );
  }
};

//

class UserProfile {
  constructor({
    loaded = false,
    sessionUserId = '',
    provider = '',
    user = null,
    accountPrivate = null,
  } = {}) {
    this.loaded = loaded;
    this.sessionUserId = sessionUserId;
    this.provider = provider;
    this.user = user;
    this.accountPrivate = accountPrivate;
  }
}

//

export class SupabaseClient extends EventTarget {
  constructor({
    localStorageManager,
  } = {}) {
    super();

    this.localStorageManager = localStorageManager;

    const jwt = localStorageManager.getJwt();

    this.supabase = makeSupabase(jwt);
    this.profile = new UserProfile();
    this.authListener = null;

    //

    this.#listen();
  }

  #listen() {
    // bind jwt update
    {
      const _clearClient = () => {
        this.supabase.realtime.disconnect();
        this.supabase = null;
      };
      const jwtupdate = (e) => {
        const {
          jwt,
        } = e.data;

        _clearClient();

        this.supabase = makeSupabase(jwt);
        // console.log('update supabase', jwt);

        this.dispatchEvent(new MessageEvent('clientupdate', {
          data: {
            client: this.supabase,
          },
        }));
      };
      this.localStorageManager.addEventListener('jwtupdate', jwtupdate);

      this.cleanup = () => {
        this.localStorageManager.removeEventListener('jwtupdate', jwtupdate);
        _clearClient();
      };
    }

    // bind profile update
    {
      const updateUser = async ({
        id,
        provider,
        address,
      }) => {
        try {
          const [user, accountPrivate] = await (async () => {
              const queries = await Promise.all([
                (async () => {
                  return await this.supabase
                    .from('accounts')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle()
                })(),
                (async () => {
                  return await this.supabase
                    .from('accounts_private')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle()
                })(),
              ]);
              let {
                data: data1,
                error: error1,
              } = queries[0];
              let {
                data: data2,
                error: error2,
              } = queries[1];
              if (error1) {
                throw error1
              }
              if (error2) {
                throw error2
              }

              if (!data1) {
                // create user
                const user = getDefaultUser(id);
                console.log('create initial user', {id, user});

                const {
                  error,
                } = await this.supabase
                  .from('accounts')
                  .insert(user);

                if (error) {
                  throw error
                }

                data1 = user;
              }

              if (!data2) {
                console.log('data1', data1)
                const accountPrivate = { id: data1.id };
                if(address) {
                  accountPrivate.address = address;
                }
                console.log('writing to private')
                console.log('supabase auth type', this.supabase.auth)
                const {
                  error,
                } = await this.supabase
                  .from('accounts_private')
                  .insert(accountPrivate);

                if (error) {
                  console.log('error is', error)
                  throw error
                }

                data2 = accountPrivate
              }

              return [data1, data2]
          })();

          if (user !== null) {
            if (!user.playerSpec) {
              user.playerSpec = getDefaultPlayerSpec();
            }

            const newProfile = new UserProfile({
              loaded: true,
              provider,
              sessionUserId: id,
              user,
              accountPrivate,
            });
            this.setProfile(newProfile);
          } else {
            // setDefaultProfile(true);
            debugger;
          }
        } catch (err) {
          if (
            err.code === 'PGRST301' // Any error related to the verification of the JWT, which means that the JWT provided is invalid in some way.
          ) {
            console.warn('jwt error, clearing jwt and reloading the page', err)
            this.localStorageManager.deleteJwt();
          } else {
            console.warn('update user error', err);
            debugger;
            throw new Error('update user error');
          }
        }
      };
      const loadAnonUser = async () => {
        const id = crypto.randomUUID();
        const res = await fetch(anonJwtUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id
          }),
        });
        const jwt = await res.json();
        this.localStorageManager.setJwt(jwt);
      };
      const tryLoadAnonUser = async () => {
        if (!this.localStorageManager.usedAutoLogin()) {
          await loadAnonUser();
          console.warn('logging in anon user, for chat we have disabled autologin until our login upgrade flow is finalized')
          // this.localStorageManager.setUsedAutoLogin(true);
        } else {
          console.warn('not logging in -- already used up auto login');
          const newProfile = new UserProfile({
            loaded: true,
          });
          this.setProfile(newProfile);
        }
      };

      // bind profile update
      const updateProfile = () => {
        if (this.authListener) {
          this.authListener.subscription.unsubscribe();
          this.authListener = null;
        }

        // this.setProfile({
        //   ...this.profile,
        //   loaded: false,
        // });

        const {
          data: authListener,
        } = this.supabase.auth.onAuthStateChange((event, session) => {
          // console.log('session', session)

          // console.log('got event', event);
          if (event === 'INITIAL_SESSION') {
            // if we haven't loaded the profile yet
            if (!this.profile?.loaded) {
              // if supabase handled the login
              if (session) {
                session.user.id !== this.profile?.sessionUserId && updateUser({
                  id: session.user.id,
                  provider: session.user.app_metadata.provider,
                });
              // if supabase didn't handle the login
              } else {
                const jwtString = this.supabase.auth.headers?.['Authorization']?.replace(/^Bearer\s+/i, '');
                const jwtResult = jwtString ? jwt_decode(jwtString) : null;
                // console.log('jwtResult', jwtResult);
                const id = jwtResult?.id;

                // console.log('jwtResult', jwtResult)

                // if we are logging in with a custom jwt
                if (jwtResult?.role !== 'anon') {
                  id !== this.profile?.sessionUserId && updateUser({
                    id,
                    address: jwtResult?.address,
                    provider: 'anonymous',
                  });
                // if we are not logged in
                } else {
                  tryLoadAnonUser();
                }
              }
            }
          } else if (event === 'SIGNED_IN') {
            session.user.id !== this.profile?.sessionUserId && updateUser({
              id: session.user.id,
              provider: session.user.app_metadata.provider,
            });
          } else if (event === 'SIGNED_OUT') {
            if (this.profile?.sessionUserId) {
              const newProfile = new UserProfile({
                loaded: true,
              });
              this.setProfile(newProfile);
            }
          }
        });
        this.authListener = authListener;
      };
      updateProfile();
      this.addEventListener('clientupdate', (e) => {
        updateProfile();
      });
    }
  }
  getProfile() {
    return this.profile;
  }
  setProfile(profile) {
    // console.log('set profile', {
    //   profile,
    //   stack: new Error().stack,
    // });

    this.profile = profile;

    this.dispatchEvent(new MessageEvent('profileupdate', {
      data: {
        profile,
      },
    }));
  }
  /* async refresh() {
    const sessionUserId = this.profile?.sessionUserId;
    if (sessionUserId) {
      console.log('refresh')
      const {
        data,
        error,
      } = await this.supabase
        .from('accounts')
        .select('*')
        .eq('id', sessionUserId)
        .maybeSingle();

      const newUser = data;

      this.setProfile({
        ...this.profile,
        user: newUser,
      });
    }
  } */
  async updateUser(spec) {
    const sessionUserId = this.profile?.sessionUserId;
    if (sessionUserId) {
      const newUser = typeof spec === 'function' ?
        spec(this.profile.user)
      :
        {
          ...this.profile.user,
          ...spec,
        };

      await this.supabase
        .from('accounts')
        .upsert(newUser);

      const newProfile = new UserProfile({
        ...this.profile,
        user: newUser,
      });
      this.setProfile(newProfile);
    } else {
      throw new Error('not logged in');
    }
  }
  destroy() {
    this.cleanup();
  }
}
