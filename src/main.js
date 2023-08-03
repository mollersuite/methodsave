import GObject from "gi://GObject"
import Gio from "gi://Gio"
import Gtk from "gi://Gtk?version=4.0"
import Adw from "gi://Adw?version=1"
import { programArgs as ARGV, programInvocationName as BINARY } from "system"
import { build } from "troll"
import "troll/globals.js"
import Interface from "./window.blp" assert { type: "uri" }
import "./icons/about-symbolic.svg" assert { type: "icon" }
import "./icons/adw-external-link-symbolic.svg" assert { type: "icon" }

/** @type {<Type>(arr: Type[]) => Type} */
const random = arr => arr[Math.floor(Math.random() * arr.length)]

const Methodsave = GObject.registerClass(
	{},
	class Methodsave extends Gtk.Application {
		constructor() {
			super({
				application_id: "uk.cetera.Methodsave",
				flags: Gio.ApplicationFlags.FLAGS_NONE,
			})
		}

		// https://stackoverflow.com/questions/44230814/invalid-object-type-when-using-a-custom-widget-in-gtk-builder-ui-file#comment99706251_44230815
		// Invoke `typeof` on all the components we use in Blueprint to workaround "Invalid object type" error
		vfunc_startup() {
			super.vfunc_startup()
			typeof Adw.ApplicationWindow
			typeof Adw.HeaderBar
			typeof Adw.Clamp
			typeof Adw.StatusPage
		}

		vfunc_activate() {
			super.vfunc_activate()

			/*** @type {{window: Gtk.ApplicationWindow, search: Gtk.SearchEntry}} */
			const { window, search } = build(Interface, {
				about: () => {
					/**
					 * I have to reassign the type because there's no typings for libadwaita
					 * @type {Gtk.Window}
					 */
					const about = new Adw.AboutWindow({
						application_name: "Methodsave",
						application_icon: "uk.cetera.Methodsave",
						comments: "All together now",
						developer_name: "Etcetera Development",
						license_type: Gtk.License.GPL_3_0,
						website: "https://github.com/mollersuite/methodsave",
						issue_url: "https://github.com/mollersuite/methodsave/issues",
						support_url: "https://cetera.uk/discord",
					})
					about.set_transient_for(window)
					about.present()
				},
			})
			search.placeholderText = `Search for ${random([
				"ideas",
				"thoughts",
				"articles",
				"bookmarks",
				"posts",
				"quotes",
				"snippets"
			])}...`
			window.set_application(this)
			window.set_icon_name("uk.cetera.Methodsave")
			window.present()
			window.connect("close-request", (win) => win.run_dispose())
		}
	}
)

new Methodsave().run([BINARY].concat(ARGV))
