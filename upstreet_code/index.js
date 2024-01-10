import { SupabaseFsWorker } from './supabase-fs-worker.js';

export const createClient = ({
    supabaseEndpointUrl,
    SUPABASE_PUBLIC_API_KEY,
    options
}) => {
    let token = options.global.headers.Authorization.replace('Bearer ', '');

    const actor = options.actor;

    if (actor) {
        token = actor.principal;
    }

    const supabase = {
        auth: {
            getUserId: () => {
                return token;
            }
        },
        storage: {
            from: (bucketName) => {
                return {
                    getPublicUrl: (u) => {
                        return {
                            data: {
                                bucketName,
                                publicUrl: u  // TODO
                            }
                        }
                    },
                    upload: (u, value, opts) => {
                        return {
                            bucketName,
                            error: null // TODO
                        }
                    },
                    remove: (u) => {
                        return {
                            bucketName,
                            error: null  // TODO
                        }
                    }
                }
            }
        },
        from: (tableName) => {
            return {
                insert: (data) => {
                    // TODO: IC db call here
                    console.log('insert', data)
                    return {
                        data: {
                            ...data,
                            id: Math.random().toString(36).substring(7)
                        }
                    }
                },
                update: (data) => {
                    // TODO: IC db call here
                    return {
                        data: {
                            ...data,
                            id: Math.random().toString(36).substring(7)
                        }
                    }
                },
                select: (data) => {
                    // TODO: IC db call here
                    return {
                        data: {
                            ...data,
                            id: Math.random().toString(36).substring(7)
                        }
                    }
                },
                delete: (data) => {
                    // TODO: IC db call here
                    return {
                        data: {
                            ...data,
                            id: Math.random().toString(36).substring(7)
                        }
                    }
                },
            }
        }
    }

    return supabase
}

export const createSupabaseStorage = ({
    supabaseEndpointUrl,
    SUPABASE_PUBLIC_API_KEY,
}) => {
    const supabaseClient = createClient({
        supabaseEndpointUrl,
        SUPABASE_PUBLIC_API_KEY,
    })

    const supabaseFsWorker = new SupabaseFsWorker({
        supabase: supabaseClient,
        bucketName: 'mirror',
    });


}