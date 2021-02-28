const net = require("net");

const server = net.createServer((c) => {
    let DB = {};

    console.log("client connected");
    c.on("end", () => {
        console.log("client disconnected");
    });

    let parse = (buffer) => {
        let tokens = buffer.toString().split(" ");
        if (tokens.length === 1) {
            let action = tokens[0].toString().replace(/\r?\n|\r/, "");
            if (action === 'open' || action === 'add' || action === 'process')
                return [action, undefined, undefined];
        } else if (tokens.length === 2) {
            let action = tokens[0].toString().replace(/\r?\n|\r/, "");
            let orderToken = tokens[1].toString().replace(/\r?\n|\r/, "");
            if (action === "open" || action === 'add' || action === "process")
                return [action, orderToken, undefined];
        } else if (tokens.length === 3) {
            let action = tokens[0].toString().replace(/\r?\n|\r/, "");
            let orderToken = tokens[1].toString().replace(/\r?\n|\r/, "");
            let value = tokens[2].toString().replace(/\r?\n|\r/, "");
            if (action === "add")
                return [action, orderToken, value];
        }
        return [undefined, undefined, undefined];
    }

    let process = (action, token, value) => {
        if (action !== 'open' && action !== 'add' && action !== 'process')
            return "commands: open, add, process";
        if (token === undefined)
            return "order token not specified";

        if (action === "open") {
            if (token in DB) return "order already exists";
            DB[token] = [];
            return "opened";
        }
        if (!(token in DB))
            return "open order first";
        if (action === "add") {
            if (value === undefined) return 'value not specified';
            DB[token].push(value);
            return "added " + value;
        }
        if (action === "process") {
            if (DB[token].length === 0) return "nothing to process";
            let message = "processed: ";
            for (let i = 0; i < DB[token].length; i++)
                message += DB[token][i] + " ";
            DB[token] = [];
            return message;
        }
    }

    c.on("data", (buffer) => {
        let [action, token, value] = parse(buffer);
        c.write(process(action, token, value) + "\n");
    });
});
server.on("error", (err) => {
    throw err;
});
server.listen(8124, () => {
    console.log("server bound");
});