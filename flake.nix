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
    packages.x86_64-linux.default = with import nixpkgs { system = "x86_64-linux"; }; stdenvNoCC.mkDerivation {
      pname = "methodsave";
      version = "0.1.0";
      src = ./src;
      nativeBuildInputs = [ gjs gobject-introspection ];
      buildInputs = [
        gtk4
        gobject-introspection
      ];
      dontPatchShebangs = true;
      buildPhase = ''
        ln --symbolic ${troll} ./troll
        mkdir $out
        gjs --module ${troll}/gjspack/bin/gjspack --appid=uk.cetera.Methodsave --import-map=import_map.json --blueprint-compiler=${blueprint-compiler}/bin/blueprint-compiler ./main.js $out/bin
        sed --in-place "1s/.*/#!${lib.strings.escape ["/"] (toString gjs)}\/bin\/gjs --module/" $out/bin/uk.cetera.Methodsave
      '';
      meta.mainProgram = "uk.cetera.Methodsave";
      desktopItems = [
        (makeDesktopItem {
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
}
