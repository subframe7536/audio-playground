import { render } from 'solid-js/web'
import { App } from './App'

import '@unocss/reset/tailwind-compat.css'
import 'uno.css'

render(() => <App />, document.querySelector('#app')!)
