import { isA, server } from "../in_out.ts";
import { z } from "https://deno.land/x/zod@v3.19.1/mod.ts";

const Msg = z.object({
	n: z.number(),
});

server()
	.route(isA(Msg))((m, send) =>
		send({ result: m.n + 1, recipient: "dummy2" })
	)
	.run();
