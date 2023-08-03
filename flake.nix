{
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
        default = pkgs.stdenvNoCC.mkDerivation {
          pname = "methodsave";
          version = "0.1.0";
          src = ./.;
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
            gjs --module ${troll}/gjspack/bin/gjspack --appid=uk.cetera.Methodsave --import-map=./src/import_map.json --blueprint-compiler=${lib.getExe pkgs.blueprint-compiler} ./src/main.js $out/bin
            sed --in-place "1s/.*/#!${lib.strings.escape ["/"] (lib.getExe pkgs.gjs)} --module/" $out/bin/uk.cetera.Methodsave
            cp --recursive ./share $out/share
          '';
          meta.mainProgram = "uk.cetera.Methodsave";
          desktopItem = pkgs.makeDesktopItem {
            name = "uk.cetera.Methodsave"; # Filename, not display name
            icon = "uk.cetera.Methodsave";
            exec = "uk.cetera.Methodsave %u";
            desktopName = "Methodsave";
            genericName = "Bookmark Manager";
            comment = "All together now.";
            # dbusActivatable = true;
          };

          postInstall = "cp -r $desktopItem/* $out";
        };
      };
  };
}
