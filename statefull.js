const net = require('net');

const server = net.createServer((c) => {
    let isOpened = false;
    let items = [];

    console.log('client connected');
    c.on('end', () => {
        console.log('client disconnected');
    });

    let parse = (buffer) => {
        let tokens = buffer.toString().split(" ");
        if (tokens.length === 1) {
            let firstToken = tokens[0].toString().replace(/\r?\n|\r/, "");
            if (firstToken === 'open' || firstToken === 'process')
                return [firstToken, undefined];
        } else if (tokens.length === 2) {
            let firstToken = tokens[0].toString().replace(/\r?\n|\r/, "");
            let secondToken = tokens[1].toString().replace(/\r?\n|\r/, "");
            if (firstToken === 'add')
                return [firstToken, secondToken];
        }
        return [undefined, undefined];
    }

    let process = (action, value) => {
        if (action !== 'open' && action !== 'add' && action !== 'process') {
            return 'commands: open, add, process';
        } else if (action === 'open') {
            if (isOpened) {
                return 'order is already opened';
            } else {
                isOpened = true;
                return 'opened';
            }
        } else if (!isOpened) {
            return 'open order first';
        } else if (action === 'add') {
            items.push(value);
            return `added ${value}`;
        } else if (action === 'process') {
            if (items.length === 0) {
                return 'nothing to process';
            }
            let message = 'processed: ';
            for (let i = 0; i < items.length; i++) {
                message += items[i] + ' ';
            }
            items = [];
            return message;
        }
    }

    c.on('data', (buffer) => {
        let [action, value] = parse(buffer);
        c.write(process(action, value) + '\n');
    });
});
server.on('error', (err) => {
    throw err;
});
server.listen(8124, () => {
    console.log('server bound');
});