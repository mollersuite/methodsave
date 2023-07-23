import Gtk from "gi://Gtk?version=4.0"
import GLib from "gi://GLib"
import { build } from "troll"
import Interface from "./window.blp" assert { type: "uri" }
import icon from "./icon.svg" assert { type: "uri" }
// TODO: Look into Gtk.Application and Gtk.ApplicationWindow
Gtk.init()
const loop = new GLib.MainLoop(null, false)

/**
 * @type {{window: Gtk.Window}}
 */
const { window } = build(Interface)
window.set_icon_name(icon)
window.present()
window.connect("destroy", () => loop.quit())
window.connect("close-request", (win) => win.run_dispose())
console.log("Your icon is: ", window.get_icon_name(), ";uncanny:")
loop.run()
