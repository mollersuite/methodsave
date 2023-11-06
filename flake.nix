{
  nixConfig.commit-lockfile-summary = "chore: :arrow_up: Update flake.lock";
  inputs = {
    nixpkgs.url = "nixpkgs/nixpkgs-unstable";
    troll = {
      url = "github:sonnyp/troll";
      flake = false;
    };
  };
  outputs = { nixpkgs, self, troll }: {
    # maybe i should be even more explicit
    packages.x86_64-linux =
      let
        pkgs = import nixpkgs {
          system = "x86_64-linux";
        };
        lib = pkgs.lib;
      in
      {
        default = pkgs.stdenvNoCC.mkDerivation (finalAttrs: {
          pname = "methodsave";
          version = "0.0.1";
          src = self;
          nativeBuildInputs = [ pkgs.gjs pkgs.gobject-introspection pkgs.wrapGAppsHook pkgs.blueprint-compiler ];
          buildInputs = [
            pkgs.gjs
            pkgs.gtk4
            pkgs.libadwaita
            pkgs.libsoup_3
            pkgs.gobject-introspection
          ];
          dontPatchShebangs = true;
          buildPhase = ''
            ln --symbolic ${troll} ./src/troll
            mkdir $out
            export version="${finalAttrs.version}"
            export comments="${finalAttrs.meta.description}"
            export homepage="${finalAttrs.meta.homepage}"
            substituteAllInPlace ./src/main.js
            gjs --module ${troll}/gjspack/bin/gjspack ${lib.cli.toGNUCommandLineShell {} {
              appid = "uk.cetera.Methodsave";
              import-map = "./src/import_map.json";
              resource-root="./src";
            }} ./src/main.js $out/bin
            sed --in-place "1s/.*/#!${lib.strings.escape ["/"] (lib.getExe pkgs.gjs)} --module/" $out/bin/uk.cetera.Methodsave
            substituteAllInPlace ./share/dbus-1/services/uk.cetera.Methodsave.service
            cp --recursive ./share $out/share
          '';
          meta = {
            mainProgram = "uk.cetera.Methodsave";
            license = lib.licenses.gpl3Plus;
            description = "Archive and ask questions about everything you Save";
            homepage = "https://cetera.uk/";
            longDescription = builtins.readFile ./README.md;
            changelog = "https://github.com/mollersuite/methodsave/releases/tag/v${finalAttrs.version}";
          };
          desktopItem = pkgs.makeDesktopItem {
            name = "uk.cetera.Methodsave"; # Filename, not display name
            icon = "uk.cetera.Methodsave";
            exec = "uk.cetera.Methodsave %u";
            desktopName = "Methodsave";
            genericName = "Bookmark Manager";
            categories = [ "ArtificialIntelligence" "GNOME" ];
            keywords = [ "Etcetera" ];
            comment = finalAttrs.meta.description;
            # TODO
            dbusActivatable = true;
            startupNotify = true;
          };

          postInstall = "cp -r $desktopItem/* $out";
        });
      };
  };
}
