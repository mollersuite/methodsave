import Gtk from "gi://Gtk?version=4.0"
import { programInvocationName as BINARY, programArgs as ARGV } from "system"
import GObject from "gi://GObject"
import Gio from "gi://Gio"
import { build } from "troll"
import Interface from "./window.blp" assert { type: "uri" }
import icon from "./icon.svg" assert { type: "uri" }
import "troll/globals.js"

const Methodsave = GObject.registerClass(
	{},
	class Methodsave extends Gtk.Application {
		constructor() {
			super({
				application_id: "uk.cetera.Methodsave",
				flags: Gio.ApplicationFlags.FLAGS_NONE,
			})
		}
		vfunc_activate() {
			super.vfunc_activate()

			/*** @type {{window: Gtk.ApplicationWindow}} */
			const { window } = build(Interface)
			window.set_application(this)
			window.set_icon_name(icon)
			window.present()
			window.connect("close-request", (win) => win.run_dispose())
			console.log("Your icon is: ", window.get_icon_name(), ";uncanny:")
		}
	}
)

new Methodsave().run([BINARY].concat(ARGV))
