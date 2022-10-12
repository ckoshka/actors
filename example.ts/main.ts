import { glue, Recipient, ServerInputs } from "../glue.ts";

export default async function (inps: ServerInputs) {
	glue<Recipient & { data: string }>(inps, (m) => {
		console.log(m.data);
	});
	await new Promise((resolve) => setTimeout(resolve, 7000));
}
