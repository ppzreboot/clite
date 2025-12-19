import { h, app, text } from 'hyperapp'

interface I_state {
	name: string
	year: number
}

export
function Input(node: HTMLDivElement) {
	app<I_state>({
		node,
		init: { name: 'PPz', year: 5 },
		view: (state: I_state) =>
			h('div', {}, [
				h('p', {},
					text(`hello, ${state.name}`)
				)
			])	
		,
	})
}
