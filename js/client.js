// client.js

// namespace
var Cookie = {};
	Cookie.Sub = {};

Cookie.Model = {
	"Title": null
};

Cookie.Sub.home = {
	"controller": function() {
		Cookie.Model.Title("Home");
	},
	"view": function() {
		return m("h2", "Welcome to Cookie!");
	}
};

Cookie.Sub.modpacks = {
	"controller": function() {
		Cookie.Model.Title("Modpacks");

		var ctrl = {
			packs: m.prop([ m("div.load", [ m("i.fa.fa-cog.fa-spin.fa-2x"), " Loading..." ]) ])
		};

		m.request({ method: "GET", url: "http://localhost:1343/packs/list", background: true, unwrapSuccess: function(res) {
			return res.packs;
		} }).then(ctrl.packs).then(m.redraw);

		return ctrl;
	},
	"view": function(ctrl) {
		return m("div.pg-modpacks", [
			m("h2", "Modpacks"),
			m("div.packs", [
				ctrl.packs().map(function(pack) {
					if (!pack.title)
						return pack;

					return m("div.pack", [
						m("h5", pack.title),
						m("p", pack.desc),
						m("a", { href: "/pack/" + pack.slug, config: m.route }, m("i.fa.fa-pencil"))
					])
				})
			])
		]);
	}
}

Cookie.Sub.pack = {
	"controller": function() {
		if (m.route.param("pack")) {
			var slug = m.route.param("pack");
			var pack = m.prop({ mods: [] });

			m.request({ method: "GET", url: "http://localhost:1343/packs/" + slug, background: true, unwrapSuccess: function(res) {
				if (res.status == "err") {
					console.err("Somehow tried to get a nonexistant pack... maybe it was deleted?")
					return null;
				}

				Cookie.Model.Title("Editing " + res.pack.title); // resolve title promise

				return res.pack;
			} }).then(pack).then(m.redraw);

			return {
				pack: pack
			}
		} else return {
			pack: null
		}
	},
	"view": function(ctrl) {
		return m("div.pg-pack", [
			m("h2", ctrl.pack().title),
			m("p", ctrl.pack().desc),
			m("hr"),
			m("h3", "Mods ", m("small", "(" + ctrl.pack().mods.length + " total)")),
			m("div.mods", [
				ctrl.pack().mods.map(function(mod) {
					return m("div.mod", [
						m("h5", mod.name),
						m("small", "Hash: ", mod.hash)
					]);
				})
			])
		])
	}
}

Cookie.Sub.default = {
	"controller": function() {
		Cookie.Model.Title("404");
	},
	"view": function() {
		return m("div.404", [
			m("h2", "404"),
			m("p", "Looks like you fell into an End portal. Hit Home and try again.")
		]);
	}
};

Cookie.Nav = {
	"view": function() {
		return m("div.nav-menu", [
			m("h4", "Menu"),
			m("div.menu", [
				m("a.item", { href: "/home", config: m.route }, [
					m("i.fa.fa-home"),
					"Home"
				]),
				m("a.item", { href: "/modpacks", config: m.route }, [
					m("i.fa.fa-archive"),
					"Modpacks"
				]),
				m("a.item", { href: "/settings", config: m.route }, [
					m("i.fa.fa-wrench"),
					"Settings"
				])
			])
		]);
	}
}

Cookie.Main = {
	"controller": function() {
		var title = m.deferred();
		Cookie.Model.Title = title.resolve;

		title.promise.then(function(value) {
			document.title = "Cookie | " + value;
		});

		if (Cookie.Sub[m.route.param("page")] == null)
			return { page: Cookie.Sub.default };

		return {
			page: Cookie.Sub[m.route.param("page")]
		}
	},
	"view": function(ctrl) {
		return m("div.parent", [
			m("div.header", [
				m("h1.title", "Cookie")
			]),
			m("div.content", [
				m("div.nav", Cookie.Nav),
				m("div.page", ctrl.page)
			])
		]);
	}
};

window.onload = function() {
	m.route.mode = "hash";
	m.route(document.body, "/home", {
		"/:page": Cookie.Main,
		"/:page/:pack": Cookie.Main
	});
}
