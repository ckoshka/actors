import { RPCServer } from "./deps.ts";

export type ServerInputs = [string, RPCServer][];
export type Recipient = {
	recipient: string;
};

export const glue = <T extends Recipient & Record<string, unknown>>(
	inps: ServerInputs,
	cb: (m: T) => void,
) => {
	const map: Map<string, RPCServer | undefined> = new Map(inps);

	const send = async (replies: string | undefined) => {
		if (replies === undefined) {
			return;
		}
        for (const reply of replies.split("\n")) {
            if (reply === "") {
                continue;
            }
            const msg = JSON.parse(reply);
            //console.log(msg);
            if (msg.recipient === "main") {
                cb(msg);
                continue;
            }
            const rcv = map.get(msg.recipient);
            if (rcv === undefined) {
                continue;
            }

            await rcv.ask(JSON.stringify(msg)).then(send).catch(() => map.set(msg.recipient, undefined));
        }
	};

	inps.forEach(async ([_, server]) => {
		const reply = await server.ask(
			JSON.stringify({ ready: true, actorNames: inps.map((n) => n[0]) }),
		);
		await send(reply);
	});
};
