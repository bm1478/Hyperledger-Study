'use strict';

const { Contract } = require('fabric-contract-api');
class Message extends Contract {
    async initLedger(ctx) {
        const msg = [
            {
                sender: 'inomp',
                receiver: 'fabric',
                message: 'Hello fabric',
                datetime: '2020-06-18 17:00:00'
            },
            {
                sender: 'fabric',
                receiver: 'inomp',
                message: 'Hello inomp!',
                datetime: '2020-06-18 17:01:00'
            }
        ];
        for (let i=0; i<msg.length; i++) {
            await ctx.stub.putState('MSG' + i, Buffer.from(JSON.stringify(msg[i])));
        }
    }

    async createMsg(ctx, key, sender, receiver, message, datetime) {
        const msg = {
            sender,
            receiver,
            message,
            datetime,
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(msg)));
    }

    async queryAllMsgs(ctx) {
        const startKey = 'MSG0';
        const endKey = 'MSG999';
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }
}

module.exports.Message = Message;
module.exports.contracts = [ Message ];
