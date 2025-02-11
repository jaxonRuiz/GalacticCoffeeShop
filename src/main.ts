import { mount } from 'svelte'
import './i18n/i18n'
import './app.css'
import './shop.css'
import App from './App.svelte'

const app = mount(App, {
	target: document.getElementById('app')!,
})

export default app
