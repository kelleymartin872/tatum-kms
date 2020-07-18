import {Currency, generateWallet} from '@tatumio/tatum';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {dirname} from 'path';
import {AES, enc} from 'crypto-js';
import {v4 as uuid} from 'uuid';
import {homedir} from 'os';

const ensurePathExists = (path: string) => {
    const dir = dirname(path);
    if (!existsSync(dir)) {
        mkdirSync(dir, {recursive: true});
    }
};

export const storeWallet = async (chain: Currency, testnet: boolean, pwd: string, path?: string) => {
    const pathToWallet = path || homedir() + '/.tatumrc/wallet.dat';
    const wallet = await generateWallet(chain, testnet);
    const key = uuid();
    const entry = {[key]: wallet};
    if (!existsSync(pathToWallet)) {
        ensurePathExists(pathToWallet);
        writeFileSync(pathToWallet, AES.encrypt(JSON.stringify(entry), pwd).toString());
    } else {
        const data = readFileSync(pathToWallet, {encoding: 'utf8'});
        let walletData = entry;
        if (data?.length) {
            walletData = {...walletData, ...JSON.parse(AES.decrypt(data, pwd).toString(enc.Utf8))};
        }
        writeFileSync(pathToWallet, AES.encrypt(JSON.stringify(walletData), pwd).toString());
    }
    console.log(JSON.stringify({signatureId: key}, null, 2));
};

export const getWallet = async (id: string, pwd: string, path?: string) => {
    const pathToWallet = path || homedir() + '/.tatumrc/wallet.dat';
    if (!existsSync(pathToWallet)) {
        console.error(JSON.stringify({error: `No such wallet for signatureId '${id}'.`}, null, 2));
        return;
    }
    const data = readFileSync(pathToWallet, {encoding: 'utf8'});
    if (!data?.length) {
        console.error(JSON.stringify({error: `No such wallet for signatureId '${id}'.`}, null, 2));
    }
    const wallet = JSON.parse(AES.decrypt(data, pwd).toString(enc.Utf8));
    if (!wallet[id]) {
        console.error(JSON.stringify({error: `No such wallet for signatureId '${id}'.`}, null, 2));
        return;
    }
    console.log(JSON.stringify(wallet[id], null, 2));
};

export const removeWallet = async (id: string, pwd: string, path?: string) => {
    const pathToWallet = path || homedir() + '/.tatumrc/wallet.dat';
    if (!existsSync(pathToWallet)) {
        console.error(JSON.stringify({error: `No such wallet for signatureId '${id}'.`}, null, 2));
        return;
    }
    const data = readFileSync(pathToWallet, {encoding: 'utf8'});
    if (!data?.length) {
        console.error(JSON.stringify({error: `No such wallet for signatureId '${id}'.`}, null, 2));
    }
    const wallet = JSON.parse(AES.decrypt(data, pwd).toString(enc.Utf8));
    delete wallet[id];
    writeFileSync(pathToWallet, AES.encrypt(JSON.stringify(wallet), pwd).toString());
};