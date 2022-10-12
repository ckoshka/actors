import { getStdin, resolve, rpc } from "./deps.ts";

type RunCommand = string;
type ActorName = string;
export type ActorDefinitions = Record<ActorName, RunCommand>;

const mainFile = Deno.args[0];
const defs: ActorDefinitions = await getStdin({ exitOnEnter: false }).then(
	JSON.parse,
);
const servers = await Promise.all(
	Object.entries(defs).map(async ([name, cmd]) =>
		[name, await rpc(cmd)] as const
	),
);

const fn = await import(resolve(mainFile)).then((x) => x.default);
fn(servers).then(() => Deno.exit());
