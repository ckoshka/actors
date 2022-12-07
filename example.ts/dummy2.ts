import { isA, server } from "../in_out.ts";
import { z } from "https://deno.land/x/zod@v3.19.1/mod.ts";

const DummyMsg = z.object({
	result: z.number(),
});

server((_, send) => {
	for (const i of Array.from({ length: 26 }).map((_, i) => i)) {
		send({ n: i, recipient: "dummy" });
	}
})
	.route(isA(DummyMsg))((m, send) =>
		send({ data: `Result was ${m.result}`, recipient: "main" })
	)
	.run();
