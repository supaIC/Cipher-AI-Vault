// import { makeId } from './util.js';

//

export class SupabaseFsWorker {
  constructor({
    supabase,
    bucketName = 'mirror',
  }) {
    if (!supabase) {
      throw new Error('no supabase client');
    }

    this.supabase = supabase;
    this.bucketName = bucketName;
  }

  getUrl(keyPath) {
    const u = keyPath.join('/')
    const {
      data,
    } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(u); // make into IC call - Grab and parse url from list function (DM)
    const {publicUrl} = data;
    return publicUrl;
  }

  async getUserId() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user.id;
  }

  async readFile(keyPath) {
    const u = this.getUrl(keyPath);
    const res = await fetch(u);
    if (res.ok) {
      const blob = await res.blob();
      return blob;
    } else {
      console.warn('readFile not ok', u, res.status);
      return null;
    }
  }
  async writeFile(keyPath, value) {
    const u = keyPath.join('/');
    const opts = {
      upsert: true,
    };
    const result = await this.supabase
      .storage
      .from(this.bucketName)
      .upload(u, value, opts); // make into IC call - Asset upload functionality (DM)
    if (!result.error) {
      const u2 = this.getUrl(keyPath);
      return u2;
    } else {
      throw new Error(result.error);
    }
  }
  async deleteFile(keyPath) {
    const u = keyPath.join('/');
    await this.supabase
      .storage
      .from(this.bucketName)
      .remove([u]); // make into IC call - Asset delete functionality (DM)
  }
}