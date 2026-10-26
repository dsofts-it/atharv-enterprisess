import {MongoMemoryReplSet} from 'mongodb-memory-server';
import {randomBytes} from 'node:crypto';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
if(process.env.NODE_ENV==='production')throw new Error('Local development helper cannot run in production');
process.env.NODE_ENV='development';process.env.CLIENT_URL='http://127.0.0.1:5173';process.env.JWT_ACCESS_SECRET ||= randomBytes(48).toString('hex');process.env.MONGOMS_DOWNLOAD_DIR=resolve('node_modules/.cache/mongodb-memory-server');
const dbPath=resolve('.runtime/mongo');await mkdir(dbPath,{recursive:true});
// Keep the replica-set member address stable when reusing the local database.
const repl=await MongoMemoryReplSet.create({instanceOpts:[{dbPath,port:62534}],replSet:{count:1,name:'atharv_local',storageEngine:'wiredTiger'}});
process.env.MONGODB_URI=repl.getUri('atharv_local');console.log(`Local development MongoDB URI: ${process.env.MONGODB_URI}`);
const mongoose=(await import('mongoose')).default;await mongoose.connect(process.env.MONGODB_URI);
const {models,Service}=await import('../server/src/models.js');const {services}=await import('../shared/catalog.js');
await Promise.all(Object.values(models).map(m=>m.init()));for(const s of services)await Service.updateOne({slug:s.slug},{$setOnInsert:s},{upsert:true});
const {app}=await import('../server/src/app.js');const server=app.listen(4000,'127.0.0.1',()=>console.log('Local care API ready. Development records: .runtime/mongo'));
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1'],{stdio:'inherit',windowsHide:true});
let stopping=false;const shutdown=async()=>{if(stopping)return;stopping=true;vite.kill();server.close();await mongoose.disconnect();await repl.stop({doCleanup:false});process.exit(0)};
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);vite.on('exit',()=>void shutdown());
