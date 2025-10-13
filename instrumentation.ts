import { Highlight } from '@highlight-run/next/server'

export function register() {
	Highlight.init({
		projectId: 'zg0y23nd',
		serviceName: 'my-nextjs-backend',
	})
}
