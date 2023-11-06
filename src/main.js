/// <reference types="gjs/dom" />
import GObject from "gi://GObject"
import Gio from "gi://Gio"
import Gtk from "gi://Gtk?version=4.0"
import Adw from "gi://Adw?version=1"
import GLib from "gi://GLib"
import { programArgs, programInvocationName } from "system"
import { build } from "troll"
import "troll/globals.js"
import Interface from "./window.blp" assert { type: "uri" }
import "./icons/about-symbolic.svg" assert { type: "icon" }
GLib.set_application_name("Methodsave")

/** @type {<Type>(arr: Type[]) => Type} */
const random = arr => arr[Math.floor(Math.random() * arr.length)]

const Methodsave = GObject.registerClass(
	{},
	class Methodsave extends Adw.Application {
		constructor() {
			super({
				application_id: "uk.cetera.Methodsave",
				flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
			})
		}

		vfunc_startup() {
			super.vfunc_startup()
			// https://gjs.guide/guides/gio/dbus.html#gaction, TODO: Use actions instead
			// see also https://developer.gnome.org/documentation/tutorials/search-provider.html
			// also https://github.com/search?q=%22parameter_type%3A+new+GLib.%22&type=code, i need to know how to do this right
			Gio.DBusExportedObject.wrapJSObject(
				`<node>
							<interface name="org.gnome.Shell.SearchProvider2">

								<method name="GetInitialResultSet">
								<arg type="as" name="terms" direction="in" />
								<arg type="as" name="results" direction="out" />
								</method>

								<method name="GetSubsearchResultSet">
								<arg type="as" name="previous_results" direction="in" />
								<arg type="as" name="terms" direction="in" />
								<arg type="as" name="results" direction="out" />
								</method>

								<method name="GetResultMetas">
								<arg type="as" name="identifiers" direction="in" />
								<arg type="aa{sv}" name="metas" direction="out" />
								</method>

								<method name="ActivateResult">
								<arg type="s" name="identifier" direction="in" />
								<arg type="as" name="terms" direction="in" />
								<arg type="u" name="timestamp" direction="in" />
								</method>

								<method name="LaunchSearch">
								<arg type="as" name="terms" direction="in" />
								<arg type="u" name="timestamp" direction="in" />
								</method>

							</interface>
							</node>`,
				{}
			).export(
				Gio.DBus.session,
				"/org/gnome/Shell/SearchProvider2/uk_cetera_Methodsave"
			)
		}

		vfunc_activate() {
			super.vfunc_activate()

			/*** @type {{window: Gtk.ApplicationWindow, search: Gtk.SearchEntry}} */
			const { window, search } = build(Interface, {
				about: () => {
					const about = new Adw.AboutWindow({
						comments: "@comments@",
						version: "@version@",
						website: "@homepage@",
						application_name: "Methodsave",
						application_icon: "uk.cetera.Methodsave",
						developer_name: "Etcetera Development",
						license_type: Gtk.License.GPL_3_0,
						issue_url: "https://github.com/mollersuite/methodsave/issues",
						support_url: "https://cetera.uk/discord",
						developers: [
							"Auxnos https://github.com/auxnos",
							"Bongo https://github.com/poopyhead121",
							"Cluster https://cluster.coolviruses.download",
							"Jack https://jack.cab",
							"Malice https://maliciousmeaning.dev",
							"mau https://github.com/maumaumaumaumaumau",
							"Nick http://github.com/nickk431",
							"split https://me.fyle.uk",
							"Unlinkability https://charlie.land",
							"Wavi https://fur.dev",
							// "jade https://auuub.is-a.dev", // Uncomment when Jade learns JavaScript
						],
						designers: [
							"Jack https://jack.cab",
							"split https://me.fyle.uk",
							// Method's Chat mode was motivated by Dot being nonfree (both price and freedom), iOS-only, and containing off-device language models.
							// We realized Etcetera could compete here due to Methodsave's standardized JSON-LD formats. What if the LLM could simply output JSON-LD?
							"Jason Yuan (indirectly) https://jasonyuan.design",
						],
						documenters: ["Jack https://jack.cab"],
					})
					about.set_transient_for(window)
					about.present()
				}
			})
			search.placeholder_text = `Search for ${random([
				"ideas",
				"thoughts",
				"articles",
				"bookmarks",
				"posts",
				"quotes",
				"snippets",
			])}...`
			window.set_application(this)
			window.set_icon_name("uk.cetera.Methodsave")
			window.present()
			window.connect("close-request", win => win.run_dispose())
		}
	}
)

new Methodsave().run([programInvocationName].concat(programArgs))
