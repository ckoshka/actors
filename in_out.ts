
// todo: multiple paths

import { readerFromStreamReader, readLines, z } from "./deps.ts";

export type Path<T> = [
	(m: unknown) => m is T,
	(data: T, send: (a0: unknown) => void) => unknown,
];

export const ReadyMsg = z.object({
	ready: z.boolean(),
	actorNames: z.array(z.string()),
});

export const isA = <T extends z.ZodObject<z.ZodRawShape>>(validatorObj: T) => {
	return (obj: unknown): obj is z.infer<T> =>
		validatorObj.safeParse(obj).success === true;
};

export const server = (
	onReady: (
		data: { ready: true; actorNames: string[] },
		send: (a0: unknown) => void,
	) => unknown = (_, send) => { send("hi") },
	// deno-lint-ignore no-explicit-any
	paths: Path<any>[] = [],
) => {
	return {
		route: <T>(isTypeFn: Path<T>[0]) =>
			(handlerFn: Path<T>[1]) =>
				server(onReady, [...paths, [isTypeFn, handlerFn]]),
		run: async () => {
			paths = [[isA(ReadyMsg), onReady], ...paths];

			outerloop: for await (
				const line of readLines(
					readerFromStreamReader(Deno.stdin.readable.getReader()),
				)
			) {
				const msg = JSON.parse(line);
				for (const path of paths) {
					if (path[0](msg)) {
						await path[1](msg, (result) => {
							try {
								console.log(JSON.stringify(result));
							} catch {
								Deno.exit();
							}
						});
                        continue outerloop;
					}
				}
                console.error(`None of the paths for this message matched:`, line, msg);
			}
		},
	};
};
