import { SupabaseFsWorker } from './supabase-fs-worker.js';
import { AssetManager } from '@dfinity/assets';

// Made this async.
export const createClient = async({
    supabaseEndpointUrl,
    SUPABASE_PUBLIC_API_KEY,
    options
}) => {
    let token = options.global.headers.Authorization.replace('Bearer ', '');

    // Note: Make sure the agent passed by UserObject from auth gets turned into an AssetManager based actor.
    const actor = options.actor;

    if (actor) {
        token = actor.principal;
    }

    // Use the actor to get all file URLs from a single canister.
    // Pass in the asset canisterID to create the urls.
    const getUrls = async(canisterId) => {
        const fileList = await actor.list();
        const urlStart = `https://${canisterId}.raw.icp0.io/`;
        // create a loop that returns the urls of all files in the list.
        const urls = fileList.map((file) => {    
            return urlStart + file.key;
        });
        return urls;
    }

    // Use the actor to get a single file URL from a single canister.
    const getSingleUrl = async(canisterId, fileIndex) => {
        const fileList = await actor.list();
        const urlStart = `https://${canisterId}.raw.icp0.io/`;
        const url = urlStart + fileList[fileIndex].key;
        return url;
    }

    const uploadFile = async(canisterId, file) => {
        try {
            const result = await actor.upload(file);
            return result;
        }
        catch (err) {
            console.log(err);
            return err.toString();
        }
    }

    // Needs the file key, deletes a single file.
    const deleteFile = async(fileKey) => {
        try {
            const result = await actor.delete(fileKey);
            return result;
        }
        catch (err) {
            console.log(err);
            return err.toString();
        }
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
                                publicUrl: getSingleUrl('zks6t-giaaa-aaaap-qb7fa-cai', 0)
                            }
                        }
                    },
                    // Added parameter for file.
                    upload: (u, value, opts, file) => {
                        const uploadResult = uploadFile(file); // Either the key (name) of the file or the error code.
                        return {
                            bucketName,
                            uploadResult,
                            error: null // TODO
                        }
                    },
                    remove: (u, fileKey) => {
                        const deleteResult = deleteFile(fileKey); // Either undefined or the error code.
                        return {
                            bucketName,
                            deleteResult,
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