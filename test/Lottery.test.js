const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const {interface,bytecode} = require('../compile');

let lottery;
let accounts;

beforeEach(async()=>{
accounts = await web3.eth.getAccounts();

lottery = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({data:bytecode})
            .send({from:accounts[0],gas:'1000000'});
});

describe('lotterycontract',()=>{

    it('contractDeployed',()=>{
        assert.ok(lottery.options.address);
    });

    it('allowsoneacctoenter', async()=>{
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02','ether')//Converting eth to wei
        })
        const players = await lottery.methods.getPlayers().call({
            from:accounts[0]
        });

        assert.equal(accounts[0],players[0]);//Checking if entry was done successfully
        assert.equal(1,players.length);
    });

    it('allowsmultipleacctoenter', async()=>{
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02','ether')//Converting eth to wei
        })
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02','ether')//Converting eth to wei
        })
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02','ether')//Converting eth to wei
        })
        const players = await lottery.methods.getPlayers().call({
            from:accounts[0]
        });

        assert.equal(accounts[0],players[0]);//Checking if entry was done successfully
        assert.equal(accounts[1],players[1]);
        assert.equal(accounts[2],players[2]);
        assert.equal(3,players.length);
    });

    it('minethertoenter',async()=>{
        try{
        await lottery.methods.enter().send({
            from:accounts[0],
            value: 0 //sending less than minimum to test
        });
        assert(false); //Just to ensure it fails
    }
    catch(err){
        assert(err); //Making sure that there is an error
    }
    });

    it('onlyManagerCanCallPickWinner',async()=>{
        try{
            await lottery.methods.pickWinner().send({
                from:accounts[1]
            });
            assert(false); //If we get to this line then automatically fail
        }
        catch (err){
            assert(err);
        }
    });

    it('endToEndTest',async()=>{
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2','ether')//Converting eth to wei
        })
        
        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({
            from:accounts[0]
        });

        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const diff = finalBalance - initialBalance;
        assert(diff>web3.utils.toWei('1.8','ether')); //1.8 because we are accounting for some gas charge

        players = await lottery.methods.getPlayers().call({
            from:accounts[0]
        });
        assert.equal(0,players.length);
    })
});