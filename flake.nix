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
        pkgs = nixpkgs.legacyPackages.x86_64-linux;
        lib = pkgs.lib;
      in
      {
        default = pkgs.stdenvNoCC.mkDerivation {
          pname = "methodsave";
          version = "0.1.0";
          src = ./src;
          nativeBuildInputs = [ pkgs.gjs pkgs.gobject-introspection pkgs.wrapGAppsHook ];
          buildInputs = [
            pkgs.gjs
            pkgs.gtk4
            pkgs.libsoup_3
            pkgs.gobject-introspection
          ];
          dontPatchShebangs = true;
          buildPhase = ''
            ln --symbolic ${troll} ./troll
            mkdir $out
            gjs --module ${troll}/gjspack/bin/gjspack --appid=uk.cetera.Methodsave --import-map=import_map.json --blueprint-compiler=${pkgs.blueprint-compiler}/bin/blueprint-compiler ./main.js $out/bin
            sed --in-place "1s/.*/#!${lib.strings.escape ["/"] (lib.getExe pkgs.gjs)} --module/" $out/bin/uk.cetera.Methodsave
          '';
          meta.mainProgram = "uk.cetera.Methodsave";
          desktopItems = [
            (pkgs.makeDesktopItem {
              name = "uk.cetera.Methodsave";
              icon = ./src/icon.svg;
              exec = "uk.cetera.Methodsave %u";
              desktopName = "Methodsave";
              genericName = "Bookmark Manager";
              comment = "All together now.";
              # dbusActivatable = true;
            })
          ];
        };
      };
  };
}
